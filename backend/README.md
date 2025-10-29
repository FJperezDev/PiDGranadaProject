# Backend Documentation - Proyecto PiD

This document provides an overview of the backend for the "Proyecto PiD" application. The backend is built with Django and Django REST Framework. It follows a service-oriented architecture where business logic is encapsulated within a `domain.services` layer for each application. This keeps the views (controllers) clean and focused on handling HTTP requests and responses.

## Table of Contents
- Setup and Installation
- Running the Application
- Running Tests
- API Services Documentation
  - Courses App
  - Content App
  - Evaluation App

## Setup and Installation

1.  **Clone the repository.**
2.  **Navigate to the `backend` directory:**
    ```sh
    cd backend
    ```
3.  **Create and activate a Python virtual environment:**
    ```sh
    # Create the virtual environment
    python -m venv venv

    # Activate on Windows
    .\venv\Scripts\activate

    # Activate on macOS/Linux
    source venv/bin/activate
    ```
4.  **Install dependencies:**
    (Assuming a `requirements.txt` file exists)
    ```sh
    pip install -r requirements.txt
    ```
5.  **Apply database migrations:**
    ```sh
    python manage.py migrate
    ```

## Running the Application

To start the development server, run the following command from the `backend` directory:

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

## Running Tests

The project uses `pytest` for testing. To run the complete test suite, execute the following command from the `backend` directory:

```bash
pytest -v
```

---

## API Services Documentation

This section outlines the service layer functions for the `courses`, `content`, and `evaluation` applications. The service layer is designed to contain the core business logic, making the views (controllers) leaner and more focused on handling HTTP requests and responses.

### 1. Courses App (`apps.courses.domain.services`)

This module handles the business logic for subjects, student groups, and their relationships with topics.

#### Subject Management

*   `create_subject(name_es, name_en, description_es=None, description_en=None)`
    *   **Description**: Creates a new `Subject`. It ensures that at least one language-specific name is provided and that the name is unique.
    *   **Returns**: A new `Subject` instance.
    *   **View Usage**: Used in `SubjectViewSet.create()` to handle `POST /subjects/`.

#### Student Group Management

*   `create_student_group(subject, name_es, name_en, teacher, groupCode)`
    *   **Description**: Creates a new `StudentGroup` within a given `Subject`. It validates that the group name is unique for the subject and initializes evaluation counters for all relevant questions.
    *   **Returns**: A new `StudentGroup` instance.
    *   **View Usage**: Used in `SubjectViewSet.groups()` (POST) to handle `POST /subjects/{id}/groups/`.

*   `delete_student_group(group)`
    *   **Description**: Deletes a given `StudentGroup`.
    *   **View Usage**: Used in `SubjectViewSet.group_detail()` (DELETE) to handle `DELETE /subjects/{id}/groups/{group_id}/`.

#### Subject-Topic Relationship Management

*   `link_topic_to_subject(subject, topic, order_id)`
    *   **Description**: Links a `Topic` to a `Subject` with a specific order.
    *   **Returns**: A `SubjectIsAboutTopic` relation instance.
    *   **View Usage**: Used in `SubjectViewSet.link_topic()` to handle `POST /subjects/{id}/topics/`.

*   `unlink_topic_from_subject(topic, subject)`
    *   **Description**: Removes the link between a `Topic` and a `Subject`.
    *   **View Usage**: Used in `SubjectViewSet.unlink_topic()` to handle `DELETE /subjects/{id}/topics/`.

*   `swap_order(relationA, relationB)`
    *   **Description**: Swaps the `order_id` between two `SubjectIsAboutTopic` relations.
    *   **View Usage**: Used in `SubjectViewSet.change_topic_order()` to handle `PUT /subjects/{id}/topics/`.

### 2. Content App (`apps.content.domain.services`)

This module manages the core content models: `Topic`, `Concept`, and `Epigraph`, along with their relationships.

#### Topic Management

*   `create_topic(title_es, title_en, description_es=None, description_en=None)`
    *   **Description**: Creates a new `Topic`.
    *   **Returns**: A new `Topic` instance.
    *   **View Usage**: Used in `TopicViewSet.create()` to handle `POST /topics/`.

#### Concept Management

