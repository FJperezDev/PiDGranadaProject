from django.utils import timezone
from apps.evaluation.api.models import Question, TeacherMakeChangeQuestion, Answer, TeacherMakeChangeAnswer
from apps.evaluation.domain.services import create_answer, delete_answer, create_question, delete_question
from apps.content.domain.services import delete_topic, delete_concept, delete_epigraph
from apps.content.api.models import Topic, Concept, Epigraph, TeacherMakeChangeConcept, TeacherMakeChangeTopic, TeacherMakeChangeEpigraph
from apps.courses.api.models import Subject, StudentGroup, TeacherMakeChangeSubject, TeacherMakeChangeStudentGroup
from apps.courses.domain.services import delete_student_group, delete_subject

ACTION_CHOICES = [
    ('created', 'Created'),
    ('updated', 'Updated'),
    ('deleted', 'Deleted'),
]

def removeChangesUpTo(datetime):
    removeAnswerChangesUpTo(datetime)
    removeQuestionChangesUpTo(datetime)
    removeAnswerChangesUpTo(datetime)
    removeSubjectChangesUpTo(datetime)
    removeStudentGroupChangesUpTo(datetime)
    removeTopicChangesUpTo(datetime)
    removeConceptChangesUpTo(datetime)
    removeEpigraphChangesUpTo(datetime)

def removeAnswerChangesUpTo(datetime):
    changes_to_delete_a = TeacherMakeChangeAnswer.objects.filter(created_at__lte=datetime)
    old_answers = changes_to_delete_a.exclude(old_answer__isnull=True).values_list('old_answer_id', flat=True)
    for old_answer in old_answers:
        delete_answer(old_answer)
    changes_to_delete_a.delete()
    TeacherMakeChangeAnswer.objects.filter(created_at__lte=datetime).delete()

def removeQuestionChangesUpTo(datetime):
    changes_to_delete_q = TeacherMakeChangeQuestion.objects.filter(created_at__lte=datetime)
    old_questions = changes_to_delete_q.exclude(old_question__isnull=True).values_list('old_question_id', flat=True)
    for old_question in old_questions:
        delete_question(old_question)
    changes_to_delete_q.delete()
    TeacherMakeChangeQuestion.objects.filter(created_at__lte=datetime).delete()

def removeSubjectChangesUpTo(datetime):
    changes_to_delete_s = TeacherMakeChangeSubject.objects.filter(created_at__lte=datetime)
    old_subjects = changes_to_delete_s.exclude(old_subject__isnull=True).values_list('old_subject_id', flat=True)
    for old_subject in old_subjects:
        delete_subject(old_subject)
    changes_to_delete_s.delete()
    TeacherMakeChangeQuestion.objects.filter(created_at__lte=datetime).delete()

def removeStudentGroupChangesUpTo(datetime):
    changes_to_delete_sg = TeacherMakeChangeStudentGroup.objects.filter(created_at__lte=datetime)
    old_groups = changes_to_delete_sg.exclude(old_group__isnull=True).values_list('old_group_id', flat=True)
    for old_group in old_groups:
        delete_student_group(old_group)
    changes_to_delete_sg.delete()
    TeacherMakeChangeStudentGroup.objects.filter(created_at__lte=datetime).delete()

def removeTopicChangesUpTo(datetime):
    changes_to_delete_t = TeacherMakeChangeTopic.objects.filter(created_at__lte=datetime)
    old_topics = changes_to_delete_t.exclude(old_topic__isnull=True).values_list('old_topic_id', flat=True)
    for old_topic in old_topics:
        delete_topic(old_topic)
    changes_to_delete_t.delete()
    TeacherMakeChangeTopic.objects.filter(created_at__lte=datetime).delete()

def removeConceptChangesUpTo(datetime):
    changes_to_delete_c = TeacherMakeChangeConcept.objects.filter(created_at__lte=datetime)
    old_concepts = changes_to_delete_c.exclude(old_concept__isnull=True).values_list('old_concept_id', flat=True)
    for old_concept in old_concepts:
        delete_concept(old_concept)
    changes_to_delete_c.delete()
    TeacherMakeChangeConcept.objects.filter(created_at__lte=datetime).delete()

def removeEpigraphChangesUpTo(datetime):
    changes_to_delete_e = TeacherMakeChangeEpigraph.objects.filter(created_at__lte=datetime)
    old_epigraphs = changes_to_delete_e.exclude(old_epigraph__isnull=True).values_list('old_epigraph_id', flat=True)
    for old_epigraph in old_epigraphs:
        delete_epigraph(old_epigraph)
    changes_to_delete_e.delete()
    TeacherMakeChangeEpigraph.objects.filter(created_at__lte=datetime).delete()

def makeChanges(user, object, action, json_after=None):
    if isinstance(object, Question):
        makeChangesQuestion(user, object, action, json_after)
    elif isinstance(object, Answer):
        makeChangesAnswer(user, object, action, json_after)
    elif isinstance(object, Subject):
        makeChangesSubject(user, object, action, json_after)
    elif isinstance(object, StudentGroup):
        makeChangesStudentGroup(user, object, action, json_after)
    elif isinstance(object, Topic):
        makeChangesTopic(user, object, action, json_after)
    elif isinstance(object, Concept):
        makeChangesConcept(user, object, action, json_after)
    elif isinstance(object, Epigraph):
        makeChangesEpigraph(user, object, action, json_after)
    else:
        raise ValueError(f"Unsupported object type: {type(object)}")

