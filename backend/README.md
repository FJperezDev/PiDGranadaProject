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
  - App `audit`

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

*   **`AllowAny`**: Read-only operations (`GET`) are generally public and do not require authentication.
*   **`IsTeacher`**: Creation and update operations (`POST`, `PUT`, `PATCH`) require an authenticated teacher account.
*   **`IsSuperTeacher`**: Deletion operations (`DELETE`) require an authenticated teacher account with `is_super` privileges.

### 1. Content App

#### Endpoints de Temas (`/topics/`)

*   `GET /topics/`: List all topics. (AllowAny)
*   `POST /topics/`: Create a new topic. (IsTeacher)
    ```json
    {
        "title_es": "Nuevo Tema",
        "title_en": "New Topic",
        "description_es": "Descripción del nuevo tema.",
        "description_en": "Description of the new topic."
    }
    ```
*   `GET /topics/{id}/`: Retrieve a specific topic with its epigraphs and concepts. (AllowAny)
*   `PUT/PATCH /topics/{id}/`: Update a topic. (IsTeacher)
    ```json
    { "title_es": "Título del Tema Actualizado" }
    ```
*   `DELETE /topics/{id}/`: Delete a topic. (IsSuperTeacher)

##### Epígrafes de un Tema

*   `GET /topics/{id}/epigraphs/`: List all epigraphs for a specific topic. (AllowAny)
*   `POST /topics/{id}/epigraphs/`: Create a new epigraph for a topic. (IsTeacher)
    ```json
    {
        "name_es": "Nuevo Epígrafe",
        "name_en": "New Epigraph",
        "order_id": 1,
        "description_es": "Contenido del epígrafe."
    }
    ```
*   `DELETE /topics/{id}/epigraphs/`: Delete all epigraphs for a topic. (IsSuperTeacher)
*   `GET /topics/{id}/epigraphs/{order_id}/`: Retrieve a specific epigraph. (AllowAny)
*   `PUT /topics/{id}/epigraphs/{order_id}/`: Update a specific epigraph. (IsTeacher)
    ```json
    { "name_es": "Nombre del Epígrafe Actualizado" }
    ```
*   `DELETE /topics/{id}/epigraphs/{order_id}/`: Delete a specific epigraph. (IsSuperTeacher)

##### Conceptos de un Tema

*   `GET /topics/{id}/concepts/`: List all concepts linked to a specific topic. (AllowAny)
*   `POST /topics/{id}/concepts/`: Link an existing concept to a topic. (IsTeacher)
    ```json
    {
        "concept_name": "Nombre del Concepto Existente",
        "order_id": 1
    }
    ```
*   `DELETE /topics/{id}/concepts/`: Unlink a concept from a topic. Requiere `concept_name` en el body. (IsSuperTeacher)
    ```json
    { "concept_name": "Nombre del Concepto a Desvincular" }
    ```

#### Endpoints de Conceptos (`/concepts/`)

*   `GET /concepts/`: List all concepts. (AllowAny)
*   `POST /concepts/`: Create a new concept. (IsTeacher)
    ```json
    {
        "name_es": "Nuevo Concepto",
        "name_en": "New Concept",
        "description_es": "Descripción del concepto."
    }
    ```
*   `GET /concepts/{id}/`: Retrieve a specific concept and its related concepts. (AllowAny)
*   `PUT/PATCH /concepts/{id}/`: Update a concept. (IsTeacher)
    ```json
    { "name_es": "Nombre del Concepto Actualizado" }
    ```
*   `DELETE /concepts/{id}/`: Delete a concept. (IsSuperTeacher)

##### Relaciones entre Conceptos

*   `GET /concepts/{id}/concepts/`: List concepts related to a specific concept. (AllowAny)
*   `POST /concepts/{id}/concepts/`: Create a relationship between two concepts. (IsTeacher)
    ```json
    {
        "concept_to_name": "Nombre de Otro Concepto",
        "bidirectional": false
    }
    ```
*   `DELETE /concepts/{id}/concepts/`: Remove the relationship between two concepts. Requiere `concept_name` en el body. (IsSuperTeacher)
    ```json
    { "concept_name": "Nombre del Concepto a Desvincular" }
    ```

### 2. Courses App

#### Endpoints de Asignaturas (`/subjects/`)

*   `GET /subjects/`: List all subjects. (AllowAny)
*   `POST /subjects/`: Create a new subject. (IsTeacher)
    ```json
    {
        "name_es": "Nueva Asignatura",
        "name_en": "New Subject",
        "description_es": "Descripción de la asignatura."
    }
    ```
*   `GET /subjects/{id}/`: Retrieve a specific subject. (AllowAny)
*   `PUT/PATCH /subjects/{id}/`: Update a subject. (IsTeacher)
    ```json
    { "name_es": "Nombre de Asignatura Actualizado" }
    ```
*   `DELETE /subjects/{id}/`: Delete a subject. (IsSuperTeacher)

##### Temas de una Asignatura

*   `GET /subjects/{id}/topics/`: List topics linked to a subject. (AllowAny)
*   `POST /subjects/{id}/topics/`: Link a topic to a subject. (IsTeacher)
    ```json
    {
        "topic_name": "Nombre de Tema Existente",
        "order_id": 1
    }
    ```
