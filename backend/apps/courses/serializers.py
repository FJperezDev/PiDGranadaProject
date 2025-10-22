from rest_framework import serializers
from .models import Subject, StudentGroup, TeacherMakeChangeStudentGroup
from ..customauth.models import CustomTeacher as Teacher


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['id', 'username', 'email', 'is_super']


class StudentGroupSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source='subject', write_only=True
    )
    teacher = TeacherSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), source='teacher', write_only=True
    )

    class Meta:
        model = StudentGroup
        fields = ['id', 'subject', 'subject_id', 'name_es', 'name_en', 'teacher', 'teacher_id']


class TeacherMakeChangeStudentGroupSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    group = StudentGroupSerializer(read_only=True)

    class Meta:
        model = TeacherMakeChangeStudentGroup
        fields = '__all__'