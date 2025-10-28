import pytest
from django.forms import ValidationError

from apps.evaluation.domain import services
from apps.evaluation.api.models import Question, Answer, QuestionBelongsToTopic, QuestionRelatedToConcept
from apps.content.api.models import Topic, Concept, Subject
from apps.courses.domain import services as course_services
from apps.content.domain import services as content_services

pytestmark = pytest.mark.django_db

# --- Fixtures ---

@pytest.fixture
def subject():
    return course_services.create_subject(name_es="Asignatura de prueba", name_en="Test Subject", description_en="Description", description_es="Descripción")

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
def question(question_data):
    return services.create_question(**question_data)

# --- Question Service Tests ---

def test_create_question(question_data):
    question = services.create_question(**question_data)
    assert Question.objects.count() == 1
    assert question.type == question_data['type']
    assert question.statement_es == question_data['statement_es']
    assert question.approved

def test_create_question_with_topics_and_concepts(question_data, topic1, concept1):
    question = services.create_question(
        **question_data,
        topics=set([topic1]),
        concepts=set([concept1])
    )
    assert question.topics.count() == 1
    assert question.concepts.count() == 1
    assert QuestionBelongsToTopic.objects.filter(question=question, topic=topic1).exists()
    assert QuestionRelatedToConcept.objects.filter(question=question, concept=concept1).exists()

def test_create_question_raises_validation_error_on_missing_statement():
    with pytest.raises(ValidationError, match="Debe proporcionar el enunciado en ambos idiomas."):
        services.create_question(type='multiple', statement_es='Solo ES')

def test_update_question_basic_fields(question):
    updated_question = services.update_question(
        question,
        statement_es="Nuevo enunciado",
        approved=False
    )
    assert updated_question.statement_es == "Nuevo enunciado"
    assert not updated_question.approved

def test_update_question_topics_and_concepts(mocker, question, topic1, topic2, concept1, concept2):
    # Mock selectors used in update_question
    mocker.patch('apps.content.domain.selectors.get_topic_by_title', side_effect=[topic1, topic2])
    mocker.patch('apps.content.domain.selectors.get_concept_by_name', side_effect=[concept1, concept2])

    QuestionBelongsToTopic.objects.create(question=question, topic=topic1)
    
    services.update_question(
        question,
        topics=["Topic 1", "Topic 2"],
        concepts=["Concept 1", "Concept 2"]
    )
    
    assert question.topics.count() == 2
    assert {str(t.topic) for t in question.topics.all()} == {"Tema 1", "Tema 2"}
    assert question.concepts.count() == 2
    assert {str(c.concept) for c in question.concepts.all()} == {"Concepto 1", "Concepto 2"}

def test_update_question_to_true_false(question):
    services.create_answer(question, text_es="A", text_en="A")
    assert question.answers.count() == 1

    services.update_question(question, type='true_false', is_true=True)

    assert question.type == 'true_false'
    assert question.answers.count() == 2
    assert question.answers.filter(is_correct=True).first().text_en == 'True'
    assert question.answers.filter(is_correct=False).first().text_en == 'False'

def test_update_question_to_true_false_requires_is_true(question):
    with pytest.raises(ValidationError, match="Debe proporcionar el valor de is_true"):
        services.update_question(question, type='true_false')

def test_delete_question(question):
    assert Question.objects.count() == 1
    services.delete_question(question)
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

def test_create_answer(answer_data):
    answer = services.create_answer(**answer_data)
    assert Answer.objects.count() == 1
    assert answer.question == answer_data['question']
    assert answer.text_es == 'Madrid'
    assert answer.is_correct

def test_create_answer_raises_validation_error_on_missing_text():
    with pytest.raises(ValidationError, match="Debe proporcionar el texto de la respuesta en ambos idiomas."):
        services.create_answer(question=Question(), text_es='Solo ES')

def test_update_answer(answer_data):
    answer = services.create_answer(**answer_data)
    updated_answer = services.update_answer(
        answer,
        text_en="New Answer",
        is_correct=False
    )
    assert updated_answer.text_en == "New Answer"
    assert not updated_answer.is_correct

def test_delete_answer(answer_data):
    answer = services.create_answer(**answer_data)
    assert Answer.objects.count() == 1
    print(answer.id)
    services.delete_answer(answer)
    assert Answer.objects.count() == 0

def test_update_question_type_true_false_with_is_true_false(question):
    """
    Tests that when a question is updated to 'true_false' with is_true=False,
    the correct answers are created.
    """
    services.update_question(question, type='true_false', is_true=False)

    assert question.answers.count() == 2
    correct_answer = question.answers.get(is_correct=True)
    incorrect_answer = question.answers.get(is_correct=False)

    assert correct_answer.text_es == 'Falso'
    assert correct_answer.text_en == 'False'
    assert incorrect_answer.text_es == 'Verdadero'
    assert incorrect_answer.text_en == 'True'