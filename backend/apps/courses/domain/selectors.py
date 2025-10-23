from ..api.models import Subject, StudentGroup, TeacherMakeChangeStudentGroup, SubjectIsAboutTopic
from ...customauth.models import CustomTeacher as Teacher
from ...content.domain.selectors import get_topic_by_title
from ...content.api.models import Topic

def get_all_subjects():
    return Subject.objects.prefetch_related('topics').all()

def get_subject_by_id(subject_id: int) -> Subject:
    return Subject.objects.prefetch_related('topics').get(id=subject_id)

def get_topics_by_subject(subject_id):
    return (
        Topic.objects
        .filter(subjects__subject_id=subject_id)
        .order_by('subjects__order_id')
    )