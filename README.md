# Backend Documentation - Proyecto PiD

Este documento proporciona una descripción general del backend para la aplicación "Proyecto PiD". El backend está construido con Django y Django REST Framework. Sigue una arquitectura orientada a servicios donde la lógica de negocio se encapsula dentro de una capa `domain.services` para cada aplicación. Esto mantiene las vistas (controladores) limpias y enfocadas en manejar las peticiones y respuestas HTTP.

## Table of Contents
- Setup and Installation
- Running the Application
- Running Tests
- API Endpoint Documentation
- API Services Documentation (Capa de Dominio)
  - App `courses`
  - App `content`
  - App `evaluation`

## Setup and Installation

1.  **Clona el repositorio.**
2.  **Navega al directorio `backend`:**
    ```sh
    cd backend
    ```
3.  **Crea y activa un entorno virtual de Python:**
    ```sh
    # Crear el entorno virtual
    python -m venv venv

    # Activar en Windows
    .\venv\Scripts\activate

    # Activar en macOS/Linux
    source venv/bin/activate
    ```
4.  **Instala las dependencias:**
    ```sh
    pip install -r requirements.txt
    ```
5.  **Aplica las migraciones de la base de datos:**
    ```sh
    python manage.py migrate
    ```

## Running the Application

Para iniciar el servidor de desarrollo, ejecuta el siguiente comando desde el directorio `backend`:

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

## API Endpoint Documentation

This section details the available API endpoints, their functionalities, and the required permissions.

### Authentication & Permissions

The permission system is role-based for teachers:

*   **`AllowAny`**: Read-only operations (`GET`) are generally public and do not require authentication.
*   **`IsTeacher`**: Creation and update operations (`POST`, `PUT`, `PATCH`) require an authenticated teacher account.
*   **`IsSuperTeacher`**: Deletion operations (`DELETE`) require an authenticated teacher account with `is_super` privileges.

### 1. Content App

#### Topic Endpoints (`/topics/`)

*   `GET /topics/`: List all topics. (AllowAny)
*   `POST /topics/`: Create a new topic. (IsTeacher)
*   `GET /topics/{id}/`: Retrieve a specific topic with its epigraphs and concepts. (AllowAny)
*   `PUT/PATCH /topics/{id}/`: Update a topic. (IsTeacher)
*   `DELETE /topics/{id}/`: Delete a topic. (IsSuperTeacher)
*   `GET /topics/{id}/epigraphs/`: List all epigraphs for a specific topic. (AllowAny)
*   `POST /topics/{id}/epigraphs/`: Create a new epigraph for a topic. (IsTeacher)
*   `PUT /topics/{id}/epigraphs/{order_id}/`: Update an epigraph within a topic. (IsTeacher)
*   `GET /topics/{id}/concepts/`: List all concepts linked to a specific topic. (AllowAny)
*   `POST /topics/{id}/concepts/`: Link an existing concept to a topic. (IsTeacher)
*   `DELETE /topics/{id}/concepts/`: Unlink a concept from a topic. (IsSuperTeacher)

#### Concept Endpoints (`/concepts/`)

*   `GET /concepts/`: List all concepts. (AllowAny)
*   `POST /concepts/`: Create a new concept. (IsTeacher)
*   `GET /concepts/{id}/`: Retrieve a specific concept and its related concepts. (AllowAny)
*   `PUT/PATCH /concepts/{id}/`: Update a concept. (IsTeacher)
*   `DELETE /concepts/{id}/`: Delete a concept. (IsSuperTeacher)
*   `GET /concepts/{id}/concepts/`: List concepts related to a specific concept. (AllowAny)
*   `POST /concepts/{id}/concepts/`: Create a relationship between two concepts. (IsTeacher)
*   `DELETE /concepts/{id}/concepts/`: Remove the relationship between two concepts. (IsSuperTeacher)

#### Epigraph Endpoints (`/epigraphs/`)

*   `GET /epigraphs/`: List all epigraphs across all topics. (AllowAny)
*   *(Note: Most epigraph operations are nested under `/topics/{id}/epigraphs/` for clarity).*

### 2. Courses App

#### Subject Endpoints (`/subjects/`)

