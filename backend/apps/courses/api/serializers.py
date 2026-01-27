from rest_framework import serializers
from .models import Subject, StudentGroup, TeacherMakeChangeStudentGroup, SubjectIsAboutTopic
from apps.utils.mixins import LanguageSerializerMixin
from apps.content.api.serializers import TopicSerializer
from apps.customauth.serializers import CustomTeacherSerializer as TeacherSerializer

class ShortSubjectSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ['id', 'name', 'description']  # solo los campos que quieres mostrar

    def get_name(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'name_{lang}', None)
    
    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)

class SubjectSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    topics = serializers.SerializerMethodField()
    
    class Meta:
        model = Subject
        fields = [
            'id',
            'name', 'description', 
            'name_es', 'description_es', 
            'name_en', 'description_en',
            'topics']
        extra_kwargs = {
            'name_es': {'write_only': True, 'required': True},
            'name_en': {'write_only': True, 'required': True},
            'description_es': {'write_only': True, 'required': False},
            'description_en': {'write_only': True, 'required': False},
        }

    def get_name(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'name_{lang}', None)

    def get_description(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'description_{lang}', None)
    
    def get_topics(self, obj):
        subject_topics = SubjectIsAboutTopic.objects.filter(subject=obj).select_related('topic').order_by('order_id')
        topics = [st.topic for st in subject_topics]
        return TopicSerializer(topics, many=True, context=self.context).data

class StudentGroupSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    subject = ShortSubjectSerializer(read_only=True)
    teacher = TeacherSerializer(read_only=True)
    groupCode = serializers.CharField(read_only=True)

    class Meta:
        model = StudentGroup
        fields = [
            'id', 'groupCode', 
            'name', 'name_es', 'name_en', 
            'subject', 'teacher']
        extra_kwargs = {
            'name_es': {'write_only': True, 'required': True},
            'name_en': {'write_only': True, 'required': True},
        }

    def get_name(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'name_{lang}', None)

class TeacherMakeChangeStudentGroupSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    group = StudentGroupSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    action = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = TeacherMakeChangeStudentGroup
        fields = [
            'id', 'group', 'subject', 
            'teacher', 'action', 
            'created_at']
        read_only_fields = ['created_at']
