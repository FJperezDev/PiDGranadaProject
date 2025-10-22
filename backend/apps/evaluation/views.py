from rest_framework import viewsets
from .models import (
    Question, Answer,
    TeacherMakeChangeQuestion, TeacherMakeChangeAnswer,
    QuestionBelongsToTopic, QuestionRelatedToConcept,
    QuestionEvaluationGroup
)
from .serializers import (
    QuestionSerializer, AnswerSerializer,
    QuestionBelongsToTopicSerializer, QuestionRelatedToConceptSerializer,
    QuestionEvaluationGroupSerializer
)
from courses.models import Teacher


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def perform_create(self, serializer):
        question = serializer.save()
        teacher = getattr(self.request.user, 'teacher', None)
        TeacherMakeChangeQuestion.objects.create(
            question=question,
            teacher=teacher,
            action='created',
            type=question.type,
            statement_es=question.statement_es,
            statement_en=question.statement_en,
            approved=question.approved,
            generated=question.generated,
        )

    def perform_update(self, serializer):
        question = serializer.save()
        teacher = getattr(self.request.user, 'teacher', None)
        TeacherMakeChangeQuestion.objects.create(
            question=question,
            teacher=teacher,
            action='updated',
            type=question.type,
            statement_es=question.statement_es,
            statement_en=question.statement_en,
            approved=question.approved,
            generated=question.generated,
        )

    def perform_destroy(self, instance):
        teacher = getattr(self.request.user, 'teacher', None)
        TeacherMakeChangeQuestion.objects.create(
            question=instance,
            teacher=teacher,
            action='deleted',
            type=instance.type,
            statement_es=instance.statement_es,
            statement_en=instance.statement_en,
            approved=instance.approved,
            generated=instance.generated,
        )
        instance.delete()


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.select_related('question').all()
    serializer_class = AnswerSerializer

    def perform_create(self, serializer):
        answer = serializer.save()
        teacher = getattr(self.request.user, 'teacher', None)
        TeacherMakeChangeAnswer.objects.create(
            answer=answer,
            question=answer.question,
            teacher=teacher,
            action='created',
            text_es=answer.text_es,
            text_en=answer.text_en,
            is_correct=answer.is_correct,
        )

    def perform_update(self, serializer):
        answer = serializer.save()
        teacher = getattr(self.request.user, 'teacher', None)
        TeacherMakeChangeAnswer.objects.create(
            answer=answer,
            question=answer.question,
            teacher=teacher,
            action='updated',
            text_es=answer.text_es,
            text_en=answer.text_en,
            is_correct=answer.is_correct,
        )

    def perform_destroy(self, instance):
        teacher = getattr(self.request.user, 'teacher', None)
        TeacherMakeChangeAnswer.objects.create(
            answer=instance,
            question=instance.question,
            teacher=teacher,
            action='deleted',
            text_es=instance.text_es,
            text_en=instance.text_en,
            is_correct=instance.is_correct,
        )
        instance.delete()


class QuestionBelongsToTopicViewSet(viewsets.ModelViewSet):
    queryset = QuestionBelongsToTopic.objects.all()
    serializer_class = QuestionBelongsToTopicSerializer


class QuestionRelatedToConceptViewSet(viewsets.ModelViewSet):
    queryset = QuestionRelatedToConcept.objects.all()
    serializer_class = QuestionRelatedToConceptSerializer


class QuestionEvaluationGroupViewSet(viewsets.ModelViewSet):
    queryset = QuestionEvaluationGroup.objects.select_related('group', 'question').all()
    serializer_class = QuestionEvaluationGroupSerializer
