import pytest
from django.forms import ValidationError
from unittest.mock import patch

from apps.evaluation.domain import services, selectors
from apps.evaluation.api.models import Question, Answer, QuestionBelongsToTopic, QuestionRelatedToConcept
from apps.content.api.models import Topic, Concept, Subject
from apps.courses.domain import services as course_services
from apps.content.domain import services as content_services
from apps.customauth.models import CustomTeacher

pytestmark = pytest.mark.django_db

# --- Fixtures ---

@pytest.fixture
def subject():
    return course_services.create_subject(name_es="Asignatura de prueba", name_en="Test Subject", description_en="Description", description_es="Descripción")

@pytest.fixture
def user():
    return CustomTeacher.objects.create_user(username="testuser", password="password")

@pytest.fixture
def topic1(subject):
    return content_services.create_topic(title_en="Topic 1", title_es="Tema 1", description_en="Description", description_es="Descripción")

@pytest.fixture
def topic2(subject):
    return content_services.create_topic(title_en="Topic 2", title_es="Tema 2", description_en="Description", description_es="Descripción")

@pytest.fixture
def concept1(topic1):
    concept1 = content_services.create_concept(name_es="Concepto 1", name_en="Concept 1", description_es="Descripción", description_en="Description")
    content_services.link_concept_to_topic(topic1, concept1, order_id=1)
    return concept1

@pytest.fixture
def concept2(topic1):
    concept2 = content_services.create_concept(name_es="Concepto 2", name_en="Concept 2", description_es="Descripción", description_en="Description")
    content_services.link_concept_to_topic(topic1, concept2, order_id=2)
    return concept2

@pytest.fixture
def question_data():
    return {
        'type': 'multiple',
        'statement_es': '¿Cuál es la capital de España?',
        'statement_en': 'What is the capital of Spain?',
        'approved': True,
        'generated': False,
    }

@pytest.fixture
def question(user, question_data):
    return services.create_question(user=user, **question_data)

@pytest.fixture
def subject():
    return course_services.create_subject(name_es="Asignatura", name_en="Subject", description_en="Description", description_es="Descripción")

@pytest.fixture
def student_groupA(user, subject):
    return course_services.create_student_group(
        subject=subject,
        name_es="Grupo 1",
        name_en="Group 1",
        teacher=user,
        groupCode="G1"
    )

@pytest.fixture
def student_groupB(user, subject):
    return course_services.create_student_group(
        subject=subject,
        name_es="Grupo B",
        name_en="Group B",
        teacher=user,
        groupCode="G2"
    )

@pytest.fixture
def question_with_answers(user):
    question = services.create_question(user=user, type='multiple', statement_es='Q1', statement_en='Q1')
    services.create_answer(user=user, question=question, text_es='A1', text_en='A1', is_correct=True)
    services.create_answer(user=user, question=question, text_es='A2', text_en='A2', is_correct=False)
    return question

@pytest.fixture
def question_with_answers_2(user):
    question = services.create_question(user=user, type='multiple', statement_es='Q2', statement_en='Q2')
    services.create_answer(user=user, question=question, text_es='B1', text_en='B1', is_correct=True)
    services.create_answer(user=user, question=question, text_es='B2', text_en='B2', is_correct=False)
    return question

# --- Question Service Tests ---

def test_create_question(user, question_data):
    question = services.create_question(user=user, **question_data)
    assert Question.objects.count() == 1
    assert question.type == question_data['type']
    assert question.statement_es == question_data['statement_es']
    assert question.approved

def test_create_question_with_topics_and_concepts(user, question_data, topic1, concept1):
    question = services.create_question(
        user=user,
        **question_data,
        topics=set([topic1]),
        concepts=set([concept1])
    )
    assert question.topics.count() == 1
    assert question.concepts.count() == 1
    assert QuestionBelongsToTopic.objects.filter(question=question, topic=topic1).exists()
    assert QuestionRelatedToConcept.objects.filter(question=question, concept=concept1).exists()

def test_create_question_raises_validation_error_on_missing_statement(user):
    with pytest.raises(ValidationError, match="Debe proporcionar el enunciado en ambos idiomas."):
        services.create_question(user=user, type='multiple', statement_es='Solo ES')

def test_update_question_basic_fields(user, question):
    updated_question = services.update_question(
        user=user,
        question=question,
        statement_es="Nuevo enunciado",
        approved=False
    )
    assert updated_question.statement_es == "Nuevo enunciado"
    assert not updated_question.approved

