from ..api.models import Subject, StudentGroup, TeacherMakeChangeStudentGroup, SubjectIsAboutTopic
from ...customauth.models import CustomTeacher as Teacher
from ...content.api.models import Topic
from ...evaluation.domain import selectors 

def get_all_subjects():
    return Subject.objects.prefetch_related('topics').filter(old=False).all()

def get_subject_by_id(subject_id: int) -> Subject:
    return Subject.objects.prefetch_related('topics').get(id=subject_id)

def get_topics_by_subject(subject_id):
    return (
        Topic.objects
        .filter(subjects__subject_id=subject_id)
        .order_by('subjects__order_id')
    )

def get_subject_topic_relation_by_both(subject: Subject, topic: Topic) -> SubjectIsAboutTopic:
    try:
        return SubjectIsAboutTopic.objects.get(subject=subject, topic=topic)
    except SubjectIsAboutTopic.DoesNotExist:
        return None

def get_student_group_by_id(group_id: int) -> StudentGroup:
    return StudentGroup.objects.get(id=group_id)

def get_all_student_groups():
    return StudentGroup.objects.filter(old=False).all()