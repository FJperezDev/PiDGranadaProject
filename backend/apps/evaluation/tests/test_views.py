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