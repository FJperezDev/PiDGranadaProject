from rest_framework import serializers
from .models import (
    Question, Answer,
    TeacherMakeChangeQuestion, TeacherMakeChangeAnswer,
    QuestionBelongsToTopic, QuestionRelatedToConcept,
    QuestionEvaluationGroup
)


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text_es', 'text_en', 'is_correct', 'question']


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'type', 'statement_es', 'statement_en', 'approved', 'generated', 'answers']


class TeacherMakeChangeQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherMakeChangeQuestion
        fields = '__all__'


class TeacherMakeChangeAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherMakeChangeAnswer
        fields = '__all__'


class QuestionBelongsToTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBelongsToTopic
        fields = '__all__'


class QuestionRelatedToConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionRelatedToConcept
        fields = '__all__'


class QuestionEvaluationGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionEvaluationGroup
        fields = '__all__'
