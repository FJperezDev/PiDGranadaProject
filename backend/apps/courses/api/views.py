# Create your views here.

from django.forms import ValidationError
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Subject, StudentGroup, TeacherMakeChangeStudentGroup
from .serializers import SubjectSerializer, StudentGroupSerializer, TeacherMakeChangeStudentGroupSerializer
from apps.courses.domain import services, selectors
from apps.content.domain import selectors as content_selectors
from apps.courses.domain import selectors as courses_selectors
from apps.content.api.serializers import TopicSerializer
from apps.utils.permissions import BaseContentViewSet
from apps.utils.audit import makeChanges

class SubjectViewSet(BaseContentViewSet):
    queryset = selectors.get_all_subjects()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny] # Allow any access for now

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            subject = services.create_subject(
                name_es=data.get('name_es'),
                name_en=data.get('name_en'),
                description_es=data.get('description_es'),
                description_en=data.get('description_en'),
                teacher=request.user
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(subject)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        
        subject = services.update_subject(
            subject=selectors.get_subject_by_id(kwargs['pk']),
            name_es=request.data.get('name_es'),
            name_en=request.data.get('name_en'),
            description_es=request.data.get('description_es'),
            description_en=request.data.get('description_en'),
            teacher=request.user
        )
        return Response(self.get_serializer(subject).data, status=status.HTTP_200_OK)
    
    def delete(self, request, *args, **kwargs):
        return services.delete_subject(selectors.get_subject_by_id(kwargs['pk']), teacher=request.user)


    @action(detail=True, methods=['get'], )
    def topics(self, request, pk=None):
        """GET /subject/<id>/topics/"""
        queryset = (
            selectors.get_topics_by_subject(subject_id=pk)
        )
        serializer = TopicSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @topics.mapping.post
    def link_topic(self, request, pk=None):
        """POST /subjects/<id>/topics/ — asocia un concepto al topic"""
        subject = selectors.get_subject_by_id(subject_id=pk)
        data = request.data
        topic_name = data.get('topic_name')
        topic = content_selectors.get_topic_by_title(title=topic_name)
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
        topic = content_selectors.get_topic_by_title(title=topic_name)
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
    
    @topics.mapping.put
    def change_topic_order(self, request, pk=None):
        """PUT /subjects/<id>/topics/ — asocia un topic a la subject"""
        subject = selectors.get_subject_by_id(subject_id=pk)
        data = request.data
        topicA = content_selectors.get_topic_by_title(title=data.get('topicA'))
        topicB = content_selectors.get_topic_by_title(title=data.get('topicB'))
        relationA = courses_selectors.get_subject_topic_relation_by_both(subject=subject, topic=topicA)
        relationB = courses_selectors.get_subject_topic_relation_by_both(subject=subject, topic=topicB)
        if not relationA or not relationB:
            return Response({'detail': 'At least one relation is not found'}, status=status.HTTP_404_NOT_FOUND)
        
        services.swap_order(relationA, relationB)

        return Response({
            'message': 'Order swapped successfully',
            'topicA': TopicSerializer(topicA, context={'request': request}).data,
            'topicB': TopicSerializer(topicB, context={'request': request}).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post', 'delete'], url_path='groups')
    def groups(self, request, pk=None):
        """GET /subjects/<id>/groups/ — obtiene los grupos asociados a la asignatura
           POST /subjects/<id>/groups/ — crea un grupo asociado a la asignatura"""
        if request.method == 'GET':
            subject = selectors.get_subject_by_id(subject_id=pk)
            if not subject:
                return Response({'detail': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)

            groups = selectors.get_all_student_groups()
            serializer = StudentGroupSerializer(groups, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            subject = selectors.get_subject_by_id(subject_id=pk)
            if not subject:
                return Response({'detail': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)
            group = services.create_student_group(
                subject=subject,
                name_es=request.data.get('name_es'),
                name_en=request.data.get('name_en'),
                teacher=request.user
            )
            serializer = StudentGroupSerializer(group, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        elif request.method == 'DELETE':
            subject = selectors.get_subject_by_id(subject_id=pk)
            services.delete_student_groups_by_subject(subject)
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get', 'put', 'delete'], url_path='groups/(?P<group_pk>[^/.]+)')
    def group_detail(self, request, pk=None, group_pk=None):
        """GET /subjects/<id>/groups/<id>/ — obtiene un grupo específico.
           PUT /subjects/<id>/groups/<id>/ — actualiza un grupo asociado a la asignatura
           DELETE /subjects/<id>/groups/<id>/ — elimina un grupo."""
        group = selectors.get_student_group_by_id(group_id=group_pk)
        if not group or group.subject.id != int(pk):
            return Response({'detail': 'Group not found in this subject'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = StudentGroupSerializer(group, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == 'PUT':
            group = services.update_student_group(group, teacher=request.user, **request.data)
            serializer = StudentGroupSerializer(group, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == 'DELETE':
            services.delete_student_group(group, teacher=request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)

class StudentGroupViewSet(BaseContentViewSet):
    queryset = selectors.get_all_student_groups()
    serializer_class = StudentGroupSerializer