*   `GET /subjects/`: List all subjects. (AllowAny)
*   `POST /subjects/`: Create a new subject. (IsTeacher)
*   `GET /subjects/{id}/`: Retrieve a specific subject. (AllowAny)
*   `PUT/PATCH /subjects/{id}/`: Update a subject. (IsTeacher)
*   `DELETE /subjects/{id}/`: Delete a subject. (IsSuperTeacher)
*   `GET /subjects/{id}/topics/`: List topics linked to a subject. (AllowAny)
*   `POST /subjects/{id}/topics/`: Link a topic to a subject. (IsTeacher)
*   `PUT /subjects/{id}/topics/`: Swap the order of two topics within a subject. (IsTeacher)
*   `DELETE /subjects/{id}/topics/`: Unlink a topic from a subject. (IsSuperTeacher)
*   `GET /subjects/{id}/groups/`: List all student groups for a subject. (IsTeacher)
*   `POST /subjects/{id}/groups/`: Create a new student group for a subject. (IsTeacher)
*   `GET /subjects/{id}/groups/{group_pk}/`: Retrieve a specific student group. (IsTeacher)
*   `PUT /subjects/{id}/groups/{group_pk}/`: Update a student group. (IsTeacher)
*   `DELETE /subjects/{id}/groups/{group_pk}/`: Delete a student group. (IsSuperTeacher)

#### Student Group Endpoints (`/studentgroups/`)

*   `GET /studentgroups/`: List all student groups. (IsTeacher)
*   `GET /studentgroups/my_groups/`: List all groups managed by the currently authenticated teacher. (IsTeacher)

### 3. Evaluation App

#### Question Endpoints (`/questions/`)

*   `GET /questions/`: List all questions. (AllowAny)
*   `POST /questions/`: Create a new question. (IsTeacher)
*   `GET /questions/{id}/`: Retrieve a specific question with its answers. (AllowAny)
*   `PUT/PATCH /questions/{id}/`: Update a question. (IsTeacher)
*   `DELETE /questions/{id}/`: Delete a question. (IsSuperTeacher)

#### Answer Endpoints (`/answers/`) - *Servicios de Evaluación*

*   `GET /answers/`: List all answers. (AllowAny)
*   `POST /answers/`: Create a new answer for a question. (IsTeacher)
*   `GET /answers/{id}/`: Retrieve a specific answer. (AllowAny)
*   `PUT/PATCH /answers/{id}/`: Update an answer. (IsTeacher)
*   `DELETE /answers/{id}/`: Delete an answer. (IsSuperTeacher)

#### Relaciones de Preguntas (`/question-topic/`, `/question-concept/`)

*   `GET /question-topic/`: Lista las relaciones entre preguntas y temas. (AllowAny)
*   `GET /question-concept/`: Lista las relaciones entre preguntas y conceptos. (AllowAny)

#### Evaluaciones (`/evaluations/`)

*   `GET /evaluations/`: Lista las métricas de evaluación de cada pregunta por grupo de estudiantes. (IsTeacher)

#### Endpoints de Exámenes (`/exams/`)

*   `GET /exams/generate-exam/`: Genera un nuevo examen. Requiere una lista de IDs de temas (`topics`) y un número de preguntas (`num_questions`) en el cuerpo de la petición. (IsTeacher)
*   `GET /exams/evaluate-exam/`: Evalúa un examen enviado. Requiere el ID del grupo de estudiantes (`student_group_id`) y un diccionario de preguntas y respuestas (`questions_and_answers`). (IsTeacher)


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

Este módulo contiene la lógica para crear, actualizar, y eliminar preguntas y respuestas, gestionar exámenes y evaluar las respuestas de los estudiantes. También maneja el registro de auditoría para los cambios.

#### Question Management

*   `create_question(user, type, statement_es, statement_en, ...)`
    *   **Description**: Creates a new `Question`. It validates that statements are provided for both languages and can associate the question with a set of topics and concepts. It also triggers an audit log entry.
    *   **Parameters**:
        *   `user` (CustomTeacher): The user performing the action.
        *   `type` (str): `'multiple'` or `'truefalse'`.
        *   `statement_es` (str), `statement_en` (str): Question statements.
        *   `approved` (bool, optional): The approval status.
        *   `generated` (bool, optional): Whether the question was auto-generated.
        *   `topics` (set[Topic], optional): A set of `Topic` objects to associate with the question.
        *   `concepts` (set[Concept], optional): A set of `Concept` objects to associate with the question.
    *   **Returns**: A new `Question` instance.
    *   **View Usage**: Used in `QuestionViewSet.create()`.

