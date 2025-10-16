from rest_framework import viewsets, permissions

from ..models import CustomUser
from ..serializers import CustomUserSerializer
from ..permissions import RolePermission

# Create your views here.

"""
UserViewSet is a Django REST Framework ModelViewSet for managing CustomUser instances.
By default, ModelViewSet provides the following actions:
    - list: Retrieves a list of all user instances.
    - retrieve: Retrieves a single user instance by primary key.
    - create: Creates a new user instance.
    - update: Updates an existing user instance (full or partial update).
    - destroy: Deletes a user instance.
"""
class UserViewSet(viewsets.ModelViewSet):

    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def get_permissions(self):
        action_roles = {
            'list': {'superadmin', 'admin'},
            'retrieve': 'any',
            'create': {'superadmin'},
            'update': {'superadmin', 'admin'},
            'partial_update': {'superadmin'},
            'destroy': {'superadmin'},
        }

        roles = action_roles.get(self.action, None)
        if isinstance(roles, set):
            return [RolePermission(roles)]
        else:
            return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        queryset = CustomUser.objects.all()
        username = self.request.query_params.get('username', None)
        email = self.request.query_params.get('email', None)
        role = self.request.query_params.get('role', None)

        # if role not in {'admin', 'superadmin'}:
        #     return CustomUser.objects.none()
        if username:
            queryset = queryset.filter(username__icontains=username)
        if email:
            queryset = queryset.filter(email__icontains=email)
            
        return queryset