from ..api.models import Subject, StudentGroup, TeacherMakeChangeStudentGroup, SubjectIsAboutTopic
from ...content.api.models import Topic
from . import selectors
from ...customauth.models import CustomTeacher as Teacher
from ...evaluation.api.models import QuestionEvaluationGroup

from django.core.exceptions import ValidationError
BIG_ENOUGH_INT = 1_000


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

def swap_order(relationA: SubjectIsAboutTopic, relationB: SubjectIsAboutTopic):
    tmp = relationA.order_id
    relationA.order_id = relationB.order_id
    relationB.order_id = tmp
    relationA.save()
    relationB.save()

# --- StudentGroup Services ---
def create_student_group(subject: Subject, name_es: str, name_en: str, teacher: Teacher, groupCode: str) -> StudentGroup:
    """Crea un nuevo grupo de estudiantes con validaciones básicas."""
    if StudentGroup.objects.filter(subject=subject, name_es=name_es).exists() or StudentGroup.objects.filter(subject=subject, name_en=name_en).exists():
        raise ValidationError("Ya existe un grupo de estudiantes con ese nombre para esta asignatura, año y semestre.")
    
    group = StudentGroup.objects.create(
        subject=subject,
        name_es=name_es,
        name_en=name_en,
        teacher=teacher,
        groupCode=groupCode,
    )

    questions = selectors.get_questions_for_subject(subject)
    for question in questions:
        QuestionEvaluationGroup.objects.create(group=group, question=question)


    return group

def delete_student_group(group: StudentGroup) -> None:
    """Elimina un grupo de estudiantes dado."""
    group.delete()