@patch('apps.content.domain.selectors.get_topic_by_title')
@patch('apps.content.domain.selectors.get_concept_by_name')
def test_update_question_topics_and_concepts(mock_get_concept, mock_get_topic, user, question, topic1, topic2, concept1, concept2):
    mock_get_topic.side_effect = [topic1, topic2]
    mock_get_concept.side_effect = [concept1, concept2]
    QuestionBelongsToTopic.objects.create(question=question, topic=topic1)
    
    services.update_question(
        user=user,
        question=question,
        topics=["Topic 1", "Topic 2"],
        concepts=["Concept 1", "Concept 2"]
    )
    
    assert question.topics.count() == 2
    assert {str(t.topic) for t in question.topics.all()} == {"Tema 1", "Tema 2"}
    assert question.concepts.count() == 2
    assert {str(c.concept) for c in question.concepts.all()} == {"Concepto 1", "Concepto 2"}

def test_update_question_to_true_false(user, question):
    services.create_answer(user=user, question=question, text_es="A", text_en="A")
    assert question.answers.count() == 1

    services.update_question(user=user, question=question, type='true_false', is_true=True)

    assert question.type == 'true_false'
    assert question.answers.count() == 2
    assert question.answers.filter(is_correct=True).first().text_en == 'True'
    assert question.answers.filter(is_correct=False).first().text_en == 'False'

def test_update_question_to_true_false_requires_is_true(user, question):
    with pytest.raises(ValidationError, match="Debe proporcionar el valor de is_true"):
        services.update_question(user=user, question=question, type='true_false')

def test_delete_question(user, question):
    assert Question.objects.count() == 1
    services.delete_question(user=user, question=question)
    assert Question.objects.count() == 0

# --- Answer Service Tests ---

@pytest.fixture
def answer_data(question):
    return {
        'question': question,
        'text_es': 'Madrid',
        'text_en': 'Madrid',
        'is_correct': True,
    }

def test_create_answer(user, answer_data):
    answer = services.create_answer(user=user, **answer_data)
    assert Answer.objects.count() == 1
    assert answer.question == answer_data['question']
    assert answer.text_es == 'Madrid'
    assert answer.is_correct

def test_create_answer_raises_validation_error_on_missing_text(user):
    with pytest.raises(ValidationError, match="Debe proporcionar el texto de la respuesta en ambos idiomas."):
        services.create_answer(user=user, question=Question(), text_es='Solo ES')

def test_update_answer(user, answer_data):
    answer = services.create_answer(user=user, **answer_data)
    updated_answer = services.update_answer(
        user=user,
        answer=answer,
        text_en="New Answer",
        is_correct=False
    )
    assert updated_answer.text_en == "New Answer"
    assert not updated_answer.is_correct

def test_delete_answer(user, answer_data):
    answer = services.create_answer(user=user, **answer_data)
    assert Answer.objects.count() == 1
    services.delete_answer(user=user, answer=answer)
    assert Answer.objects.count() == 0

def test_update_question_type_true_false_with_is_true_false(user, question):
    """
    Tests that when a question is updated to 'true_false' with is_true=False,
    the correct answers are created.
    """
    services.update_question(user=user, question=question, type='true_false', is_true=False)

    assert question.answers.count() == 2
    correct_answer = question.answers.get(is_correct=True)
    incorrect_answer = question.answers.get(is_correct=False)

    assert correct_answer.text_es == 'Falso'
    assert correct_answer.text_en == 'False'
    assert incorrect_answer.text_es == 'Verdadero'
    assert incorrect_answer.text_en == 'True'

def test_update_question_type_true_false_overwrites_existing_answers(user, question):
    """
    Tests that when a question is updated to 'true_false',
    existing answers are deleted and replaced with true/false answers.
    """
    services.create_answer(user=user, question=question, text_es="Old Answer", text_en="Old Answer")

    assert question.answers.count() == 1

    services.update_question(user=user, question=question, type='true_false', is_true=True)

    assert question.answers.count() == 2
    correct_answer = question.answers.get(is_correct=True)
    incorrect_answer = question.answers.get(is_correct=False)

    assert correct_answer.text_es == 'Verdadero'
    assert correct_answer.text_en == 'True'
    assert incorrect_answer.text_es == 'Falso'
    assert incorrect_answer.text_en == 'False'

