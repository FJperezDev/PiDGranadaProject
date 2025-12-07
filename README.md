# Documentación Técnica - Proyecto PiD Backend

## 1. Visión General
El proyecto es un backend desarrollado en **Django** y **Django REST Framework (DRF)** para una plataforma educativa. Su objetivo principal es la gestión de contenido educativo (temas, conceptos), cursos, grupos de estudiantes y sistemas de evaluación (exámenes y preguntas).

El sistema soporta internacionalización (bilingüe Español/Inglés) en sus modelos de datos y utiliza una arquitectura orientada a servicios.

## 2. Arquitectura del Sistema
El proyecto sigue una separación estricta de responsabilidades, dividiendo la lógica en tres capas principales dentro de cada aplicación (`apps`):

1.  **Capa API (`api/views.py`, `api/serializers.py`):**
    * Maneja las peticiones HTTP, permisos y serialización de datos.
    * No contiene lógica de negocio compleja.
    * Delega las operaciones a la capa de dominio.
2.  **Capa de Servicios (`domain/services.py`):**
    * Contiene la lógica de negocio (Creación, Actualización, Eliminación).
    * Ejecuta validaciones y transacciones.
    * Gestiona la auditoría de cambios (`makeChanges`).
3.  **Capa de Selectores (`domain/selectors.py`):**
    * Encargada exclusivamente de las consultas a la base de datos (Lectura).
    * Provee datos a las vistas y servicios.

## 3. Módulos (Apps)

### A. CustomAuth (`apps/customauth`)
Gestiona la autenticación y usuarios.
* **Modelo:** `CustomTeacher` (extiende `AbstractUser`).
* **Roles:**
    * `IsTeacher`: Usuario estándar autenticado.
    * `IsSuperTeacher`: Usuario con permisos administrativos de eliminación y auditoría.
* **Autenticación:** Utiliza JWT (`rest_framework_simplejwt`).

### B. Content (`apps/content`)
Gestiona el material didáctico base.
* **Modelos Principales:**
    * `Topic`: Temas de estudio.
    * `Concept`: Conceptos atómicos.
    * `Epigraph`: Secciones dentro de un tema.
* **Relaciones:**
    * `ConceptIsRelatedToConcept`: Grafo de relaciones entre conceptos (puede ser bidireccional).
    * `TopicIsAboutConcept`: Vinculación ordenada de conceptos a temas.

### C. Courses (`apps/courses`)
Organiza el contenido en estructuras académicas.
* **Modelos Principales:**
    * `Subject`: Asignaturas (e.g., Matemáticas).
    * `StudentGroup`: Grupos de estudiantes asociados a una asignatura (generan un `groupCode` único).
* **Lógica:** Vincula `Topics` a `Subjects`.

### D. Evaluation (`apps/evaluation`)
Motor de evaluación y bancos de preguntas.
* **Modelos Principales:**
    * `Question`: Soporta tipos 'multiple' y 'true_false'. Vinculada a Topics y Concepts.
    * `Answer`: Posibles respuestas para una pregunta.
    * `QuestionEvaluationGroup`: Métricas de rendimiento de una pregunta por grupo.
* **Funcionalidades Clave:**
    * Generación de exámenes aleatorios basados en temas (`create_exam`).
    * Corrección automática (`correct_exam`).
    * Analíticas de rendimiento y fallos (`AnalyticsViewSet`).

### E. Audit (`apps/audit` & `apps/utils/audit.py`)
Sistema de trazabilidad de cambios.
* **Funcionamiento:** Casi todas las entidades tienen modelos espejos (`TeacherMakeChange...`) que registran quién hizo el cambio, el objeto antiguo y el nuevo.
* **Versioning:** Los modelos principales usan un campo `old=True` para "eliminación lógica" o versionado histórico en lugar de borrar registros inmediatamente, permitiendo reconstruir la historia.

## 4. Base de Datos y Modelos
* **Motor:** PostgreSQL (en producción/Docker) o SQLite (desarrollo local).
* **Multilenguaje:** Los campos de texto suelen tener sufijos `_es` y `_en`.
* **Población de Datos:**
    * `populate_db.py`: Script para cargar datos de prueba mediante peticiones HTTP.
    * `populate_xls.py`: Script para importar datos masivos desde archivos Excel (`.xlsx`).

## 5. Infraestructura y Despliegue
* **Docker:**
    * `Dockerfile`: Imagen basada en Python 3.12-slim. Instala dependencias del sistema (`netcat`, `libpq-dev`) y de Python.
    * `docker-compose.yml`: Orquesta el servicio `backend` y la base de datos `db` (Postgres 16). Configurado para funcionar tras un proxy inverso (Traefik).
* **Servidor:** Utiliza **Gunicorn** como servidor de aplicaciones WSGI tras un entrypoint que gestiona migraciones y espera a la DB (`entrypoint.sh`).
* **Archivos Estáticos:** Gestionados con `Whitenoise`.

## 6. API Endpoints Resumidos

### Públicos / Estudiantes
* `/studentgroups/exists/`: Verificar código de grupo.
* `/studentgroups/exam/`: Generar examen.
* `/exams/evaluate-exam/`: Enviar y corregir examen.

### Profesores (`IsTeacher`)
* Operaciones CRUD (Create, Update) sobre `topics`, `concepts`, `subjects`, `questions`.
* Gestión de sus propios grupos de estudiantes.

### Super Profesores (`IsSuperTeacher`)
* Operaciones DELETE (borrado físico o lógico crítico).
* Acceso a endpoints de auditoría (`/audits/changes`, `/audits/questions`, etc.).

## 7. Testing
* Framework: `pytest`.
* Configuración: `pytest.ini` apunta a `config.settings`.
* Cobertura: Tests unitarios para modelos (`test_evaluation_models.py`, `test_content_models.py`) y tests de integración para servicios (`test_evaluation_services.py`).
