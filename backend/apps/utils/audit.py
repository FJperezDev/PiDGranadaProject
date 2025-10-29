from django.utils import timezone
from apps.utils.choices import ACTION_CHOICES

# NOTE: avoid importing other apps at module import time to prevent circular
# imports. Import models and service helpers locally inside functions.

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
    from apps.evaluation.api.models import TeacherMakeChangeAnswer, Answer

    changes_to_delete_a = TeacherMakeChangeAnswer.objects.filter(created_at__lte=datetime)
    old_answers = changes_to_delete_a.exclude(old_answer__isnull=True).values_list('old_answer_id', flat=True)
    for old_answer_id in old_answers:
        # delete the historical answer object directly to avoid importing domain services
        Answer.objects.filter(pk=old_answer_id).delete()
    changes_to_delete_a.delete()
    TeacherMakeChangeAnswer.objects.filter(created_at__lte=datetime).delete()

def removeQuestionChangesUpTo(datetime):
    from apps.evaluation.api.models import TeacherMakeChangeQuestion, Question

    changes_to_delete_q = TeacherMakeChangeQuestion.objects.filter(created_at__lte=datetime)
    old_questions = changes_to_delete_q.exclude(old_question__isnull=True).values_list('old_question_id', flat=True)
    for old_question_id in old_questions:
        Question.objects.filter(pk=old_question_id).delete()
    changes_to_delete_q.delete()
    TeacherMakeChangeQuestion.objects.filter(created_at__lte=datetime).delete()

def removeSubjectChangesUpTo(datetime):
    from apps.courses.api.models import TeacherMakeChangeSubject, Subject

    changes_to_delete_s = TeacherMakeChangeSubject.objects.filter(created_at__lte=datetime)
    old_subjects = changes_to_delete_s.exclude(old_subject__isnull=True).values_list('old_subject_id', flat=True)
    for old_subject_id in old_subjects:
        Subject.objects.filter(pk=old_subject_id).delete()
    changes_to_delete_s.delete()
    TeacherMakeChangeSubject.objects.filter(created_at__lte=datetime).delete()

def removeStudentGroupChangesUpTo(datetime):
    from apps.courses.api.models import TeacherMakeChangeStudentGroup, StudentGroup

    changes_to_delete_sg = TeacherMakeChangeStudentGroup.objects.filter(created_at__lte=datetime)
    old_groups = changes_to_delete_sg.exclude(old_group__isnull=True).values_list('old_group_id', flat=True)
    for old_group_id in old_groups:
        StudentGroup.objects.filter(pk=old_group_id).delete()
    changes_to_delete_sg.delete()
    TeacherMakeChangeStudentGroup.objects.filter(created_at__lte=datetime).delete()

def removeTopicChangesUpTo(datetime):
    from apps.content.api.models import TeacherMakeChangeTopic, Topic

    changes_to_delete_t = TeacherMakeChangeTopic.objects.filter(created_at__lte=datetime)
    old_topics = changes_to_delete_t.exclude(old_topic__isnull=True).values_list('old_topic_id', flat=True)
    for old_topic_id in old_topics:
        Topic.objects.filter(pk=old_topic_id).delete()
    changes_to_delete_t.delete()
    TeacherMakeChangeTopic.objects.filter(created_at__lte=datetime).delete()

def removeConceptChangesUpTo(datetime):
    from apps.content.api.models import TeacherMakeChangeConcept, Concept

    changes_to_delete_c = TeacherMakeChangeConcept.objects.filter(created_at__lte=datetime)
    old_concepts = changes_to_delete_c.exclude(old_concept__isnull=True).values_list('old_concept_id', flat=True)
    for old_concept_id in old_concepts:
        Concept.objects.filter(pk=old_concept_id).delete()
    changes_to_delete_c.delete()
    TeacherMakeChangeConcept.objects.filter(created_at__lte=datetime).delete()

def removeEpigraphChangesUpTo(datetime):
    from apps.content.api.models import TeacherMakeChangeEpigraph, Epigraph

    changes_to_delete_e = TeacherMakeChangeEpigraph.objects.filter(created_at__lte=datetime)
    old_epigraphs = changes_to_delete_e.exclude(old_epigraph__isnull=True).values_list('old_epigraph_id', flat=True)
    for old_epigraph_id in old_epigraphs:
        Epigraph.objects.filter(pk=old_epigraph_id).delete()
    changes_to_delete_e.delete()
    TeacherMakeChangeEpigraph.objects.filter(created_at__lte=datetime).delete()

def makeChanges(user, object, action, json_after=None):
    # import model classes locally to avoid circular imports
    from apps.evaluation.api.models import Question, Answer
    from apps.courses.api.models import Subject, StudentGroup
    from apps.content.api.models import Topic, Concept, Epigraph
    
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
    from apps.evaluation.api.models import TeacherMakeChangeQuestion
    from apps.evaluation.api.models import Question, QuestionBelongsToTopic, QuestionRelatedToConcept

    new_question_instance = object
    if action != 'deleted' and action != 'created':
        new_question_instance = Question.objects.create(
            type=type_,
            statement_es=statement_es,
            statement_en=statement_en,
            approved=approved,
            generated=generated,
        )
        # Copy topics and concepts if they exist on the original object
        if object and hasattr(object, 'topics') and object.topics.exists():
            for qbt in object.topics.all():
                QuestionBelongsToTopic.objects.create(question=new_question_instance, topic=qbt.topic)
        if object and hasattr(object, 'concepts') and object.concepts.exists():
            for qrc in object.concepts.all():
                QuestionRelatedToConcept.objects.create(question=new_question_instance, concept=qrc.concept)

    TeacherMakeChangeQuestion.objects.create(
        old_question=object if action != 'created' else None,
        new_question=new_question_instance,
        teacher=user,
        action=action,
    )

def makeChangesAnswer(user, object, action, json_after=None):
    teacher = user
    text_es = json_after.get('text_es') if json_after else object.text_es
    text_en = json_after.get('text_en') if json_after else object.text_en
    is_correct = json_after.get('is_correct') if json_after else object.is_correct
    
    from apps.evaluation.api.models import TeacherMakeChangeAnswer, Answer

    new_answer_instance = None
    if action != 'deleted':
        new_answer_instance = Answer.objects.create(
            question=object.question,
            text_es=text_es,
            text_en=text_en,
            is_correct=is_correct,
        )
    TeacherMakeChangeAnswer.objects.create(
        old_answer=object if action != 'created' else None,
        new_answer=new_answer_instance,
        teacher=teacher,
        action=action,
    )

def makeChangesSubject(user, object, action, json_after=None):
    teacher = user
    name_es = json_after.get('name_es') if json_after else object.name_es
    name_en = json_after.get('name_en') if json_after else object.name_en
    description_es = json_after.get('description_es') if json_after else object.description_es
    description_en = json_after.get('description_en') if json_after else object.description_en
    
    from apps.courses.api.models import TeacherMakeChangeSubject, Subject

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
    
    from apps.courses.api.models import TeacherMakeChangeStudentGroup, StudentGroup

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
    
    from apps.content.api.models import TeacherMakeChangeTopic, Topic

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
    
    from apps.content.api.models import TeacherMakeChangeConcept, Concept

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
    from apps.content.api.models import TeacherMakeChangeEpigraph, Epigraph

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