def test_update_question_type_non_true_false_doesnt_remove_true_false_answers(user, question):
    """
    Tests that when a question is updated to a non 'true_false' type,
    existing true/false answers are deleted.
    """
    services.update_question(user=user, question=question, type='true_false', is_true=True)
    assert question.answers.count() == 2

    services.update_question(user=user, question=question, type='multiple')
    assert question.answers.count() == 2

# --- Evaluation Service Tests (evaluate_question) ---

def test_evaluate_question_correct_answer(user, student_groupA, question_with_answers):
    correct_answer = question_with_answers.answers.get(is_correct=True)
    is_correct = services.evaluate_question(student_groupA, question_with_answers, correct_answer)
    assert is_correct

    assert selectors.get_question_evaluation_ev_count(question_with_answers) == 1
    assert selectors.get_question_evaluation_correct_count(question_with_answers) == 1

def test_evaluate_question_incorrect_answer(user, student_groupA, question_with_answers):
    incorrect_answer = question_with_answers.answers.get(is_correct=False)
    is_correct = services.evaluate_question(student_groupA, question_with_answers, incorrect_answer)
    assert not is_correct

    assert selectors.get_question_evaluation_ev_count(question_with_answers)== 1
    assert selectors.get_question_evaluation_correct_count(question_with_answers)== 0

def test_evaluate_question_multiple_times(user, student_groupA, question_with_answers):
    correct_answer = question_with_answers.answers.get(is_correct=True)
    incorrect_answer = question_with_answers.answers.get(is_correct=False)

    services.evaluate_question(student_groupA, question_with_answers, correct_answer)
    services.evaluate_question(student_groupA, question_with_answers, incorrect_answer)
    services.evaluate_question(student_groupA, question_with_answers, correct_answer)

    assert selectors.get_question_evaluation_ev_count(question_with_answers) == 3
    assert selectors.get_question_evaluation_correct_count(question_with_answers) == 2

def test_evaluate_question_different_groups(user, question_with_answers, student_groupA, student_groupB):

    correct_answer = question_with_answers.answers.get(is_correct=True)

    services.evaluate_question(student_groupA, question_with_answers, correct_answer)
    services.evaluate_question(student_groupB, question_with_answers, correct_answer)

    assert selectors.get_question_evaluation_ev_count(question_with_answers) == 2
    assert selectors.get_question_evaluation_correct_count(question_with_answers) == 2

def test_evaluate_question_invalid_answer_raises_error(user, student_groupA, question_with_answers):
    other_question = services.create_question(user=user, type='multiple', statement_es='Otra pregunta', statement_en='Another question')
    other_answer = services.create_answer(user=user, question=other_question, text_es='Otra respuesta', text_en='Another answer', is_correct=True)

    with pytest.raises(ValidationError, match="La respuesta proporcionada no pertenece a la pregunta dada."):
        services.evaluate_question(student_groupA, question_with_answers, other_answer)

def test_evaluate_question_no_existing_evaluation_record(user, student_groupA, question_with_answers):
    correct_answer = question_with_answers.answers.get(is_correct=True)

    assert not selectors.get_question_evaluation_group(question_with_answers, student_groupA)

    services.evaluate_question(student_groupA, question_with_answers, correct_answer)

    qeg = selectors.get_question_evaluation_group(question_with_answers, student_groupA)
    assert qeg.ev_count == 1
    assert qeg.correct_count == 1

# --- Evaluation Service Tests (create_exam) ---

def test_create_exam_enough_questions(user, topic1, topic2, question_with_answers, question_with_answers_2):

    questions = [question_with_answers, question_with_answers_2]
    
    QuestionBelongsToTopic.objects.create(question=question_with_answers, topic=topic1)
    QuestionBelongsToTopic.objects.create(question=question_with_answers_2, topic=topic2)

    exam_questions = services.create_exam(user, [topic1, topic2], 2)
    assert len(exam_questions) == 2
    assert set(exam_questions) == set(questions)

def test_create_exam_not_enough_questions(user, topic1, question_with_answers):

    QuestionBelongsToTopic.objects.create(question=question_with_answers, topic=topic1)

    exam_questions = services.create_exam(user, [topic1], 3)
    assert len(exam_questions) == 1
    assert exam_questions[0] == question_with_answers

def test_create_exam_no_questions(user, topic1):

    exam_questions = services.create_exam(user, [topic1], 2)
    assert len(exam_questions) == 0

