from rest_framework import serializers
from apps.utils.mixins import LanguageSerializerMixin
from .models import (
    Question, Answer,
    # TeacherMakeChangeQuestion, TeacherMakeChangeAnswer,
    QuestionBelongsToTopic, QuestionRelatedToConcept,
    QuestionEvaluationGroup
)
from ...content.api.serializers import ShortTopicSerializer, ShortConceptSerializer

class AnswerSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    text_es = serializers.SerializerMethodField()
    text_en = serializers.SerializerMethodField()
    text = serializers.SerializerMethodField()
    old = serializers.BooleanField(read_only=True)

    class Meta:
        model = Answer
        fields = ['id', 'text_es', 'text_en', 'text', 'is_correct', 'question', 'old']
        read_only_fields = ['id', 'question']

    def get_text_es(self, obj):
        return obj.text_es
    def get_text_en(self, obj):
        return obj.text_en
    def get_text(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'text_{lang}', None)

class ShortAnswerSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    text = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']

    def get_text(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'text_{lang}', None)

class ShortQuestionSerializer(LanguageSerializerMixin, serializers.ModelSerializer):
    statement = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()
    recommendation = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'type', 'statement', 'answers', 'recommendation']

    def get_statement(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'statement_{lang}', None)
    
    def get_recommendation(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'recommendation_{lang}', None)
    
    def get_answers(self, obj):
        queryset = obj.answers.filter(old=False)
        return ShortAnswerSerializer(queryset, many=True, context=self.context).data

class QuestionSerializer(LanguageSerializerMixin,serializers.ModelSerializer):
    answers = serializers.SerializerMethodField()
    topics = serializers.SerializerMethodField()
    subjects = serializers.SerializerMethodField()
    concepts = serializers.SerializerMethodField()
    statement = serializers.SerializerMethodField()
    statement_es = serializers.SerializerMethodField()
    statement_en = serializers.SerializerMethodField()
    recommendation = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'type', 'statement', 'statement_es', 'statement_en', 'approved', 'generated',
            'answers', 'topics', 'subjects', 'concepts', 'recommendation', 'recommendation_es', 'recommendation_en'
        ]
        read_only_fields = ['id', 'answers']
        extra_kwargs = {
            'statement_es': {'write_only': True, 'required': True},
            'statement_en': {'write_only': True, 'required': True},
            'recommendation_es': {'write_only': True, 'required': False},
            'recommendation_en': {'write_only': True, 'required': False},
        }
    def get_topics(self, obj):
        queryset = [qt.topic for qt in obj.topics.all()]  # a través de QuestionBelongsToTopic
        return ShortTopicSerializer(queryset, many=True, context=self.context).data

    def get_concepts(self, obj):
        queryset = [qc.concept for qc in obj.concepts.all()]  # a través de QuestionRelatedToConcept
        return ShortConceptSerializer(queryset, many=True, context=self.context).data
    
    def get_recommendation(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'recommendation_{lang}', None)
    
    def get_statement_es(self, obj):
        return obj.statement_es
    
    def get_statement_en(self, obj):
        return obj.statement_en
    
    def get_statement(self, obj):
        lang = self.get_lang()
        return getattr(obj, f'statement_{lang}', None)
    
    def get_subjects(self, obj):
        subjects_set = set()
        for qt in obj.topics.all():
            subject = qt.topic.subjects
            subjects_set.add(subject)
        return ShortTopicSerializer(subjects_set, many=True, context=self.context).data
    
    def get_answers(self, obj):
        queryset = obj.answers.filter(old=False)
        return AnswerSerializer(queryset, many=True, context=self.context).data

# class TeacherMakeChangeQuestionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TeacherMakeChangeQuestion
#         fields = '__all__'


# class TeacherMakeChangeAnswerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TeacherMakeChangeAnswer
#         fields = '__all__'

class QuestionBelongsToTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBelongsToTopic
        fields = '__all__'
        read_only_fields = ['id']


class QuestionRelatedToConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionRelatedToConcept
        fields = '__all__'
        read_only_fields = ['id']

class QuestionEvaluationGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionEvaluationGroup
        fields = '__all__'
        read_only_fields = ['id']