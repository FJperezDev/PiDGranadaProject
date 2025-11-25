from apps.courses.api.models import Subject, StudentGroup, TeacherMakeChangeStudentGroup, SubjectIsAboutTopic
from apps.content.api.models import Topic
from apps.customauth.models import CustomTeacher as Teacher
from apps.evaluation.api.models import QuestionEvaluationGroup
from apps.evaluation.domain import selectors as evaluation_selectors
from apps.courses.utils import generate_groupCode
from apps.utils.audit import makeChanges

from django.core.exceptions import ValidationError

def create_subject(name_es: str, name_en: str, teacher: Teacher, description_es=None, description_en=None) -> Subject:
    """Crea una nueva asignatura con validaciones básicas."""
    if not name_es and not name_en:
        raise ValidationError("Debe proporcionar al menos un nombre en algún idioma.")
    if Subject.objects.filter(name_es=name_es).exists():
        raise ValidationError("Ya existe una asignatura con ese nombre en español.")
    
    subject = Subject.objects.create(
        name_es=name_es,
        name_en=name_en,
        description_es=description_es,
        description_en=description_en,
    )
    makeChanges(user=teacher, old_object=None, new_object=subject)

    return subject

def update_subject(subject: Subject, teacher: Teacher, name_es: str = None, name_en: str = None,
                   description_es: str = None, description_en: str = None) -> Subject:
    """Actualiza una asignatura con los nuevos datos proporcionados."""
    old_subject = Subject.objects.get(pk=subject.pk)
    old_subject.pk = None
    old_subject.old = True
    if name_es is not None:
        subject.name_es = name_es
    if name_en is not None:
        subject.name_en = name_en
    if description_es is not None:
        subject.description_es = description_es
    if description_en is not None:
        subject.description_en = description_en
    subject.save()
    old_subject.save()
    makeChanges(user=teacher, old_object=old_subject, new_object=subject)

    return subject

def delete_subject(subject: Subject, teacher: Teacher) -> None:
    """Elimina una asignatura dado."""
    makeChanges(user=teacher, old_object=subject, new_object=None)
    subject.delete()

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
def create_student_group(subject: Subject, name_es: str, name_en: str, teacher: Teacher) -> StudentGroup:

    if StudentGroup.objects.filter(subject=subject, name_es=name_es).exists() or StudentGroup.objects.filter(subject=subject, name_en=name_en).exists():
        raise ValidationError("Ya existe un grupo de estudiantes con ese nombre para esta asignatura, año y semestre.")
    
    groupCode=generate_groupCode()
    group = StudentGroup.objects.create(
        subject=subject,
        name_es=name_es,
        name_en=name_en,
        teacher=teacher,
        groupCode=groupCode,
    )

    questions = evaluation_selectors.get_questions_by_subject(subject)
    for question in questions:
        QuestionEvaluationGroup.objects.create(group=group, question=question)


    return group

def get_next_order_id_for_subject(subject: Subject) -> int:
    """Obtiene el siguiente order_id disponible para un SubjectIsAboutTopic en una asignatura dada."""
    last_relation = SubjectIsAboutTopic.objects.filter(subject=subject).order_by('-order_id').first()
    if last_relation:
        return last_relation.order_id + 1
    return 1

def update_student_group(group: StudentGroup, teacher: Teacher, name_es: str = None, name_en: str = None):
    """Actualiza un grupo de estudiantes dado."""
    if name_es is not None:
        group.name_es = name_es
    if name_en is not None:
        group.name_en = name_en
    group.save()

    makeChanges(user=teacher, old_object=None, new_object=group)

    return group

def delete_student_group(group: StudentGroup, teacher: Teacher) -> None:
    """Elimina un grupo de estudiantes dado."""
    makeChanges(user=group.teacher, old_object=group, new_object=None)
    group.delete()

def delete_student_groups_by_subject(subject: Subject):
    """Elimina todos los grupos de estudiantes asociados a una asignatura."""
    groups = StudentGroup.objects.filter(subject=subject)
    for group in groups:
        makeChanges(user=subject.teacher, old_object=group, new_object=None)
        group.delete()