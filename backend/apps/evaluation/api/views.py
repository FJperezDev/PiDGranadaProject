from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.content.api.models import Topic
from apps.content.domain import selectors as content_selectors
from apps.courses.domain import selectors as courses_selectors
from rest_framework import permissions
from .models import (
    Question, Answer,
    QuestionBelongsToTopic, QuestionRelatedToConcept,
    QuestionEvaluationGroup
)
from .serializers import (
    QuestionSerializer, AnswerSerializer, ShortQuestionSerializer,
    QuestionBelongsToTopicSerializer, QuestionRelatedToConceptSerializer,
    QuestionEvaluationGroupSerializer
)
from apps.evaluation.domain import selectors, services
from apps.utils.permissions import BaseContentViewSet

class QuestionRelatedToConceptViewSet(BaseContentViewSet):
    queryset = QuestionRelatedToConcept.objects.all()
    serializer_class = QuestionRelatedToConceptSerializer

class QuestionViewSet(BaseContentViewSet):
    queryset = selectors.get_all_questions()
    serializer_class = ShortQuestionSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        topics_titles = data.get('topics_titles', [])
        concepts_names = data.get('concepts', [])
        answers = data.get('answers', [])
        question = services.create_question(
            teacher=request.user,
            type=data.get('type'),
            is_true=data.get('is_true'),
            statement_es=data.get('statement_es'),
            statement_en=data.get('statement_en'),
            approved=data.get('approved', False),
            generated=data.get('generated', False),
            topics_titles=topics_titles,
            concepts_names=concepts_names,
            answers=answers
        )
        serializer = self.get_serializer(question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        question = self.get_object()
        data = request.data
        topics_titles = data.get('topics', [])
        concept_names = data.get('concepts', [])
        question = services.update_question(
            teacher=request.user,
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
        services.delete_question(teacher=request.user, question=question)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='long-questions', url_name='long-questions')
    def long_questions(self, request):
        queryset = selectors.get_all_questions()
        serializer = QuestionSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


    @action(detail=True, methods=['get'], url_path='last-modified', url_name='last-modified')
    def last_modified(self, request, pk=None):
        question = selectors.get_question_by_id(pk)
        last_question = selectors.get_last_change_question(question)
        if last_question:
            serializer = self.get_serializer(last_question)
            return Response(serializer.data)
        return Response({'detail': 'No questions found.'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'], )
    def answers(self, request, pk=None):
        """GET /questions/<id>/answers/"""
        question = selectors.get_question_by_id(pk)
        queryset = (
            selectors.get_answers_for_question(question=question)
        )
        serializer = AnswerSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @answers.mapping.post
    def add_answer(self, request, pk=None):
        question = selectors.get_question_by_id(pk)
        data = request.data
        answer = services.create_answer(
            teacher=request.user,
            question=question,
            text_es=data.get('text_es'),
            text_en=data.get('text_en'),
            is_correct=data.get('is_correct')
        )
        serializer = AnswerSerializer(answer)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'put', 'delete'], url_path='answers/(?P<answer_id>[^/.]+)')
    def answer_detail(self, request, pk=None, answer_id=None):
        """GET /questions/<id>/answers/<id>/ — obtiene un answers específico.
           PUT /questions/<id>/answers/<id>/ — actualiza un answers asociado al tema.
           DELETE /questions/<id>/answers/<id>/ — elimina un answers."""
        answer = selectors.get_answer_by_id(answer_id=answer_id)
        if not answer or answer.question.id != int(pk):
            return Response({'detail': 'Answer not found in this question'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = AnswerSerializer(answer, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        elif request.method == 'PUT':
            answer = services.update_answer(answer=answer, teacher=request.user, **request.data)
            serializer = AnswerSerializer(answer, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'DELETE':
            services.delete_answer(answer, teacher=request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)

class ExamViewSet(viewsets.GenericViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'], url_path='generate-exam', url_name='generate-exam')
    def create_exam(self, request):
        topics_str = request.query_params.get('topics')
        nQuestions = request.query_params.get('nQuestions')
        if not topics_str:
            return Response({'detail': 'No topics provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        topic_titles = topics_str.split(',')
        topic_titles = [title.strip() for title in topic_titles]
        topics = [content_selectors.get_topic_by_title(title) for title in topic_titles]
        topics = [topic for topic in topics if topic] # Filter out any None topics

        if not topics:
            return Response({'detail': 'No valid topics found'}, status=status.HTTP_404_NOT_FOUND)
        
        questions = services.create_exam(topics=set(topics), num_questions=int(nQuestions))
        serializerQuestions = ShortQuestionSerializer(questions, many=True, context={'request': request})
        return Response(serializerQuestions.data)

    @action(detail=False, methods=['post'], url_path='evaluate-exam', url_name='evaluate-exam', permission_classes=[permissions.AllowAny])
    def evaluate_exam(self, request):
        data = request.data
        student_group = courses_selectors.get_student_group_by_code(data.get('student_group_code'))
        questions_and_answers = data.get('questions_and_answers', [])
        questions_and_answers_dict = {}
        for qa in questions_and_answers:
            question = selectors.get_question_by_id(qa)
            answer = selectors.get_answer_by_id(questions_and_answers[qa])
            questions_and_answers_dict[question] = answer
        mark = services.correct_exam(student_group, questions_and_answers_dict)
        return Response({'mark': mark})
    
class AnalyticsViewSet(BaseContentViewSet):

    @action(detail=False, methods=['get'])
    def performance(self, request):
        # ... (Queryset y filtros previos se quedan IGUAL) ...
        queryset = QuestionEvaluationGroup.objects.all()
        
        # Filtros (Subject, Group, Topic...) se quedan IGUAL que antes
        # ...

        group_by = request.query_params.get('group_by', 'topic')
        
        try:
            # --- CAMBIOS EN LA LÓGICA DE AGRUPACIÓN ---
            
            if group_by == 'topic':
                # ... (Igual que antes) ...
                label_path = 'question__topics__topic__title_es'
                result = queryset.values(label_path).annotate(
                    total_attempts=Sum('ev_count'),
                    total_correct=Sum('correct_count')
                ).order_by(label_path)
                label_key = label_path

            elif group_by == 'concept':
                # ... (Igual que antes) ...
                label_path = 'question__concepts__concept__name_es'
                result = queryset.values(label_path).annotate(
                    total_attempts=Sum('ev_count'),
                    total_correct=Sum('correct_count')
                ).order_by(label_path)
                label_key = label_path

            elif group_by == 'group':
                # ... (Igual que antes) ...
                label_path = 'group__name_es'
                result = queryset.values(label_path).annotate(
                    total_attempts=Sum('ev_count'),
                    total_correct=Sum('correct_count')
                ).order_by(label_path)
                label_key = label_path

            elif group_by == 'question':
                # --- AQUÍ ESTÁ EL CAMBIO CLAVE ---
                # Agrupamos por ID y Enunciado. Ordenamos por ID para que salga Q1, Q2, Q3...
                result = queryset.values('question__id', 'question__statement_es').annotate(
                    total_attempts=Sum('ev_count'),
                    total_correct=Sum('correct_count')
                ).order_by('question__id') 
                
                # No usaremos label_key estándar aquí, lo manejaremos en el bucle
                label_key = None 

            else:
                return Response({'detail': 'Invalid group_by parameter'}, status=400)

            # --- FORMATEO DE DATOS ---
            formatted_data = []
            for item in result:
                
                # Lógica especial para etiquetas de Preguntas
                if group_by == 'question':
                    q_id = item['question__id']
                    statement = item['question__statement_es'] or "Sin enunciado"
                    # Etiqueta corta para la gráfica: "Q14"
                    label = f"Q{q_id}" 
                    # Etiqueta larga para la lista: "Q14: ¿Cuál es la capital de...?"
                    full_label = f"Q{q_id}: {statement}"
                else:
                    # Lógica estándar para temas, grupos, etc.
                    raw_label = item.get(label_key)
                    if not raw_label: continue
                    label = str(raw_label)[:15] + '...' if len(str(raw_label)) > 15 else str(raw_label)
                    full_label = str(raw_label)

                attempts = item['total_attempts']
                correct = item['total_correct']
                
                if attempts > 0:
                    percentage = round((correct / attempts) * 100, 2)
                else:
                    percentage = 0

                formatted_data.append({
                    'label': label,       # Para la gráfica (corto)
                    'full_label': full_label, # Para la lista (largo)
                    'value': percentage,
                    'attempts': attempts
                })

            return Response(formatted_data)

        except Exception as e:
            print(f"Error Analytics: {e}")
            return Response({'detail': str(e)}, status=500)