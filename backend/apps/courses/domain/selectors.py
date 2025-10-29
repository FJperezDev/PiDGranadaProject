from ..api.models import Subject, StudentGroup, TeacherMakeChangeStudentGroup, SubjectIsAboutTopic
from ...customauth.models import CustomTeacher as Teacher
from ...content.api.models import Topic
from ...evaluation.domain import selectors 

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

def get_questions_for_subject(subject: Subject):
    topics = get_topics_by_subject(subject.id)
    questions = set()
    for topic in topics:
        topic_questions = selectors.get_question_by_topic(topic)
        questions.update(topic_questions)
    return questions

def get_student_group_by_id(group_id: int) -> StudentGroup:
    return StudentGroup.objects.get(id=group_id)