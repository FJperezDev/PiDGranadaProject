from rest_framework import serializers
from ..models import CustomTeacher

class CustomTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomTeacher
        fields = ['id', 'username', 'email', 'role']
        read_only_fields = ['id']