def test_create_exam_duplicates_across_topics(user, topic1, topic2, question_with_answers):

    QuestionBelongsToTopic.objects.create(question=question_with_answers, topic=topic1)
    QuestionBelongsToTopic.objects.create(question=question_with_answers, topic=topic2)

    exam_questions = services.create_exam(user, [topic1, topic2], 2)
    assert len(exam_questions) == 1
    assert exam_questions[0] == question_with_answers

def test_create_exam_partial_availability(user, topic1, topic2, question_with_answers):

    QuestionBelongsToTopic.objects.create(question=question_with_answers, topic=topic1)

    exam_questions = services.create_exam(user, [topic1, topic2], 2)
    assert len(exam_questions) == 1
    assert exam_questions[0] == question_with_answers

# --- Evaluation Service Tests (correct_exam) ---

def test_correct_exam_all_correct(user, student_groupA, question_with_answers, question_with_answers_2):
    questions_and_answers = {
        question_with_answers: question_with_answers.answers.get(is_correct=True),
        question_with_answers_2: question_with_answers_2.answers.get(is_correct=True),
    }

    mark = services.correct_exam(student_groupA, questions_and_answers)
    assert mark == 2

    assert selectors.get_question_evaluation_correct_count(question_with_answers) == 1
    assert selectors.get_question_evaluation_correct_count(question_with_answers_2) == 1
    assert selectors.get_question_evaluation_ev_count(question_with_answers) == 1
    assert selectors.get_question_evaluation_ev_count(question_with_answers_2) == 1

def test_correct_exam_some_incorrect(user, student_groupA, question_with_answers, question_with_answers_2):
    questions_and_answers = {
        question_with_answers: question_with_answers.answers.get(is_correct=True),
        question_with_answers_2: question_with_answers_2.answers.get(is_correct=False),
    }

    mark = services.correct_exam(student_groupA, questions_and_answers)
    assert mark == 1

    assert selectors.get_question_evaluation_correct_count(question_with_answers) == 1
    assert selectors.get_question_evaluation_correct_count(question_with_answers_2) == 0
    assert selectors.get_question_evaluation_ev_count(question_with_answers) == 1
    assert selectors.get_question_evaluation_ev_count(question_with_answers_2) == 1

def test_correct_exam_all_incorrect(user, student_groupA, question_with_answers, question_with_answers_2):
    questions_and_answers = {
        question_with_answers: question_with_answers.answers.get(is_correct=False),
        question_with_answers_2: question_with_answers_2.answers.get(is_correct=False),
    }

    mark = services.correct_exam(student_groupA, questions_and_answers)
    assert mark == 0

    assert selectors.get_question_evaluation_correct_count(question_with_answers) == 0
    assert selectors.get_question_evaluation_correct_count(question_with_answers_2) == 0
    assert selectors.get_question_evaluation_ev_count(question_with_answers) == 1
    assert selectors.get_question_evaluation_ev_count(question_with_answers_2) == 1

def test_create_and_correct_exam_integration(user, topic1, topic2, student_groupA, question_with_answers, question_with_answers_2):

    QuestionBelongsToTopic.objects.create(question=question_with_answers, topic=topic1)
    QuestionBelongsToTopic.objects.create(question=question_with_answers_2, topic=topic2)

    exam_questions = services.create_exam(user, [topic1, topic2], 2)
    assert len(exam_questions) == 2

    questions_and_answers = {
        exam_questions[0]: exam_questions[0].answers.get(is_correct=True),
        exam_questions[1]: exam_questions[1].answers.get(is_correct=False),
    }

    mark = services.correct_exam(student_groupA, questions_and_answers)
    assert mark == 1

    for question in exam_questions:
        assert selectors.get_question_evaluation_ev_count(question) == 1
        if question == exam_questions[0]:
            assert selectors.get_question_evaluation_correct_count(question) == 1
        else:
            assert selectors.get_question_evaluation_correct_count(question) == 0

def test_create_exam_with_insufficient_unique_questions(user, topic1, question_with_answers):

    QuestionBelongsToTopic.objects.create(question=question_with_answers, topic=topic1)

    exam_questions = services.create_exam(user, [topic1], 5)
    assert len(exam_questions) == 1
    assert exam_questions[0] == question_with_answers

def test_correct_exam_no_questions(user, student_groupA):
    questions_and_answers = {}

    mark = services.correct_exam(student_groupA, questions_and_answers)
    assert mark == 0

    