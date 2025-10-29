from apps.evaluation.api.models import Question
from apps.content.api.models import Subject, Topic
from apps.evaluation.api.models import QuestionBelongsToTopic, TeacherMakeChangeQuestion
from django.db import models
from apps.content.domain import selectors as content_selectors
from apps.evaluation.api.models import QuestionEvaluationGroup

def get_questions_for_topic(topic: Topic):
    """Obtiene todas las preguntas asociadas a un topic dado."""
    return Question.objects.filter(
        topics__questionbelongstotopic__topic=topic
    ).distinct()

def get_random_question_from_topics(topics: set[Topic]):
    """Obtiene una pregunta aleatoria de un conjunto de topics dados."""
    return Question.objects.filter(
        topics__questionbelongstotopic__topic__in=topics
    ).distinct().order_by('?').first()

def get_random_questions_from_topics(topics: set[Topic], count: int) -> set[Question]:
    questions = {}
    for _ in range(count):
        question = get_random_question_from_topics(topics)
        if question and question not in questions:
            questions.add(question)

def get_question_evaluation_group(question: Question, group_id: int):
    """Obtiene la evaluación de una pregunta para un grupo específico."""
    return question.evaluations.filter(group_id=group_id).first()

def get_question_evaluation_group_correct_count(question: Question, group_id: int) -> int:
    """Obtiene el conteo de respuestas correctas de una pregunta para un grupo específico."""
    qeg = get_question_evaluation_group(question, group_id)
    return qeg.correct_count if qeg else 0

def get_question_evaluation_group_ev_count(question: Question, group_id: int) -> int:
    """Obtiene el conteo de evaluaciones de una pregunta para un grupo específico."""
    qeg = get_question_evaluation_group(question, group_id)
    return qeg.ev_count if qeg else 0

def get_question_evaluation_correct_count(question: Question) -> int:
    qeg = question.evaluations.all()
    correct_count = 0
    for q in qeg:
        correct_count += q.correct_count
    return correct_count

def get_question_evaluation_ev_count(question: Question) -> int:
    qeg = question.evaluations.all()
    ev_count = 0
    for q in qeg:
        ev_count += q.ev_count
    return ev_count

def get_ev_count_by_group(group_id: int) -> int:
    """Obtiene la suma total de evaluaciones de todas las preguntas para un grupo específico."""
    QuestionEvaluationGroup.objects.filter(
        group_id=group_id
    ).aggregate(
        total_ev_count=models.Sum('ev_count')
    )['total_ev_count'] or 0

def get_correct_count_by_group(group_id: int) -> int:
    """Obtiene la suma total de evaluaciones de todas las preguntas para un grupo específico."""
    QuestionEvaluationGroup.objects.filter(
        group_id=group_id
    ).aggregate(
        total_correct_count=models.Sum('correct_count')
    )['total_correct_count'] or 0

def get_ev_count_by_concept(concept_id: int) -> int:
    """Obtiene la suma total de evaluaciones de todas las preguntas para un concepto específico."""
    return Question.objects.filter(
        concepts__questionrelatedtoconcept__concept_id=concept_id
    ).distinct().aggregate(
        total_ev_count=models.Sum('evaluations__ev_count')
    )['total_ev_count'] or 0

def get_last_change_question(question: Question):
    """Obtiene el último cambio realizado en una pregunta dada."""
    return TeacherMakeChangeQuestion.objects.filter(
        question=question
    ).order_by('-created_at').first()

def get_ev_count_by_concept(concept_id: int) -> int:
    """Obtiene la suma total de evaluaciones de todas las preguntas para un concepto específico."""
    return Question.objects.filter(
        concepts__questionrelatedtoconcept__concept_id=concept_id
    ).distinct().aggregate(
        total_ev_count=models.Sum('evaluations__ev_count')
    )['total_ev_count'] or 0

def get_correct_count_by_concept(concept_id: int) -> int:
    """Obtiene la suma total de respuestas correctas para un concepto específico."""
    return Question.objects.filter(
        concepts__questionrelatedtoconcept__concept_id=concept_id
    ).distinct().aggregate(
        total_correct_count=models.Sum('evaluations__correct_count')
    )['total_correct_count'] or 0

def get_correct_count_by_topic(topic_id: int) -> int:
    """Obtiene un diccionario con el conteo de respuestas correctas por pregunta para un topic específico,
    utilizando la relación question related to concept."""
    concepts = content_selectors.get_concepts_by_topic(topic_id)
    correct_count = 0
    for concept in concepts:
        correct_count += get_correct_count_by_concept(concept.id)
    return {correct_count}

def get_ev_count_by_topic(topic_id: int) -> int:
    """Obtiene un diccionario con el conteo de evaluaciones por pregunta para un concepto específico."""
    concepts = content_selectors.get_concepts_by_topic(topic_id)
    correct_count = 0
    for concept in concepts:
        correct_count += get_ev_count_by_concept(concept.id)
    return {correct_count}
