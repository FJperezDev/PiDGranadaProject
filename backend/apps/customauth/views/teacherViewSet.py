import os
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import CustomTeacher
from ..serializers import CustomTeacherSerializer, CustomTeacherManageSerializer, CustomTeacherInviteSerializer 
from ...utils.permissions import IsSuperTeacher
from rest_framework.decorators import action

from apps.utils.permissions import IsSuperTeacher
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from apps.customauth.serializers import CustomTeacherInviteSerializer

class TeacherViewSet(viewsets.ModelViewSet):

    queryset = CustomTeacher.objects.all()
    serializer_class = CustomTeacherSerializer
    permission_classes = [IsSuperTeacher]
    
    def get_serializer_class(self):
        # Usar el serializer de gestión para las operaciones que permiten establecer is_super y password.
        if self.action in ['create', 'update', 'partial_update']:
            return CustomTeacherManageSerializer 
        return super().get_serializer_class()

    def get_queryset(self):
        queryset = CustomTeacher.objects.all()
        username = self.request.query_params.get('username', None)
        email = self.request.query_params.get('email', None)
        is_super = self.request.query_params.get('is_super', None)

        if username:
            queryset = queryset.filter(username__icontains=username)
        if email:
            queryset = queryset.filter(email__icontains=email)
        
        # Filtrado por is_super
        if is_super in ['true', 'false']:
            is_super_bool = is_super == 'true'
            queryset = queryset.filter(is_super=is_super_bool)
            
        return queryset

    # La lógica de CREATE y UPDATE es manejada automáticamente y de forma segura 
    # por los métodos .create() y .update() definidos en CustomTeacherManageSerializer.

    def destroy(self, request, pk=None):
        """
        Permite a un SuperTeacher eliminar a otro usuario, pero no a sí mismo.
        """
        user_to_delete = get_object_or_404(self.get_queryset(), pk=pk)
        
        # CRÍTICO: Impedir la auto-destrucción
        if user_to_delete == request.user:
             return Response({'detail': 'No puedes eliminar tu propia cuenta de SuperTeacher.'}, status=status.HTTP_400_BAD_REQUEST)

        user_to_delete.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'], permission_classes=[IsSuperTeacher])
    def invite(self, request):
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

            email = EmailMultiAlternatives(
                subject=asunto,
                body=mensaje,
                from_email=settings.EMAIL_HOST_USER,
                to=[user.email]
            )

            apk_dir = os.path.join(settings.MEDIA_ROOT, 'apks')

            teacher_apk = os.path.join(apk_dir, 'teacher.apk')
            if os.path.exists(teacher_apk):
                email.attach_file(teacher_apk)
            else:
                print(f"⚠️ Alerta: No se encontró {teacher_apk}")

            student_apk = os.path.join(apk_dir, 'student.apk')
            if os.path.exists(student_apk):
                email.attach_file(student_apk)
            else:
                print(f"⚠️ Alerta: No se encontró {student_apk}")
            
            try:
                email.send(fail_silently=False)
                email_status = "Correo enviado con APKs."
            except Exception as e:
                print(f"Error enviando correo: {e}")
                email_status = "Usuario creado, pero falló el envío del correo."

            return Response({
                'message': f'Usuario creado exitosamente. {email_status}',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
