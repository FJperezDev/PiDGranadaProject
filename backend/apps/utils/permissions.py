from rest_framework import permissions
from rest_framework import viewsets

class BaseContentViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if(self.request.method in ['DELETE']):
            permission_classes = [IsSuperTeacher]
        elif(self.action in ['list', 'retrieve'] or self.request.method == 'GET'):
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsTeacher]
        return [perm() for perm in permission_classes]

class IsSuperTeacher(permissions.BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return user and user.is_authenticated and (
            user.is_super
        )

class IsTeacher(permissions.BasePermission):
    """Permite lectura a cualquiera, escritura solo a profesores."""
    def has_permission(self, request, view):
        user = request.user
        return user and user.is_authenticated
    
