from apps.courses.api.models import Subject, StudentGroup, SubjectIsAboutTopic, TeacherMakeChangeSubject, TeacherMakeChangeStudentGroup
from apps.content.api.models import Topic

def get_all_subjects():
    return Subject.objects.prefetch_related('topics').filter(old=False).all()

def get_subject_by_id(subject_id: int) -> Subject:
    return Subject.objects.prefetch_related('topics').get(id=subject_id)

def get_topics_relation_by_subject(subject: Subject):
    return SubjectIsAboutTopic.objects.filter(subject=subject).order_by('order_id')

def get_topics_related(trs):
    topics = []
    for tr in trs:
        topics.append(tr.topic)
    return topics

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

def get_student_group_by_code(group_code: str) -> StudentGroup:
    try:
        return StudentGroup.objects.get(groupCode=group_code)
    except StudentGroup.DoesNotExist:
        return None

def get_student_group_by_teacher(teacher_user) -> list[StudentGroup]:
    return StudentGroup.objects.filter(teacher=teacher_user, old=False).all()

def get_subject_by_code(code: str) -> Subject:
    sg = get_student_group_by_code(code)
    if sg:
        return sg.subject
    else:
        return None

def get_all_student_groups():
    return StudentGroup.objects.filter(old=False).all()

def get_all_changes():
    from itertools import chain
    return list(chain(get_all_student_group_changes(), get_all_subject_changes()))

def get_student_group_changes(group_id: int):
    return get_all_student_group_changes().filter(group_id=group_id).order_by('-created_at').all()

def get_all_student_group_changes():
    return TeacherMakeChangeStudentGroup.objects.all().order_by('-created_at').all()

def get_subject_changes(subject_id: int):
    return get_all_subject_changes().filter(subject_id=subject_id).order_by('-created_at').all()

def get_all_subject_changes():
    return TeacherMakeChangeSubject.objects.all().order_by('-created_at').all()

def get_last_change_subject(subject: Subject):
    tmcq = TeacherMakeChangeSubject.objects.filter(
        new_subject=subject
    ).order_by('-created_at').first()

    return tmcq.old_subject if tmcq else None

def get_last_change_student_group(group: StudentGroup):
    tmcq = TeacherMakeChangeStudentGroup.objects.filter(
        new_group=group
    ).order_by('-created_at').first()

    return tmcq.old_group if tmcq else None
