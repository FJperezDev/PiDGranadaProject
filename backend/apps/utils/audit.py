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

def makeChanges(user, old_object=None, new_object=None):
    return
    # from apps.evaluation.api.models import Question, Answer
    # from apps.courses.api.models import Subject, StudentGroup
    # from apps.content.api.models import Topic, Concept, Epigraph
    # if isinstance(old_object, Question) or isinstance(new_object, Question):
    #     makeChangesQuestion(user, old_object, new_object)
    # elif isinstance(old_object, Answer) or isinstance(new_object, Answer):
    #     makeChangesAnswer(user, old_object, new_object)
    # elif isinstance(old_object, Subject) or isinstance(new_object, Subject):
    #     makeChangesSubject(user, old_object, new_object)
    # elif isinstance(old_object, StudentGroup) or isinstance(new_object, StudentGroup):
    #     makeChangesStudentGroup(user, old_object, new_object)
    # elif isinstance(old_object, Topic) or isinstance(new_object, Topic):
    #     makeChangesTopic(user, old_object, new_object)
    # elif isinstance(old_object, Concept) or isinstance(new_object, Concept):
    #     makeChangesConcept(user, old_object, new_object)
    # elif isinstance(old_object, Epigraph) or isinstance(new_object, Epigraph):
    #     makeChangesEpigraph(user, old_object, new_object)
    # else:
    #     raise ValueError(f"Unsupported object type: {type(object)}")

def makeChangesQuestion(user, old_object, new_object):
    from apps.evaluation.api.models import TeacherMakeChangeQuestion
    
    TeacherMakeChangeQuestion.objects.create(
        old_object=old_object,
        new_object=new_object,
        teacher=user,
    )

def makeChangesAnswer(user, old_object, new_object):
    
    from apps.evaluation.api.models import TeacherMakeChangeAnswer

    TeacherMakeChangeAnswer.objects.create(
        old_object=old_object,
        new_object=new_object,
        teacher=user,
    )

def makeChangesSubject(user, old_object, new_object):
    
    from apps.courses.api.models import TeacherMakeChangeSubject
    
    TeacherMakeChangeSubject.objects.create(
        old_object=old_object,
        new_object=new_object,
        teacher=user,
    )

def makeChangesStudentGroup(user, old_object, new_object):
    
    from apps.courses.api.models import TeacherMakeChangeStudentGroup

    TeacherMakeChangeStudentGroup.objects.create(
        old_object=old_object,
        new_object=new_object,
        teacher=user,
    )

def makeChangesTopic(user, old_object, new_object):
    
    from apps.content.api.models import TeacherMakeChangeTopic

    TeacherMakeChangeTopic.objects.create(
        old_object=old_object,
        new_object=new_object,
        teacher=user,
    )

def makeChangesConcept(user, old_object, new_object):
    
    from apps.content.api.models import TeacherMakeChangeConcept

    TeacherMakeChangeConcept.objects.create(
        old_object=old_object,
        new_object=new_object,
        teacher=user,
    )

def makeChangesEpigraph(user, old_object, new_object):
    from apps.content.api.models import TeacherMakeChangeEpigraph
    TeacherMakeChangeEpigraph.objects.create(
        old_object=old_object,
        new_object=new_object,
        teacher=user,
    )