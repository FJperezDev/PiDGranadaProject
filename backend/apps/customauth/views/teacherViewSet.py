from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import CustomTeacher
from ..serializers import CustomTeacherSerializer, CustomTeacherManageSerializer, CustomTeacherInviteSerializer 
from ...utils.permissions import IsSuperTeacher
from rest_framework.decorators import action

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
    
    # @action(detail=False, methods=['post'], url_path='invite', permission_classes=[IsSuperTeacher])
    # def invite(self, request):
    #     """
    #     Permite a SuperTeacher crear un usuario con una contraseña temporal 
    #     sin pasar por las validaciones de complejidad de Django.
    #     Endpoint: POST /users/invite/
    #     """
    #     serializer = CustomTeacherInviteSerializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)
        
    #     # El método create del serializer creará el usuario y hasheará la contraseña
    #     user = serializer.save()

    #     response_serializer = CustomTeacherSerializer(user, context={'request': request})
    #     return Response(response_serializer.data, status=status.HTTP_201_CREATED)