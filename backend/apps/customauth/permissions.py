from rest_framework import permissions

class RolePermission(permissions.BasePermission):
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def has_permission(self, request, view):
        user = request.user
        return user and user.is_authenticated and (
            user.role in self.allowed_roles or user.is_superuser
        )

class IsTeacherOrReadOnly(permissions.BasePermission):
    """Permite lectura a cualquiera, escritura solo a profesores."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True  # lectura para todos
        return request.user and hasattr(request.user, 'is_teacher') and request.user.is_teacher

class IsSuperTeacherOrReadOnly(permissions.BasePermission):
    """Permite borrar solo a superteachers, lectura para todos."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS or request.method in ['POST', 'PUT', 'PATCH']:
            return True  # lectura/edición según otra capa
        # DELETE
        return request.user and hasattr(request.user, 'is_super') and request.user.is_super