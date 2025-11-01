from apps.evaluation.api.models import Answer, Question
from apps.content.api.models import Subject, Topic
from apps.evaluation.api.models import QuestionBelongsToTopic, TeacherMakeChangeQuestion
from django.db import models
from apps.content.domain import selectors as content_selectors
from apps.evaluation.api.models import QuestionEvaluationGroup
import random

from apps.courses.api.models import StudentGroup

def get_all_questions():
    return Question.objects.filter(old=False).all()

def get_question_by_id(question_id: int) -> Question:
    return Question.objects.get(id=question_id)

def get_question_by_topic(topic: Topic):
    """Obtiene todas las preguntas asociadas a un topic dado."""
    return Question.objects.filter(
        topics__topic=topic
    ).distinct()

def get_questions_by_subject(subject: Subject):
    """Obtiene todas las preguntas asociadas a un subject dado."""
    topics = content_selectors.get_topics_by_subject(subject.id)
    questions = set()
    for topic in topics:
        topic_questions = get_question_by_topic(topic)
        questions.update(topic_questions)
    return questions

def get_questions_for_topic(topic: Topic):
    """Obtiene todas las preguntas asociadas a un topic dado."""
    return Question.objects.filter(
        topics__topic=topic
    ).distinct()

def get_random_question_from_topic(topic: Topic) -> Question:
    return get_questions_for_topic(topic).order_by('?').first()

def get_random_questions_from_topics(topics: list[Topic], num_questions: int) -> list[Question]:
    """Obtiene un conjunto de preguntas aleatorias de los topics dados."""
    questions = []
    topic_list = list(topics)
    random.shuffle(topic_list)
    for topic in topics:
        question = get_random_question_from_topic(topic)
        if question and question not in questions:
            questions.append(question)
        if len(questions) >= num_questions:
            break
    return questions

def get_question_evaluation_group(question: Question, group: StudentGroup) -> QuestionEvaluationGroup:
    """Obtiene la evaluación de una pregunta para un grupo específico."""
    try:
        return QuestionEvaluationGroup.objects.get(question=question, group=group)
    except QuestionEvaluationGroup.DoesNotExist:
        return None

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
    tmcq = TeacherMakeChangeQuestion.objects.filter(
        new_question=question
    ).order_by('-created_at').first()

    return tmcq.old_question if tmcq else None



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

def get_answers_for_question(question: Question) -> list[Answer]:
    """Obtiene todas las respuestas asociadas a una pregunta dada."""
    return list(question.answers.all())

def get_answer_by_id(answer_id: int) -> Answer:
    return Answer.objects.get(id=answer_id)

def get_correct_answer_for_question(question: Question) -> list[Answer]:
    """Obtiene todas las respuestas correctas asociadas a una pregunta dada."""
    return list(question.answers.filter(is_correct=True))