from django.db.models import Sum, F, Case, When, Value, FloatField, ExpressionWrapper
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.content.api.models import Topic
from apps.content.domain import selectors as content_selectors
from apps.courses.domain import selectors as courses_selectors
from rest_framework import permissions
from django.db.models.functions import Coalesce
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

from apps.utils.permissions import IsSuperTeacher

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
            explanation_es=data.get('explanation_es'),
            explanation_en=data.get('explanation_en'),
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
        # Usamos self.get_queryset() para aprovechar el prefetch definido arriba
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset) # 2. OPTIMIZACIÓN: Paginación manual en acciones custom
        if page is not None:
            serializer = QuestionSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

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
        explanations = []
        student_group = courses_selectors.get_student_group_by_code(data.get('student_group_code'))
        questions_and_answers = data.get('questions_and_answers', [])
        questions_and_answers_dict = {}
        for qa in questions_and_answers:
            question = selectors.get_question_by_id(qa)
            answer = selectors.get_answer_by_id(questions_and_answers[qa])
            questions_and_answers_dict[question] = answer
        mark, explanations, recommendations = services.correct_exam(student_group, questions_and_answers_dict)
        return Response({'mark': mark, "explanations": explanations, "recommendations": recommendations})
    
class AnalyticsViewSet(BaseContentViewSet):

    @action(detail=False, methods=['get'])
    def performance(self, request):
        queryset = QuestionEvaluationGroup.objects.all()

        # 1. Filtramos basura (cosas sin intentos)
        queryset = queryset.filter(ev_count__gt=0) 
        
        # Filtro Subject
        subject_id_param = request.query_params.get('subject_id')
        if subject_id_param and subject_id_param.isdigit():
            subject_id = int(subject_id_param)
            if subject_id > 0:
                queryset = queryset.filter(group__subject_id=subject_id)

        # Configuración
        group_by = request.query_params.get('group_by', 'topic')
        limit_param = request.query_params.get('limit', 10)
        limit = int(limit_param) if limit_param else None

        try:
            label_key = None 
            is_question_grouping = False
            id_key = None

            if group_by == 'topic':
                label_key = 'question__topics__topic__title_es'
                id_key = 'question__topics__topic__id'
                queryset = queryset.exclude(question__topics__topic__isnull=True)
            elif group_by == 'concept':
                label_key = 'question__concepts__concept__name_es'
                id_key = 'question__concepts__concept__id'
                queryset = queryset.exclude(question__concepts__concept__isnull=True)
            elif group_by == 'group':
                label_key = 'group__name_es'
                id_key = 'group__id'
            elif group_by == 'question':
                id_key = 'question__id'
                label_key = 'question__id'
                is_question_grouping = True
            else:
                return Response({'detail': 'Invalid group_by parameter'}, status=400)

            # --- CONSULTA Y CÁLCULOS ---
            result = queryset.values(label_key, id_key).annotate(
                total_attempts=Coalesce(Sum('ev_count'), 0),
                total_correct=Coalesce(Sum('correct_count'), 0)
            ).annotate(
                # Calculamos el % de precisión
                accuracy=Case(
                    When(total_attempts=0, then=Value(0.0)),
                    default=ExpressionWrapper(
                        (F('total_correct') * 100.0) / F('total_attempts'),
                        output_field=FloatField()
                    ),
                    output_field=FloatField()
                ),
                # NUEVO: Calculamos el "Volumen de Fallos" (Intentos - Aciertos)
                total_failures=ExpressionWrapper(
                    F('total_attempts') - F('total_correct'),
                    output_field=FloatField()
                )
            )
            
            # --- AQUÍ ESTÁ TU "BALANCE" ---
            
            # OPCIÓN A (Impacto Real): Ordena por volumen de fallos. 
            # Pone primero las preguntas que más "puntos" han quitado a la clase en total.
            # Equilibra naturalmente % malo con muchos intentos.
            result = result.order_by('-total_failures') 

            # OPCIÓN B (Cascada): Si prefieres estricto % primero y luego intentos:
            # result = result.order_by('accuracy', '-total_attempts')

            if limit:
                result = result[:limit]

            # --- MAPEO DE TEXTOS ---
            question_map = {}
            if is_question_grouping and result:
                q_ids = [item['question__id'] for item in result]
                questions = Question.objects.filter(id__in=q_ids).values('id', 'statement_es')
                for q in questions:
                    question_map[q['id']] = q['statement_es']

            formatted_data = []
            for item in result:
                attempts = item['total_attempts']
                percentage = round(item['accuracy'], 2) if item['accuracy'] is not None else 0
                item_id = item.get(id_key)

                if is_question_grouping:
                    q_id = item['question__id']
                    statement = question_map.get(q_id, "Texto no encontrado")
                    label = f"Q{q_id}" 
                    full_label = f"Q{q_id}: {statement}"
                else:
                    raw_label = item.get(label_key) or "Sin asignar"
                    label = str(raw_label)[:15] + '...' if len(str(raw_label)) > 15 else str(raw_label)
                    full_label = str(raw_label)

                formatted_data.append({
                    'id': item_id,
                    'label': label,
                    'full_label': full_label,
                    'value': percentage,
                    'attempts': attempts
                })

            return Response(formatted_data)

        except Exception as e:
            print(f"Error Analytics: {e}")
            import traceback
            traceback.print_exc()
            return Response({'detail': str(e)}, status=500)
        

    @action(detail=False, methods=['delete'], url_path='reset-analytics', permission_classes=[IsSuperTeacher])
    def reset_analytics(self, request):
        """
        Permite borrar registros de QuestionEvaluationGroup.
        Query Params:
            - scope: 'global', 'subject', 'specific'
            - subject_id: ID de la asignatura (opcional para global, requerido para subject)
            - group_by: 'topic', 'concept', 'group', 'question' (requerido para specific)
            - target_id: ID del elemento específico a borrar (topic_id, question_id, etc.)
        """
        scope = request.query_params.get('scope')
        subject_id = request.query_params.get('subject_id')
        
        # Base QuerySet
        queryset = QuestionEvaluationGroup.objects.all()

        try:
            if scope == 'global':
                # Borrar TODO
                count, _ = queryset.delete()
                return Response({'message': f'Se han eliminado {count} registros globales.'})

            elif scope == 'subject':
                # Borrar por Asignatura
                if not subject_id:
                    return Response({'detail': 'Subject ID required'}, status=400)
                
                # Filtramos por los grupos que pertenecen a esa asignatura
                queryset = queryset.filter(group__subject_id=subject_id)
                count, _ = queryset.delete()
                return Response({'message': f'Se han eliminado {count} registros de la asignatura.'})

            elif scope == 'specific':
                # Borrar un item específico de la lista (un tema concreto, un grupo concreto...)
                group_by = request.query_params.get('group_by')
                target_id = request.query_params.get('target_id')

                if not group_by or not target_id:
                    return Response({'detail': 'Group By and Target ID required for specific deletion'}, status=400)

                if group_by == 'topic':
                    queryset = queryset.filter(question__topics__topic_id=target_id)
                elif group_by == 'concept':
                    queryset = queryset.filter(question__concepts__concept_id=target_id)
                elif group_by == 'group':
                    queryset = queryset.filter(group_id=target_id)
                elif group_by == 'question':
                    queryset = queryset.filter(question_id=target_id)
                else:
                    return Response({'detail': 'Invalid group_by type'}, status=400)
                
                # Si además hay subject seleccionado, respetamos ese filtro también por seguridad
                if subject_id:
                    queryset = queryset.filter(group__subject_id=subject_id)

                count, _ = queryset.delete()
                return Response({'message': f'Se han eliminado {count} registros específicos.'})

            else:
                return Response({'detail': 'Invalid scope'}, status=400)

        except Exception as e:
            return Response({'detail': str(e)}, status=500)