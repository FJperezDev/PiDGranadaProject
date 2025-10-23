from ..api.models import Subject, StudentGroup, TeacherMakeChangeStudentGroup
from ...customauth.models import CustomTeacher as Teacher
from ...content.domain.selectors import get_topic_by_title

def get_all_subjects():
    return Subject.objects.prefetch_related('topics').all()

def get_subject_by_id(subject_id: int) -> Subject:
    return Subject.objects.prefetch_related('topics').get(id=subject_id)