*   `update_question(user, question, type=None, is_true=None, ...)`
    *   **Description**: Updates an existing `Question`. It can change the type, statements, approval status, and topic/concept associations. If the type is changed to `'true_false'`, it automatically deletes old answers and creates new "True" and "False" answers based on the `is_true` parameter. Triggers an audit log entry.
    *   **Parameters**:
        *   `user` (CustomTeacher): The user performing the action.
        *   `question` (Question): The question to update.
        *   `is_true` (bool): Required if changing `type` to `'true_false'`.
    *   **Returns**: The updated `Question` instance.
    *   **View Usage**: Used in `QuestionViewSet.update()`.
    *   **Parameters**:
        *   `user` (CustomTeacher): The user performing the action.
        *   `question` (Question): The question instance to update.
        *   Accepts optional `type`, `statement_es`, `statement_en`, `approved`, `generated`.
        *   `topics` (list of str, optional): A list of topic titles (strings) to associate. Existing associations will be replaced.
        *   `concepts` (list of str, optional): A list of concept names (strings) to associate. Existing associations will be replaced.
        *   `is_true` (bool): Required only when changing `type` to `'true_false'`. Specifies which of the new answers ("True" or "False") is correct.

*   `delete_question(user, question)`
    *   **Description**: Deletes a `Question` and its associated answers. Triggers an audit log entry.
    *   **Parameters**:
        *   `user` (CustomTeacher): The user performing the action.
        *   `question` (Question): The question to delete.
    *   **View Usage**: Used in `QuestionViewSet.destroy()`.

#### Answer Management

*   `create_answer(user, question, text_es, text_en, is_correct=False)`
    *   **Description**: Creates a new `Answer` for a given `Question`.
    *   **Parámetros**:
        *   `user` (CustomTeacher): The user performing the action.
        *   `question` (Question): The parent question.
        *   `text_es` (str): The answer text in Spanish.
        *   `text_en` (str): The answer text in English.
        *   `is_correct` (bool): Whether this answer is the correct one.
    *   **Returns**: A new `Answer` instance.
    *   **View Usage**: Used in `AnswerViewSet.create()` and internally by `update_question`.

*   `update_answer(user, answer, text_es=None, text_en=None, is_correct=None)`
    *   **Description**: Updates an existing `Answer`. Triggers an audit log entry.
    *   **Parámetros**:
        *   `user` (CustomTeacher): The user performing the action.
        *   `answer` (Answer): The answer instance to update.
        *   Accepts optional `text_es`, `text_en`, `is_correct`.
    *   **Returns**: The updated `Answer` instance.
    *   **View Usage**: Used in `AnswerViewSet.update()`.

*   `delete_answer(user, answer)`
    *   **Description**: Deletes an `Answer`.
    *   **Parámetros**:
        *   `user` (CustomTeacher): The user performing the action.
        *   `answer` (Answer): The answer to delete.
    *   **View Usage**: Used in `AnswerViewSet.destroy()`.

#### Exam and Evaluation Management

*   `evaluate_question(student_group, question, answer)`
    *   **Descripción**: Evalúa una respuesta proporcionada por un grupo de estudiantes para una pregunta específica. Actualiza los contadores de evaluación (`ev_count`) y aciertos (`correct_count`) para esa pregunta y grupo.
    *   **Parámetros**:
        *   `student_group` (StudentGroup): El grupo de estudiantes que responde.
        *   `question` (Question): La pregunta que se está evaluando.
        *   `answer` (Answer): La respuesta seleccionada.
    *   **Retorna**: `True` si la respuesta es correcta, `False` en caso contrario.

*   `create_exam(user, topics, num_questions)`
    *   **Descripción**: Genera un examen seleccionando un número específico de preguntas de forma aleatoria a partir de un conjunto de temas. La selección es eficiente y se realiza en una única consulta a la base de datos.
    *   **Parámetros**:
        *   `user` (CustomTeacher): El usuario que genera el examen.
        *   `topics` (set[Topic]): Un conjunto de objetos `Topic` de los cuales se seleccionarán las preguntas.
        *   `num_questions` (int): El número de preguntas que debe tener el examen.
    *   **Retorna**: Una lista de objetos `Question`.

*   `correct_exam(student_group, questions_and_answers)`
    *   **Descripción**: Corrige un examen completo para un grupo de estudiantes. Itera sobre las preguntas y respuestas, utiliza `evaluate_question` para registrar las métricas de cada una, y calcula la calificación final.
    *   **Parámetros**:
        *   `student_group` (StudentGroup): El grupo de estudiantes que realizó el examen.
        *   `questions_and_answers` (dict[Question, Answer]): Un diccionario que mapea cada pregunta del examen a la respuesta seleccionada por el estudiante.
    *   **Retorna**: Un `int` que representa la calificación total (número de respuestas correctas).

