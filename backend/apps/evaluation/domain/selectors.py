from ..api.models import Question
from ...content.api.models import Subject, Topic
from ..api.models import QuestionBelongsToTopic

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
