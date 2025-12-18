from apps.content.domain import selectors as content_selectors
from apps.courses.domain import selectors as courses_selectors
from apps.evaluation.domain import selectors as evaluation_selectors
from apps.utils.permissions import IsSuperTeacher

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse
from django.conf import settings
from django.utils import timezone

import os
import datetime

from .models import BackupFile
from .serializers import BackupFileSerializer
from .utils import generate_excel_backup, restore_excel_backup, import_content_from_excel

class BackupViewSet(viewsets.ModelViewSet):
    """
    Endpoints para gestión de backups.
    Incluye sincronización automática con el sistema de archivos.
    """
    queryset = BackupFile.objects.all()
    serializer_class = BackupFileSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsSuperTeacher] # Asegurar permisos

    def _sync_filesystem_backups(self):
        """
        Método privado para sincronizar la carpeta física con la base de datos.
        1. Detecta archivos en disco que no están en DB -> Los crea como 'Auto'.
        2. Detecta registros en DB que no están en disco -> Los borra.
        """
        backup_dir = os.path.join(settings.MEDIA_ROOT, 'backups')
        
        # Asegurar que el directorio existe
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir, exist_ok=True)

        # 1. Obtener archivos físicos
        try:
            physical_files = [f for f in os.listdir(backup_dir) if f.endswith('.xlsx')]
        except FileNotFoundError:
            physical_files = []

        # 2. Obtener archivos conocidos en DB (solo el nombre base)
        # file.name suele guardar 'backups/archivo.xlsx', queremos solo 'archivo.xlsx'
        db_backups = BackupFile.objects.all()
        db_files_map = {os.path.basename(b.file.name): b for b in db_backups}

        # --- A. REGISTRAR NUEVOS (SISTEMA) ---
        for filename in physical_files:
            if filename not in db_files_map:
                # Es un archivo nuevo (ej: puesto por un cronjob)
                file_path = os.path.join(backup_dir, filename)
                
                # Intentamos obtener la fecha de creación del archivo real
                try:
                    timestamp = os.path.getctime(file_path)
                    created_date = datetime.datetime.fromtimestamp(timestamp, tz=timezone.get_current_timezone())
                except Exception:
                    created_date = timezone.now()

                # Creamos el registro en DB
                # Nota: Django FileField espera la ruta relativa desde MEDIA_ROOT
                relative_path = os.path.join('backups', filename)
                
                backup_obj = BackupFile.objects.create(
                    file=relative_path,
                    is_auto_generated=True, # <--- IMPORTANTE: Lo marcamos como automático
                )
                # Forzamos la fecha real del archivo (si no, pondría 'ahora')
                backup_obj.created_at = created_date
                backup_obj.save()

        # --- B. LIMPIAR HUÉRFANOS (Borrar de DB si no existen en disco) ---
        for filename, backup_obj in db_files_map.items():
            full_path = os.path.join(settings.MEDIA_ROOT, backup_obj.file.name)
            if not os.path.exists(full_path):
                # El archivo físico no existe, borramos la referencia en DB
                # Usamos .delete() del queryset para no disparar el borrado de archivo os.remove (que fallaría)
                BackupFile.objects.filter(id=backup_obj.id).delete()

    def list(self, request, *args, **kwargs):
        """
        Sobreescribimos list para sincronizar antes de devolver la respuesta.
        """
        self._sync_filesystem_backups()
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        try:
            # Generamos el backup on-demand (Manual)
            backup = generate_excel_backup(is_auto=False)
            serializer = self.get_serializer(backup)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": f"Error generando backup: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='import-content')
    def import_content(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No se proporcionó ningún archivo."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            import_content_from_excel(file_obj, teacher=request.user)
            return Response(
                {"status": "success", "message": "Contenido importado correctamente."}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Error importando contenido: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        try:
            restore_excel_backup(pk)
            return Response(
                {"status": "success", "message": "Base de datos restaurada correctamente."}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        try:
            backup = self.get_object()
            if not backup.file:
                return Response({"error": "El archivo no existe."}, status=status.HTTP_404_NOT_FOUND)

            file_path = backup.file.path
            if not os.path.exists(file_path):
                 return Response({"error": "Archivo físico no encontrado en el servidor."}, status=status.HTTP_404_NOT_FOUND)

            response = FileResponse(open(file_path, 'rb'), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            filename = os.path.basename(file_path)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AuditViewSet(viewsets.ViewSet):
    permission_classes = [IsSuperTeacher]
    
    @action(detail=False, methods=['get'], url_path='changes')
    def get_changes(self, request):
        courses_changes = courses_selectors.get_all_changes()
        content_changes = content_selectors.get_all_changes()
        evaluation_changes = evaluation_selectors.get_all_changes()

        all_changes = sorted(
            list(courses_changes + content_changes + evaluation_changes),
            key=lambda change: change.created_at,
            reverse=True
        )

        serialized_changes = []
        for change in all_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='questions')
    def get_questions_changes(self, request):
        questions_changes = evaluation_selectors.get_all_question_changes()
        serialized_changes = []
        for change in questions_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='questions/(?P<question_id>[^/.]+)/answers')
    def get_answers_changes(self, request, question_id: int):
        answers_changes = evaluation_selectors.get_answer_changes(question_id)
        serialized_changes = []
        for change in answers_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)

    @action(detail=False, methods=['get'], url_path='concepts')
    def get_concepts_changes(self, request):
        concepts_changes = content_selectors.get_all_concept_changes()
        serialized_changes = []
        for change in concepts_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='topics')
    def get_topics_changes(self, request):
        topics_changes = content_selectors.get_all_topic_changes()
        serialized_changes = []
        for change in topics_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='topics/(?P<topic_id>[^/.]+)/epigraphs')
    def get_epigraphs_changes(self, request, topic_id: int):
        epigraphs_changes = content_selectors.get_all_epigraph_changes(topic_id=topic_id)
        serialized_changes = []
        for change in epigraphs_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='groups')
    def get_groups_changes(self, request):
        groups_changes = courses_selectors.get_all_changes()
        serialized_changes = []
        for change in groups_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)
    
    @action(detail=False, methods=['get'], url_path='subjects')
    def get_subjects_changes(self, request):
        subjects_changes = courses_selectors.get_all_changes()
        serialized_changes = []
        for change in subjects_changes:
            serialized_changes.append({
                change.__str__()
            })
        return Response(serialized_changes)