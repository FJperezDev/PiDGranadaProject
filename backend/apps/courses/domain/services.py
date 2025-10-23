from ..api.models import Subject, StudentGroup, TeacherMakeChangeStudentGroup, SubjectIsAboutTopic
from ...content.api.models import Topic

from django.core.exceptions import ValidationError

def create_subject(name_es: str, name_en: str, description_es=None, description_en=None) -> Subject:
    """Crea una nueva asignatura con validaciones básicas."""
    if not name_es and not name_en:
        raise ValidationError("Debe proporcionar al menos un nombre en algún idioma.")
    if Subject.objects.filter(name_es=name_es).exists() or Subject.objects.filter(name_en=name_en).exists():
        raise ValidationError("Ya existe una asignatura con ese nombre en español.")
    
    subject = Subject.objects.create(
        name_es=name_es,
        name_en=name_en,
        description_es=description_es,
        description_en=description_en,
    )

    return subject

def get_topics_by_subject(subject_id: int):
    """Devuelve los temas asociados a una asignatura concreta."""
    subject = Subject.objects.get(id=subject_id)
    return subject.topics.all()

# --- Subject ↔ Topic relation ---
def link_topic_to_subject(subject: Subject, topic: Topic, order_id: int) -> SubjectIsAboutTopic:
    """Asocia un concepto a un topic, con orden definido."""
    if SubjectIsAboutTopic.objects.filter(topic=topic, subject=subject).exists():
        raise ValidationError("Este tema ya está asociado a la asignatura.")
    return SubjectIsAboutTopic.objects.create(subject=subject, topic=topic, order_id=order_id)

def unlink_topic_from_subject(topic: Topic, subject: Subject) -> None:
    """Desasocia un concepto de un topic."""
    relation = SubjectIsAboutTopic.objects.filter(topic=topic, subject=subject)
    if not relation.exists():
        raise ValidationError("Este tema no está asociado a la asignatura.")
    relation.delete()