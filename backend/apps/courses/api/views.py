# Create your views here.

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Subject, StudentGroup, TeacherMakeChangeStudentGroup
from .serializers import SubjectSerializer, StudentGroupSerializer, TeacherMakeChangeStudentGroupSerializer
from ..domain import services, selectors
from ...content.api.serializers import TopicSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            subject = services.create_subject(
                name_es=data.get('name_es'),\
                name_en=data.get('name_en'),
                description_es=data.get('description_es'),
                description_en=data.get('description_en')
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(subject)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], )
    def topics(self, request, pk=None):
        print("Dentro de concepts")
        """GET /topics/<id>/concepts/"""
        queryset = services.get_topics_by_subject(subject_id=pk)
        serializer = TopicSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @topics.mapping.post
    def link_topic(self, request, pk=None):
        """POST /subjects/<id>/topics/ — asocia un concepto al topic"""
        subject = selectors.get_subject_by_id(subject_id=pk)
        data = request.data
        topic_name = data.get('topic_name')
        topic = selectors.get_topic_by_title(title=topic_name)
        if not topic:
            return Response({'detail': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
        order_id = data.get('order_id')

        try:
            link = services.link_topic_to_subject(
                subject=subject,
                topic=topic,
                order_id=order_id
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Topic linked to subject successfully',
            'subject': subject.id,
            'topic_id': topic.id,
            'order_id': link.order_id
        }, status=status.HTTP_200_OK)
    
    @topics.mapping.delete
    def unlink_topic(self, request, pk=None):
        """DELETE /subjects/<id>/topics/ — asocia un topic a la subject"""
        subject = selectors.get_subject_by_id(subject_id=pk)
        data = request.data
        topic_name = data.get('topic_name')
        topic = selectors.get_topic_by_title(title=topic_name)
        if not topic:
            return Response({'detail': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
        order_id = data.get('order_id')

        try:
            link = services.unlink_topic_from_subject(
                topic=topic,
                subject=subject
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': 'Topic linked to subject removed successfully',
            'topic_id': topic.id,
            'subject_id': subject.id
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='groups')
    def create_group(self, request, pk=None):
        """POST /subjects/<id>/groups/ — crea un grupo asociado a la asignatura"""
        subject = selectors.get_subject_by_id(subject_id=pk)
        if not subject:
            return Response({'detail': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentGroupSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        group = serializer.save(subject=subject)

        # Registrar el cambio hecho por el profesor (similar a perform_create en StudentGroupViewSet)
        teacher = getattr(request.user, 'teacher', None)
        TeacherMakeChangeStudentGroup.objects.create(
            group=group,
            subject=group.subject,
            teacher=teacher,
            action='created',
        )

        return Response(StudentGroupSerializer(group, context={'request': request}).data, status=status.HTTP_201_CREATED)

class StudentGroupViewSet(viewsets.ModelViewSet):
    queryset = StudentGroup.objects.select_related('subject', 'teacher').all()
    serializer_class = StudentGroupSerializer

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