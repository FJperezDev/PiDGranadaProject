from rest_framework import serializers
from .models import (
    Question, Answer,
    # TeacherMakeChangeQuestion, TeacherMakeChangeAnswer,
    QuestionBelongsToTopic, QuestionRelatedToConcept,
    QuestionEvaluationGroup
)
from ...content.api.serializers import ShortTopicSerializer, ShortConceptSerializer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text_es', 'text_en', 'is_correct', 'question']
        read_only_fields = ['id', 'question']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    topics = serializers.SerializerMethodField()
    concepts = serializers.SerializerMethodField()
    statement = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'type', 'statement', 'statement_es', 'statement_en', 'approved', 'generated',
            'answers', 'topics', 'concepts'
        ]
        read_only_fields = ['id', 'answers']
        extra_kwargs = {
            'statement_es': {'write_only': True, 'required': True},
            'statement_en': {'write_only': True, 'required': True},
        }
    def get_topics(self, obj):
        queryset = [qt.topic for qt in obj.topics.all()]  # a través de QuestionBelongsToTopic
        print("queryset topics:", queryset)
        return ShortTopicSerializer(queryset, many=True, context=self.context).data

    def get_concepts(self, obj):
        queryset = [qc.concept for qc in obj.concepts.all()]  # a través de QuestionRelatedToConcept
        return ShortConceptSerializer(queryset, many=True, context=self.context).data

    def get_statement(self, obj):
        lang = self.context.get('lang', 'es')
        return getattr(obj, f'statement_{lang}', None)

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