def makeChangesQuestion(user, object, action, json_after=None):
    statement_es = json_after.get('statement_es') if json_after else object.statement_es
    statement_en = json_after.get('statement_en') if json_after else object.statement_en
    approved = json_after.get('approved') if json_after else object.approved
    generated = json_after.get('generated') if json_after else object.generated
    topics = json_after.get('topics') if json_after else None
    concepts = json_after.get('concepts') if json_after else None
    type_ = json_after.get('type') if json_after else object.type
    TeacherMakeChangeQuestion.objects.create(
        old_question=object if action != 'created' else None,
        new_question=create_question(
            user=user,
            type=type_,
            statement_es=statement_es,
            statement_en=statement_en,
            approved=approved,
            generated=generated,
            topics=topics,
            concepts=concepts
        ) if action != 'deleted' else None,
        teacher=user,
    )

def makeChangesAnswer(user, object, action, json_after=None):
    teacher = user
    text_es = json_after.get('text_es') if json_after else object.text_es
    text_en = json_after.get('text_en') if json_after else object.text_en
    is_correct = json_after.get('is_correct') if json_after else object.is_correct
    
    TeacherMakeChangeAnswer.objects.create(
        old_answer=object if action != 'created' else None,
        new_answer=create_answer(
            question=object.question,
            text_es=text_es,
            text_en=text_en,
            is_correct=is_correct
        ) if action != 'deleted' else None,
        teacher=teacher,
    )

def makeChangesSubject(user, object, action, json_after=None):
    teacher = user
    name_es = json_after.get('name_es') if json_after else object.name_es
    name_en = json_after.get('name_en') if json_after else object.name_en
    description_es = json_after.get('description_es') if json_after else object.description_es
    description_en = json_after.get('description_en') if json_after else object.description_en
    
    TeacherMakeChangeSubject.objects.create(
        old_subject=object if action != 'created' else None,
        new_subject=Subject.objects.create(
            name_es=name_es,
            name_en=name_en,
            description_es=description_es,
            description_en=description_en
        ) if action != 'deleted' else None,
        teacher=teacher,
    )

def makeChangesStudentGroup(user, object, action, json_after=None):
    teacher = user
    subject = object.subject
    name_es = json_after.get('name_es') if json_after else object.name_es
    name_en = json_after.get('name_en') if json_after else object.name_en
    groupCode = json_after.get('groupCode') if json_after else object.groupCode
    
    TeacherMakeChangeStudentGroup.objects.create(
        old_group=object if action != 'created' else None,
        new_group=StudentGroup.objects.create(
            subject=subject,
            name_es=name_es,
            name_en=name_en,
            teacher=object.teacher,
            groupCode=groupCode
        ) if action != 'deleted' else None,
        teacher=teacher,
    )

def makeChangesTopic(user, object, action, json_after=None):
    teacher = user
    title_es = json_after.get('title_es') if json_after else object.title_es
    title_en = json_after.get('title_en') if json_after else object.title_en
    description_es = json_after.get('description_es') if json_after else object.description_es
    description_en = json_after.get('description_en') if json_after else object.description_en
    
    TeacherMakeChangeTopic.objects.create(
        old_topic=object if action != 'created' else None,
        new_topic=Topic.objects.create(
            title_es=title_es,
            title_en=title_en,
            description_es=description_es,
            description_en=description_en
        ) if action != 'deleted' else None,
        teacher=teacher,
    )

def makeChangesConcept(user, object, action, json_after=None):
    teacher = user
    name_es = json_after.get('name_es') if json_after else object.name_es
    name_en = json_after.get('name_en') if json_after else object.name_en
    description_es = json_after.get('description_es') if json_after else object.description_es
    description_en = json_after.get('description_en') if json_after else object.description_en
    
    TeacherMakeChangeConcept.objects.create(
        old_concept=object if action != 'created' else None,
        new_concept=Concept.objects.create(
            name_es=name_es,
            name_en=name_en,
            description_es=description_es,
            description_en=description_en
        ) if action != 'deleted' else None,
        teacher=teacher,
    )

def makeChangesEpigraph(user, object, action, json_after=None):
    teacher = user
    title_es = json_after.get('title_es') if json_after else object.title_es
    title_en = json_after.get('title_en') if json_after else object.title_en
    description_es = json_after.get('description_es') if json_after else object.description_es
    description_en = json_after.get('description_en') if json_after else object.description_en
    TeacherMakeChangeEpigraph.objects.create(
        old_epigraph=object if action != 'created' else None,
        new_epigraph=Epigraph.objects.create(
            title_es=title_es,
            title_en=title_en,
            description_es=description_es,
            description_en=description_en
        ) if action != 'deleted' else None,
        teacher=teacher,
    )