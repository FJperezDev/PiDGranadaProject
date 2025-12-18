from apps.content.domain import selectors as content_selectors
from apps.courses.domain import selectors as courses_selectors
from apps.evaluation.domain import selectors as evaluation_selectors

from apps.utils.permissions import IsSuperTeacher
from .models import BackupFile
from .serializers import BackupFileSerializer
from .utils import generate_excel_backup, restore_excel_backup

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import BackupFile
from .serializers import BackupFileSerializer
from .utils import generate_excel_backup, restore_excel_backup, import_content_from_excel
from rest_framework.parsers import MultiPartParser, FormParser

from django.http import FileResponse
import os

from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
from apps.customauth.serializers import CustomTeacherInviteSerializer

class BackupViewSet(viewsets.ModelViewSet):
    """
    Endpoints:
    GET /backups/          -> Lista backups (getBackups)
    POST /backups/         -> Genera nuevo backup (generateBackup)
    DELETE /backups/{id}/  -> Borra backup (deleteBackup)
    POST /backups/{id}/restore/ -> Restaura backup (restoreBackup)
    """
    queryset = BackupFile.objects.all()
    serializer_class = BackupFileSerializer

    parser_classes = (MultiPartParser, FormParser)
    # Sobreescribimos create para mapear "POST /backups/" a la lógica de generar Excel
    def create(self, request, *args, **kwargs):
        try:
            # Generamos el backup on-demand
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
        """
        Endpoint para subir un Excel y cargar contenido masivo (Subjects, Topics, etc.)
        mimicando el script de carga.
        """
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No se proporcionó ningún archivo."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Llamamos a la función de utilidad
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
        """Restaura la base de datos a partir de este archivo Excel"""
        try:
            # Llamamos a la utilidad que hace el trabajo sucio
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
        """
        Descarga segura del archivo de backup.
        GET /backups/{id}/download/
        """
        try:
            backup = self.get_object()
            if not backup.file:
                return Response({"error": "El archivo no existe."}, status=status.HTTP_404_NOT_FOUND)

            file_path = backup.file.path
            if not os.path.exists(file_path):
                 return Response({"error": "Archivo físico no encontrado en el servidor."}, status=status.HTTP_404_NOT_FOUND)

            # FileResponse se encarga de abrir y streamear el archivo de forma eficiente
            response = FileResponse(open(file_path, 'rb'), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            
            # Forzar la descarga con el nombre correcto
            filename = os.path.basename(file_path)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InviteUserView(APIView):
    # Solo usuarios autenticados pueden invitar
    permission_classes = [IsSuperTeacher] 

    def post(self, request):
        # 1. Seguridad: Verificar si el usuario que invita es SuperAdmin
        if not request.user.is_super:
             return Response(
                 {'detail': 'No tienes permisos para invitar usuarios.'}, 
                 status=status.HTTP_403_FORBIDDEN
             )

        # 2. Validar datos con tu Serializer existente
        serializer = CustomTeacherInviteSerializer(data=request.data)
        
        if serializer.is_valid():
            # Guardamos el usuario (se crea en DB)
            user = serializer.save()
            
            # Recupertamos la contraseña original (sin hashear) que viene del request
            # para enviarla por correo.
            raw_password = request.data.get('password')
            
            # 3. Lógica de Envío de Correo
            asunto = 'Bienvenido a la Plataforma - Tus credenciales'
            mensaje = f"""
            Hola {user.username},

            El administrador te ha invitado a unirte a la plataforma.
            
            Tus credenciales de acceso son:
            Email: {user.email}
            Contraseña temporal: {raw_password}

            Por favor, inicia sesión y cambia tu contraseña lo antes posible.
            """
            
            try:
                send_mail(
                    subject=asunto,
                    message=mensaje,
                    from_email=settings.EMAIL_HOST_USER, # Remitente configurado en settings
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                email_status = "Correo enviado correctamente."
            except Exception as e:
                print(f"Error enviando correo: {e}")
                email_status = "Usuario creado, pero falló el envío del correo."

            return Response({
                'message': f'Usuario creado exitosamente. {email_status}',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
