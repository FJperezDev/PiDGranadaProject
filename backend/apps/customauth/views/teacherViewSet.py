from rest_framework import viewsets, permissions

from ..models import CustomTeacher
from ..serializers import CustomTeacherSerializer
from ...utils.permissions import IsSuperTeacher
# Create your views here.

"""
TeacherViewSet is a Django REST Framework ModelViewSet for managing CustomTeacher instances.
By default, ModelViewSet provides the following actions:
    - list: Retrieves a list of all user instances.
    - retrieve: Retrieves a single user instance by primary key.
    - create: Creates a new user instance.
    - update: Updates an existing user instance (full or partial update).
    - destroy: Deletes a user instance.
"""
class TeacherViewSet(viewsets.ModelViewSet):

    queryset = CustomTeacher.objects.all()
    serializer_class = CustomTeacherSerializer
    permission_classes = [IsSuperTeacher]
    
    def get_queryset(self):
        queryset = CustomTeacher.objects.all()
        username = self.request.query_params.get('username', None)
        email = self.request.query_params.get('email', None)
        is_super = self.request.query_params.get('is_super', None)

        if username:
            queryset = queryset.filter(username__icontains=username)
        if email:
            queryset = queryset.filter(email__icontains=email)
        if is_super:
            queryset = queryset.filter(is_super__icontains=is_super)
            
        return queryset