*   `create_concept(name_es, name_en, description_es=None, description_en=None)`
    *   **Description**: Creates a new `Concept`, ensuring its name is unique.
    *   **Returns**: A new `Concept` instance.
    *   **View Usage**: Used in `ConceptViewSet.create()` to handle `POST /concepts/`.

#### Epigraph Management

*   `create_epigraph(topic, name_es, name_en, order_id, ...)`
    *   **Description**: Creates an `Epigraph` for a given `Topic`, ensuring the `order_id` is unique within that topic.
    *   **Returns**: A new `Epigraph` instance.
    *   **View Usage**: Used in `TopicViewSet.create_epigraph()` to handle `POST /topics/{id}/epigraphs/`.

*   `update_epigraph(epigraph, name_es=None, name_en=None, ...)`
    *   **Description**: Updates an existing `Epigraph`.
    *   **Returns**: The updated `Epigraph` instance.
    *   **View Usage**: Used in `TopicViewSet.update_epigraph()` to handle `PUT /topics/{id}/epigraphs/{order_id}/`.

#### Relationship Management

*   `link_concept_to_topic(topic, concept, order_id)`
    *   **Description**: Links a `Concept` to a `Topic` with a specific order.
    *   **View Usage**: Used in `TopicViewSet.link_concept()` to handle `POST /topics/{id}/concepts/`.

*   `unlink_concept_from_topic(topic, concept)`
    *   **Description**: Removes the link between a `Topic` and a `Concept`.
    *   **View Usage**: Used in `TopicViewSet.unlink_concept()` to handle `DELETE /topics/{id}/concepts/`.

*   `link_concepts(concept_from, concept_to, bidirectional=False)`
    *   **Description**: Creates a relationship between two concepts (one-way or bidirectional).
    *   **View Usage**: Used in `ConceptViewSet.link_concept()` to handle `POST /concepts/{id}/concepts/`.

*   `unlink_concepts(concept_from, concept_to, bidirectional=False)`
    *   **Description**: Removes the relationship between two concepts.
    *   **View Usage**: Used in `ConceptViewSet.unlink_concept()` to handle `DELETE /concepts/{id}/concepts/`.

### 3. Evaluation App (`apps.evaluation.domain.services`)

This module contains the logic for creating, updating, and deleting questions and answers, and handles the audit trail for these actions.

#### Question Management

*   `create_question(user, type, statement_es, statement_en, ...)`
    *   **Description**: Creates a new `Question` and can associate it with topics and concepts. Triggers an audit log entry.
    *   **Parameters**:
        *   `user` (CustomTeacher): The user performing the action.
        *   `type` (str): `'multiple'` or `'truefalse'`.
        *   `statement_es` (str), `statement_en` (str): Question statements.
        *   `topics` (set[Topic], optional): Topics to associate.
        *   `concepts` (set[Concept], optional): Concepts to associate.
    *   **Returns**: A new `Question` instance.
    *   **View Usage**: Used in `QuestionViewSet.create()`.

*   `update_question(user, question, type=None, is_true=None, ...)`
    *   **Description**: Updates an existing `Question`. Handles type changes (e.g., to `'true_false'`) by managing answers automatically. Triggers an audit log entry.
    *   **Parameters**:
        *   `user` (CustomTeacher): The user performing the action.
        *   `question` (Question): The question to update.
        *   `is_true` (bool): Required if changing `type` to `'true_false'`.
    *   **Returns**: The updated `Question` instance.
    *   **View Usage**: Used in `QuestionViewSet.update()`.

*   `delete_question(user, question)`
    *   **Description**: Deletes a `Question` and its associated answers. Triggers an audit log entry.
    *   **View Usage**: Used in `QuestionViewSet.destroy()`.

#### Answer Management

*   `create_answer(user, question, text_es, text_en, is_correct=False)`
    *   **Description**: Creates a new `Answer` for a given `Question`.
    *   **Returns**: A new `Answer` instance.
    *   **View Usage**: Used in `AnswerViewSet.create()`.

*   `update_answer(user, answer, text_es=None, text_en=None, is_correct=None)`
    *   **Description**: Updates an existing `Answer`. Triggers an audit log entry.
    *   **Returns**: The updated `Answer` instance.
    *   **View Usage**: Used in `AnswerViewSet.update()`.

*   `delete_answer(user, answer)`
    *   **Description**: Deletes an `Answer`.
    *   **View Usage**: Used in `AnswerViewSet.destroy()`.