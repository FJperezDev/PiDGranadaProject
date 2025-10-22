from rest_framework import permissions

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