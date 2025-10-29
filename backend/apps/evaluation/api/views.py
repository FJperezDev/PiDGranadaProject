from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import (
    Question, Answer,
    QuestionBelongsToTopic, QuestionRelatedToConcept,
    QuestionEvaluationGroup
)
from .serializers import (
    QuestionSerializer, AnswerSerializer,
    QuestionBelongsToTopicSerializer, QuestionRelatedToConceptSerializer,
    QuestionEvaluationGroupSerializer
)
from ..domain import services

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        topics = data.get('topics', [])
        concepts = data.get('concepts', [])
        question = services.create_question(
            user=request.user,
            type=data.get('type'),
            statement_es=data.get('statement_es'),
            statement_en=data.get('statement_en'),
            approved=data.get('approved', False),
            generated=data.get('generated', False),
            topics=QuestionBelongsToTopic.objects.filter(id__in=topics).values_list('topic', flat=True) if topics else None,
            concepts=QuestionRelatedToConcept.objects.filter(id__in=concepts).values_list('concept', flat=True) if concepts else None
        )
        serializer = self.get_serializer(question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        question = self.get_object()
        data = request.data
        topics = data.get('topics', [])
        concepts = data.get('concepts', [])
        question = services.update_question(
            user=request.user,
            question=question,
            type=data.get('type'),
            statement_es=data.get('statement_es'),
            statement_en=data.get('statement_en'),
            approved=data.get('approved'),
            generated=data.get('generated'),
            topics=topics,
            concepts=concepts
        )
        serializer = self.get_serializer(question)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        question = self.get_object()
        services.delete_question(user=request.user, question=question)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.select_related('question').all()
    serializer_class = AnswerSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        question = Question.objects.get(pk=data['question'])
        answer = services.create_answer(
            user=request.user,
            question=question,
            text_es=data.get('text_es'),
            text_en=data.get('text_en'),
            is_correct=data.get('is_correct', False)
        )
        serializer = self.get_serializer(answer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        answer = self.get_object()
        data = request.data
        answer = services.update_answer(
            user=request.user,
            answer=answer,
            text_es=data.get('text_es'),
            text_en=data.get('text_en'),
            is_correct=data.get('is_correct')
        )
        serializer = self.get_serializer(answer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        answer = self.get_object()
        services.delete_answer(
            user=request.user,
            answer=answer
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

class QuestionBelongsToTopicViewSet(viewsets.ModelViewSet):
    queryset = QuestionBelongsToTopic.objects.all()
    serializer_class = QuestionBelongsToTopicSerializer


class QuestionRelatedToConceptViewSet(viewsets.ModelViewSet):
    queryset = QuestionRelatedToConcept.objects.all()
    serializer_class = QuestionRelatedToConceptSerializer


class QuestionEvaluationGroupViewSet(viewsets.ModelViewSet):
    queryset = QuestionEvaluationGroup.objects.select_related('group', 'question').all()
    serializer_class = QuestionEvaluationGroupSerializer
