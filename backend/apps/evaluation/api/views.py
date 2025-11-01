from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.content.api.models import Topic
from apps.content.domain import selectors as content_selectors
from apps.courses.domain import selectors as courses_selectors

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
from apps.evaluation.domain import selectors, services
from apps.utils.permissions import BaseContentViewSet

class QuestionViewSet(BaseContentViewSet):
    queryset = selectors.get_all_questions()
    serializer_class = QuestionSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        topics_titles = data.get('topics', [])
        concepts_names = data.get('concepts', [])
        question = services.create_question(
            user=request.user,
            type=data.get('type'),
            is_true=data.get('is_true'),
            statement_es=data.get('statement_es'),
            statement_en=data.get('statement_en'),
            approved=data.get('approved', False),
            generated=data.get('generated', False),
            topics_titles=topics_titles,
            concepts_names=concepts_names
        )
        serializer = self.get_serializer(question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        question = self.get_object()
        data = request.data
        topics_titles = data.get('topics', [])
        concept_names = data.get('concepts', [])
        question = services.update_question(
            user=request.user,
            question=question,
            type=data.get('type'),
            statement_es=data.get('statement_es'),
            statement_en=data.get('statement_en'),
            approved=data.get('approved'),
            generated=data.get('generated'),
            topics=topics_titles,
            concepts=concept_names
        )
        serializer = self.get_serializer(question)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        question = self.get_object()
        services.delete_question(user=request.user, question=question)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='last-modified', url_name='last-modified')
    def last_modified(self, request, pk=None):
        question = selectors.get_question_by_id(pk)
        last_question = selectors.get_last_change_question(question)
        if last_question:
            serializer = self.get_serializer(last_question)
            return Response(serializer.data)
        return Response({'detail': 'No questions found.'}, status=status.HTTP_404_NOT_FOUND)

class AnswerViewSet(BaseContentViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        question_id = data.get('question_id')
        question = selectors.get_question_by_id(question_id)
        answer = services.create_answer(
            user=request.user,
            question=question,
            text_es=data.get('text_es'),
            text_en=data.get('text_en'),
            is_correct=data.get('is_correct', False)
        )
        serializer = self.get_serializer(answer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ExamViewSet(BaseContentViewSet):
    queryset = Question.objects.none()
    serializer_class = QuestionSerializer 

    @action(detail=False, methods=['get'], url_path='generate-exam', url_name='generate-exam')
    def create_exam(self, request):
        data = request.data
        topics_titles = data.get('topics', [])
        num_questions = data.get('num_questions', 10)
        if not topics_titles or not isinstance(topics_titles, list):
            return Response({"detail": "'topics' is required and must be a titles list."}, status=status.HTTP_400_BAD_REQUEST)
        topics = []
        for topic_title in topics_titles:
            topics.append(content_selectors.get_topic_by_title(title=topic_title))

        exam_questions = services.create_exam(user=request.user, topics=set(topics), num_questions=num_questions)
        serializer = self.get_serializer(exam_questions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='evaluate-exam', url_name='evaluate-exam')
    def evaluate_exam(self, request):
        data = request.data
        student_group = courses_selectors.get_student_group_by_code(data.get('student_group_code'))
        questions_and_answers = data.get('questions_and_answers', [])
        questions_and_answers_dict = {}
        for qa in questions_and_answers:
            print(questions_and_answers[qa])
            question = selectors.get_question_by_id(qa)
            answer = selectors.get_answer_by_id(questions_and_answers[qa])
            questions_and_answers_dict[question] = answer
        mark = services.correct_exam(student_group, questions_and_answers_dict)
        return Response({'mark': mark})
    
    
    