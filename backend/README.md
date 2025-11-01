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

*   **`AllowAny`**: Read-only operations (`GET`) are generally public and do not require authentication.
*   **`IsTeacher`**: Creation and update operations (`POST`, `PUT`, `PATCH`) require an authenticated teacher account.
*   **`IsSuperTeacher`**: Deletion operations (`DELETE`) require an authenticated teacher account with `is_super` privileges.

### 1. Content App

#### Endpoints de Temas (`/topics/`)

*   `GET /topics/`: List all topics. (AllowAny)
*   `POST /topics/`: Create a new topic. (IsTeacher)
*   `GET /topics/{id}/`: Retrieve a specific topic with its epigraphs and concepts. (AllowAny)
*   `PUT/PATCH /topics/{id}/`: Update a topic. (IsTeacher)
*   `DELETE /topics/{id}/`: Delete a topic. (IsSuperTeacher)

##### Epígrafes de un Tema

*   `GET /topics/{id}/epigraphs/`: List all epigraphs for a specific topic. (AllowAny)
*   `POST /topics/{id}/epigraphs/`: Create a new epigraph for a topic. (IsTeacher)
*   `DELETE /topics/{id}/epigraphs/`: Delete all epigraphs for a topic. (IsSuperTeacher)
*   `GET /topics/{id}/epigraphs/{order_id}/`: Retrieve a specific epigraph. (AllowAny)
*   `PUT /topics/{id}/epigraphs/{order_id}/`: Update a specific epigraph. (IsTeacher)
*   `DELETE /topics/{id}/epigraphs/{order_id}/`: Delete a specific epigraph. (IsSuperTeacher)

##### Conceptos de un Tema

*   `GET /topics/{id}/concepts/`: List all concepts linked to a specific topic. (AllowAny)
*   `POST /topics/{id}/concepts/`: Link an existing concept to a topic. (IsTeacher)
*   `DELETE /topics/{id}/concepts/`: Unlink a concept from a topic. (IsSuperTeacher)

#### Endpoints de Conceptos (`/concepts/`)

*   `GET /concepts/`: List all concepts. (AllowAny)
*   `POST /concepts/`: Create a new concept. (IsTeacher)
*   `GET /concepts/{id}/`: Retrieve a specific concept and its related concepts. (AllowAny)
*   `PUT/PATCH /concepts/{id}/`: Update a concept. (IsTeacher)
*   `DELETE /concepts/{id}/`: Delete a concept. (IsSuperTeacher)

##### Relaciones entre Conceptos

*   `GET /concepts/{id}/concepts/`: List concepts related to a specific concept. (AllowAny)
*   `POST /concepts/{id}/concepts/`: Create a relationship between two concepts. (IsTeacher)
*   `DELETE /concepts/{id}/concepts/`: Remove the relationship between two concepts. (IsSuperTeacher)

### 2. Courses App

#### Endpoints de Asignaturas (`/subjects/`)

*   `GET /subjects/`: List all subjects. (AllowAny)
*   `POST /subjects/`: Create a new subject. (IsTeacher)
*   `GET /subjects/{id}/`: Retrieve a specific subject. (AllowAny)
*   `PUT/PATCH /subjects/{id}/`: Update a subject. (IsTeacher)
*   `DELETE /subjects/{id}/`: Delete a subject. (IsSuperTeacher)

##### Temas de una Asignatura

*   `GET /subjects/{id}/topics/`: List topics linked to a subject. (AllowAny)
*   `POST /subjects/{id}/topics/`: Link a topic to a subject. (IsTeacher)
*   `PUT /subjects/{id}/topics/`: Swap the order of two topics within a subject. (IsTeacher)
*   `DELETE /subjects/{id}/topics/`: Unlink a topic from a subject. (IsSuperTeacher)

##### Grupos de una Asignatura

*   `GET /subjects/{id}/groups/`: List all student groups for a subject. (IsTeacher)
*   `POST /subjects/{id}/groups/`: Create a new student group for a subject. (IsTeacher)
*   `GET /subjects/{id}/groups/{group_pk}/`: Retrieve a specific student group. (IsTeacher)
*   `PUT /subjects/{id}/groups/{group_pk}/`: Update a student group. (IsTeacher)
*   `DELETE /subjects/{id}/groups/{group_pk}/`: Delete a student group. (IsSuperTeacher)

#### Endpoints de Grupos de Estudiantes (`/studentgroups/`)

*   `GET /studentgroups/`: List all student groups. (IsTeacher)
*   `GET /studentgroups/my_groups/`: List all groups managed by the currently authenticated teacher. (IsTeacher)

### 3. Evaluation App

#### Endpoints de Preguntas (`/questions/`)

*   `GET /questions/`: List all questions. (AllowAny)
*   `POST /questions/`: Create a new question. (IsTeacher)
*   `GET /questions/{id}/`: Retrieve a specific question with its answers. (AllowAny)
*   `PUT/PATCH /questions/{id}/`: Update a question. (IsTeacher)
*   `DELETE /questions/{id}/`: Delete a question. (IsSuperTeacher)
*   `GET /questions/{id}/answers/`: List all answers for a question. (AllowAny)

#### Endpoints de Respuestas (`/answers/`)

*   `GET /answers/`: List all answers. (AllowAny)
*   `POST /answers/`: Create a new answer for a question. (IsTeacher)
*   `GET /answers/{id}/`: Retrieve a specific answer. (AllowAny)
*   `PUT/PATCH /answers/{id}/`: Update an answer. (IsTeacher)
*   `DELETE /answers/{id}/`: Delete an answer. (IsSuperTeacher)

#### Endpoints de Relaciones de Preguntas

*   `GET /question-topic/`: Lista las relaciones entre preguntas y temas. (AllowAny)
*   `GET /question-concept/`: Lista las relaciones entre preguntas y conceptos. (AllowAny)

#### Endpoints de Evaluaciones

*   `GET /evaluations/`: Lista las métricas de evaluación de cada pregunta por grupo de estudiantes. (IsTeacher)

#### Endpoints de Exámenes

*   `GET /exams/generate-exam/`: Genera un nuevo examen. Requiere una lista de IDs de temas (`topics`) y un número de preguntas (`num_questions`) en el cuerpo de la petición. (IsTeacher)
*   `GET /exams/evaluate-exam/`: Evalúa un examen enviado. Requiere el ID del grupo de estudiantes (`student_group_id`) y un diccionario de preguntas y respuestas (`questions_and_answers`). (IsTeacher)


---