*   `PUT /subjects/{id}/topics/`: Swap the order of two topics within a subject. (IsTeacher)
    ```json
    {
        "topicA": "Nombre Tema 1",
        "topicB": "Nombre Tema 2"
    }
    ```
*   `DELETE /subjects/{id}/topics/`: Unlink a topic from a subject. (IsSuperTeacher)
    ```json
    { "topic_name": "Nombre del Tema a Desvincular" }
    ```

##### Grupos de una Asignatura

*   `GET /subjects/{id}/groups/`: List all student groups for a subject. (IsTeacher)
*   `POST /subjects/{id}/groups/`: Create a new student group for a subject. (IsTeacher)
    ```json
    {
        "name_es": "Grupo de Prácticas 1",
        "name_en": "Practice Group 1"
    }
    ```
*   `DELETE /subjects/{id}/groups/`: Delete all student groups for a subject. (IsSuperTeacher)
*   `GET /subjects/{id}/groups/{group_pk}/`: Retrieve a specific student group. (IsTeacher)
*   `PUT /subjects/{id}/groups/{group_pk}/`: Update a student group. (IsTeacher)
    ```json
    { "name_es": "Nuevo Nombre de Grupo" }
    ```
*   `DELETE /subjects/{id}/groups/{group_pk}/`: Delete a student group. (IsSuperTeacher)

#### Endpoints de Grupos de Estudiantes (`/studentgroups/`)

*   `GET /studentgroups/`: List all student groups. (IsTeacher)
*   `GET /studentgroups/my-groups/`: List all groups managed by the currently authenticated teacher. (IsTeacher)

#### Endpoints para la Aplicación de Estudiante

Estos endpoints están diseñados para ser consumidos por la aplicación del estudiante y no requieren autenticación. Se basan en el código de grupo (`groupCode`).

*   `GET /studentgroups/exists/?code=XXX-XXX`: Verifica si un grupo de estudiantes existe.
*   `GET /studentgroups/subject/?code=XXX-XXX`: Obtiene la información básica de la asignatura y el código del grupo.
*   `GET /studentgroups/topics/?code=XXX-XXX`: Obtiene la lista de temas para la asignatura del grupo.
*   `GET /studentgroups/topic/?title=t1`: Obtiene los conceptos y epígrafes de un tema específico.
*   `GET /studentgroups/exam/?topics=t1,t2&nQuestions=10&code=XXX-XXX`: Genera un examen para el estudiante con un número de preguntas de los temas especificados.








### 3. Evaluation App

#### Endpoints de Preguntas (`/questions/`)

*   `GET /questions/`: List all questions. (AllowAny)
*   `POST /questions/`: Create a new question. (IsTeacher)
    ```json
    {
        "type": "multiple",
        "statement_es": "¿Enunciado de la pregunta?",
        "statement_en": "Question statement?",
        "topics_titles": ["Título del Tema 1"],
        "concepts_names": ["Nombre del Concepto 1"]
    }
    ```
*   `GET /questions/{id}/`: Retrieve a specific question with its answers. (AllowAny)
*   `PUT/PATCH /questions/{id}/`: Update a question. (IsTeacher)
    ```json
    { "statement_es": "Enunciado actualizado." }
    ```
*   `DELETE /questions/{id}/`: Delete a question. (IsSuperTeacher)
*   `GET /questions/{id}/answers/`: List all answers for a question. (AllowAny)
*   `POST /questions/{id}/answers/`: Create a new answer for a question. (IsTeacher)
    ```json
    {
        "text_es": "Texto de la respuesta",
        "text_en": "Answer text",
        "is_correct": true
    }
    ```
*   `PUT /questions/{id}/answers/{answer_id}/`: Update a specific answer. (IsTeacher)
    ```json
    { "is_correct": false }
    ```
*   `DELETE /questions/{id}/answers/{answer_id}/`: Delete a specific answer. (IsSuperTeacher)

#### Endpoints de Respuestas (`/answers/`)

*   `GET /answers/`: List all answers. (AllowAny)
*   `POST /answers/`: Create a new answer for a question. (IsTeacher)
*   `GET /answers/{id}/`: Retrieve a specific answer. (AllowAny)
*   `PUT/PATCH /answers/{id}/`: Update an answer. (IsTeacher)
    ```json
    { "text_en": "Updated answer text" }
    ```
*   `DELETE /answers/{id}/`: Delete an answer. (IsSuperTeacher)

#### Endpoints de Evaluaciones

*   Este endpoint no existe actualmente. Las métricas de evaluación se pueden consultar a través de otros endpoints o se deben implementar.

### 4. Audit App

#### Endpoints de Auditoría (`/audits/`)

Estos endpoints requieren permisos de `IsSuperTeacher`.

*   `GET /audits/changes/`: Obtiene una lista de todos los cambios realizados en el sistema.
*   `GET /audits/questions/`: Obtiene los cambios específicos de las preguntas.
*   `GET /audits/questions/{question_id}/answers/`: Obtiene los cambios de las respuestas para una pregunta específica.
*   `GET /audits/concepts/`: Obtiene los cambios de los conceptos.
*   `GET /audits/topics/`: Obtiene los cambios de los temas.
*   `GET /audits/topics/{topic_id}/epigraphs/`: Obtiene los cambios de los epígrafes para un tema específico.
*   `GET /audits/groups/`: Obtiene los cambios de los grupos de estudiantes.
*   `GET /audits/subjects/`: Obtiene los cambios de las asignaturas.


---
