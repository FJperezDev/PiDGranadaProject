from apps.evaluation.api.models import Question
from apps.content.api.models import Subject, Topic
from apps.evaluation.api.models import QuestionBelongsToTopic, TeacherMakeChangeQuestion

def get_questions_for_topic(topic: Topic):
    """Obtiene todas las preguntas asociadas a un topic dado."""
    return Question.objects.filter(
        topics__questionbelongstotopic__topic=topic
    ).distinct()

def get_question_by_topic(topic: Topic) -> set[Question]:
    """Obtiene una pregunta específica asociada a un topic dado."""
    return Question.objects.filter(
        topics__questionbelongstotopic__topic=topic
    ).distinct().all()

def get_questions_for_subject(subject: Subject):
    """Obtiene todas las preguntas asociadas a una asignatura dada."""
    return Question.objects.filter(
        topics__in=subject.topics.values_list('topic', flat=True)
    ).distinct()

def get_last_change_question(question: Question):
    """Obtiene el último cambio realizado en una pregunta dada."""
    return TeacherMakeChangeQuestion.objects.filter(
        question=question
    ).order_by('-created_at').first()