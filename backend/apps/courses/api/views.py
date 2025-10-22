# Create your views here.

from rest_framework import viewsets
from .models import Subject, StudentGroup, TeacherMakeChangeStudentGroup
from .serializers import SubjectSerializer, StudentGroupSerializer, TeacherMakeChangeStudentGroupSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class StudentGroupViewSet(viewsets.ModelViewSet):
    queryset = StudentGroup.objects.select_related('subject', 'teacher').all()
    serializer_class = StudentGroupSerializer

    # Si tu sistema maneja usuarios autenticados como "Teacher",
    # puedes registrar el teacher automáticamente aquí
    def perform_create(self, serializer):
        group = serializer.save()
        teacher = getattr(self.request.user, 'teacher', None)
        TeacherMakeChangeStudentGroup.objects.create(
            group=group,
            subject=group.subject,
            teacher=teacher,
            action='created',
            name_es=group.name_es,
            name_en=group.name_en,
        )

    def perform_update(self, serializer):
        group = serializer.save()
        teacher = getattr(self.request.user, 'teacher', None)
        TeacherMakeChangeStudentGroup.objects.create(
            group=group,
            subject=group.subject,
            teacher=teacher,
            action='updated',
            name_es=group.name_es,
            name_en=group.name_en,
        )

    def perform_destroy(self, instance):
        teacher = getattr(self.request.user, 'teacher', None)
        TeacherMakeChangeStudentGroup.objects.create(
            group=instance,
            subject=instance.subject,
            teacher=teacher,
            action='deleted',
            name_es=instance.name_es,
            name_en=instance.name_en,
        )
        instance.delete()


class TeacherMakeChangeStudentGroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeacherMakeChangeStudentGroup.objects.select_related('group', 'teacher', 'subject')
    serializer_class = TeacherMakeChangeStudentGroupSerializer