<<<<<<< HEAD
from types import SimpleNamespace
from rest_framework import status
from apps.evaluation.api.views import QuestionViewSet

def test_create_question_calls_service_and_returns_serializer_data(mocker):
    payload = {
        'type': 'multiple_choice',
        'statement_es': 'Enunciado ES',
        'statement_en': 'Statement EN',
        'approved': True,
        'generated': False
    }
    create_mock = mocker.patch('apps.evaluation.api.views.services.create_question')
    mocked_serializer = mocker.Mock()
    mocked_serializer.data = {'id': 123, 'type': payload['type']}
    mocker.patch.object(QuestionViewSet, 'get_serializer', return_value=mocked_serializer)

    request = SimpleNamespace(data=payload)
    view = QuestionViewSet()

    response = view.create(request)

    create_mock.assert_called_once_with(
        type=payload['type'],
        statement_es=payload['statement_es'],
        statement_en=payload['statement_en'],
        approved=payload['approved'],
        generated=payload['generated'],
        topics=None,
        concepts=None
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data == mocked_serializer.data


def test_update_question_calls_service_and_returns_serializer_data(mocker):
    existing_question = object()
    updated_question = object()
    payload = {
        'type': 'true_false',
        'statement_es': 'Actualizado ES',
        'statement_en': 'Updated EN',
        'approved': False,
        'generated': True,
        'topics': [1, 2],
        'concepts': [3]
    }

    update_mock = mocker.patch('apps.evaluation.api.views.services.update_question', return_value=updated_question)
    mocked_serializer = mocker.Mock()
    mocked_serializer.data = {'id': 555, 'type': payload['type']}
    mocker.patch.object(QuestionViewSet, 'get_serializer', return_value=mocked_serializer)

    view = QuestionViewSet()
    # ensure get_object returns the existing question instance the view expects
    mocker.patch.object(QuestionViewSet, 'get_object', return_value=existing_question)

    request = SimpleNamespace(data=payload)
    response = view.update(request)

    update_mock.assert_called_once_with(
        existing_question,
        type=payload['type'],
        statement_es=payload['statement_es'],
        statement_en=payload['statement_en'],
        approved=payload['approved'],
        generated=payload['generated'],
        topics=payload['topics'],
        concepts=payload['concepts']
    )
    assert response.status_code == 200
    assert response.data == mocked_serializer.data


def test_destroy_question_calls_service_and_returns_no_content(mocker):
    existing_question = object()
    delete_mock = mocker.patch('apps.evaluation.api.views.services.delete_question')
    view = QuestionViewSet()
    mocker.patch.object(QuestionViewSet, 'get_object', return_value=existing_question)

    request = SimpleNamespace(data={})
    response = view.destroy(request)

    delete_mock.assert_called_once_with(existing_question)
    assert response.status_code == status.HTTP_204_NO_CONTENT
=======
import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from unittest.mock import patch, MagicMock

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def topic_data():
    return {
        'title_es': 'Tema ES',
        'title_en': 'Topic EN',
        'description_es': 'Descripción ES',
        'description_en': 'Description EN'
    }

@pytest.fixture
def epigraph_data():
    return {
        'name_es': 'Epígrafe ES',
        'name_en': 'Epigraph EN',
        'order_id': 1,
        'description_es': 'Desc ES',
        'description_en': 'Desc EN'
    }

@pytest.fixture
def concept_data():
    return {
        'concept_name': 'Concepto',
        'order_id': 1
    }

@pytest.mark.django_db
@patch('backend.apps.content.api.views.services.create_topic')
def test_create_topic_success(mock_create_topic, api_client, topic_data):
    mock_topic = MagicMock(id=1)
    mock_create_topic.return_value = mock_topic
    url = reverse('topic-list')
    with patch('backend.apps.content.api.views.TopicSerializer') as mock_serializer:
        mock_serializer.return_value.data = {'id': 1}
        response = api_client.post(url, topic_data, format='json')
    assert response.status_code == 201
    assert response.data['id'] == 1

@pytest.mark.django_db
@patch('backend.apps.content.api.views.services.create_topic')
def test_create_topic_error(mock_create_topic, api_client, topic_data):
    mock_create_topic.side_effect = Exception('Error')
    url = reverse('topic-list')
    response = api_client.post(url, topic_data, format='json')
    assert response.status_code == 400
    assert 'detail' in response.data

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_concepts_by_topic')
def test_get_concepts_by_topic(mock_get_concepts, api_client):
    mock_get_concepts.return_value = []
    url = reverse('topic-concepts', args=[1])
    with patch('backend.apps.content.api.views.ConceptSerializer') as mock_serializer:
        mock_serializer.return_value.data = []
        response = api_client.get(url)
    assert response.status_code == 200
    assert response.data == []

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_epigraphs_by_topic')
def test_get_epigraphs_by_topic(mock_get_epigraphs, api_client):
    mock_get_epigraphs.return_value = []
    url = reverse('topic-epigraphs', args=[1])
    with patch('backend.apps.content.api.views.EpigraphSerializer') as mock_serializer:
        mock_serializer.return_value.data = []
        response = api_client.get(url)
    assert response.status_code == 200
    assert response.data == []

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_topic_by_id')
@patch('backend.apps.content.api.views.services.create_epigraph')
def test_create_epigraph_success(mock_create_epigraph, mock_get_topic, api_client, epigraph_data):
    mock_topic = MagicMock(id=1)
    mock_get_topic.return_value = mock_topic
    mock_epigraph = MagicMock(id=2)
    mock_create_epigraph.return_value = mock_epigraph
    url = reverse('topic-epigraphs-create-epigraph', args=[1])
    with patch('backend.apps.content.api.views.EpigraphSerializer') as mock_serializer:
        mock_serializer.return_value.data = {'id': 2}
        response = api_client.post(url, epigraph_data, format='json')
    assert response.status_code == 201
    assert response.data['id'] == 2

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_topic_by_id')
@patch('backend.apps.content.api.views.services.create_epigraph')
def test_create_epigraph_error(mock_create_epigraph, mock_get_topic, api_client, epigraph_data):
    mock_topic = MagicMock(id=1)
    mock_get_topic.return_value = mock_topic
    mock_create_epigraph.side_effect = Exception('Error')
    url = reverse('topic-epigraphs-create-epigraph', args=[1])
    response = api_client.post(url, epigraph_data, format='json')
    assert response.status_code == 400
    assert 'detail' in response.data

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_topic_by_id')
@patch('backend.apps.content.api.views.selectors.get_epigraph_by_id')
@patch('backend.apps.content.api.views.services.update_epigraph')
def test_update_epigraph_success(mock_update_epigraph, mock_get_epigraph, mock_get_topic, api_client, epigraph_data):
    mock_topic = MagicMock(id=1)
    mock_epigraph = MagicMock(id=2)
    mock_epigraph.topic = mock_topic
    mock_get_topic.return_value = mock_topic
    mock_get_epigraph.return_value = mock_epigraph
    mock_update_epigraph.return_value = mock_epigraph
    url = reverse('topic-update-epigraph', args=[1, 1])
    with patch('backend.apps.content.api.views.EpigraphSerializer') as mock_serializer:
        mock_serializer.return_value.data = {'id': 2}
        response = api_client.put(url, epigraph_data, format='json')
    assert response.status_code == 200
    assert response.data['id'] == 2

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_topic_by_id')
@patch('backend.apps.content.api.views.selectors.get_epigraph_by_id')
def test_update_epigraph_wrong_topic(mock_get_epigraph, mock_get_topic, api_client, epigraph_data):
    mock_topic = MagicMock(id=1)
    mock_other_topic = MagicMock(id=2)
    mock_epigraph = MagicMock(id=2)
    mock_epigraph.topic = mock_other_topic
    mock_get_topic.return_value = mock_topic
    mock_get_epigraph.return_value = mock_epigraph
    url = reverse('topic-update-epigraph', args=[1, 1])
    response = api_client.put(url, epigraph_data, format='json')
    assert response.status_code == 400
    assert 'detail' in response.data

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_topic_by_id')
@patch('backend.apps.content.api.views.selectors.get_epigraph_by_id')
@patch('backend.apps.content.api.views.services.update_epigraph')
def test_update_epigraph_error(mock_update_epigraph, mock_get_epigraph, mock_get_topic, api_client, epigraph_data):
    mock_topic = MagicMock(id=1)
    mock_epigraph = MagicMock(id=2)
    mock_epigraph.topic = mock_topic
    mock_get_topic.return_value = mock_topic
    mock_get_epigraph.return_value = mock_epigraph
    mock_update_epigraph.side_effect = Exception('Error')
    url = reverse('topic-update-epigraph', args=[1, 1])
    response = api_client.put(url, epigraph_data, format='json')
    assert response.status_code == 400
    assert 'detail' in response.data

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_topic_by_id')
@patch('backend.apps.content.api.views.selectors.get_concept_by_name')
@patch('backend.apps.content.api.views.services.link_concept_to_topic')
def test_link_concept_success(mock_link_concept, mock_get_concept, mock_get_topic, api_client, concept_data):
    mock_topic = MagicMock(id=1)
    mock_concept = MagicMock(id=2)
    mock_link = MagicMock(order_id=1)
    mock_get_topic.return_value = mock_topic
    mock_get_concept.return_value = mock_concept
    mock_link_concept.return_value = mock_link
    url = reverse('topic-concepts-link-concept', args=[1])
    response = api_client.post(url, concept_data, format='json')
    assert response.status_code == 200
    assert response.data['message'] == 'Concept linked to topic successfully'

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_topic_by_id')
@patch('backend.apps.content.api.views.selectors.get_concept_by_name')
def test_link_concept_not_found(mock_get_concept, mock_get_topic, api_client, concept_data):
    mock_topic = MagicMock(id=1)
    mock_get_topic.return_value = mock_topic
    mock_get_concept.return_value = None
    url = reverse('topic-concepts-link-concept', args=[1])
    response = api_client.post(url, concept_data, format='json')
    assert response.status_code == 404
    assert response.data['detail'] == 'Concept not found'

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_topic_by_id')
@patch('backend.apps.content.api.views.selectors.get_concept_by_name')
@patch('backend.apps.content.api.views.services.link_concept_to_topic')
def test_link_concept_error(mock_link_concept, mock_get_concept, mock_get_topic, api_client, concept_data):
    mock_topic = MagicMock(id=1)
    mock_concept = MagicMock(id=2)
    mock_get_topic.return_value = mock_topic
    mock_get_concept.return_value = mock_concept
    mock_link_concept.side_effect = Exception('Error')
    url = reverse('topic-concepts-link-concept', args=[1])
    response = api_client.post(url, concept_data, format='json')
    assert response.status_code == 400
    assert 'detail' in response.data

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_topic_by_id')
@patch('backend.apps.content.api.views.selectors.get_concept_by_name')
@patch('backend.apps.content.api.views.services.unlink_concept_from_topic')
def test_unlink_concept_success(mock_unlink_concept, mock_get_concept, mock_get_topic, api_client, concept_data):
    mock_topic = MagicMock(id=1)
    mock_concept = MagicMock(id=2)
    mock_unlink_concept.return_value = MagicMock()
    mock_get_topic.return_value = mock_topic
    mock_get_concept.return_value = mock_concept
    url = reverse('topic-concepts-unlink-concept', args=[1])
    response = api_client.delete(url, concept_data, format='json')
    assert response.status_code == 200
    assert response.data['message'] == 'Concept linked to topic removed successfully'

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_topic_by_id')
@patch('backend.apps.content.api.views.selectors.get_concept_by_name')
def test_unlink_concept_not_found(mock_get_concept, mock_get_topic, api_client, concept_data):
    mock_topic = MagicMock(id=1)
    mock_get_topic.return_value = mock_topic
    mock_get_concept.return_value = None
    url = reverse('topic-concepts-unlink-concept', args=[1])
    response = api_client.delete(url, concept_data, format='json')
    assert response.status_code == 404
    assert response.data['detail'] == 'Concept not found'

@pytest.mark.django_db
@patch('backend.apps.content.api.views.selectors.get_topic_by_id')
@patch('backend.apps.content.api.views.selectors.get_concept_by_name')
@patch('backend.apps.content.api.views.services.unlink_concept_from_topic')
def test_unlink_concept_error(mock_unlink_concept, mock_get_concept, mock_get_topic, api_client, concept_data):
    mock_topic = MagicMock(id=1)
    mock_concept = MagicMock(id=2)
    mock_get_topic.return_value = mock_topic
    mock_get_concept.return_value = mock_concept
    mock_unlink_concept.side_effect = Exception('Error')
    url = reverse('topic-concepts-unlink-concept', args=[1])
    response = api_client.delete(url, concept_data, format='json')
    assert response.status_code == 400
    assert 'detail' in response.data
>>>>>>> bb36cba (.)
