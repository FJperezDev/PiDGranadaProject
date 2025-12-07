# Documentación del Proyecto PiD (fjperezdev-pidgranadaproject)

## 1. Visión General del Proyecto
El "Proyecto PiD" es una plataforma educativa compuesta por un **Backend** (Django) y dos aplicaciones móviles **Frontend** (React Native/Expo): una para estudiantes y otra para profesores. El sistema permite la gestión de asignaturas, contenidos académicos (temas, conceptos), grupos de estudiantes y evaluaciones (exámenes y juegos).

## 2. Arquitectura Tecnológica

### Backend
* **Framework:** Django 5.2.4 con Django REST Framework.
* **Base de Datos:** PostgreSQL 16.
* **Lenguaje:** Python 3.12.
* **Infraestructura:** Docker y Docker Compose.
* **Servidor:** Gunicorn detrás de un proxy (Traefik/Nginx sugerido en scripts).
* **Patrón de Diseño:** Arquitectura orientada a servicios. La lógica de negocio está separada de las vistas, residiendo en capas de `domain` (`services.py` para escritura, `selectors.py` para lectura).

### Frontend
* **Framework:** React Native con Expo (~54.0).
* **Plataformas:** Android, iOS, Web.
* **Estudiantes:** `frontendStudent` (Acceso mediante códigos de grupo/asignatura).
* **Profesores:** `frontendTeacher` (Acceso mediante autenticación JWT).
* **Librerías Clave:** React Navigation, Axios, Expo Secure Store, Lucide React Native.

---

## 3. Estructura del Backend

El backend está dividido en aplicaciones (`apps`) modulares:

### 3.1. Core Apps

#### `apps.content` (Gestión de Contenido)
Gestiona la estructura teórica del conocimiento.
* **Modelos Principales:**
    * `Topic` (Tema): Título y descripción (Multilenguaje ES/EN).
    * `Concept` (Concepto): Definiciones y ejemplos.
    * `Epigraph` (Epígrafe): Subsecciones dentro de un tema.
* **Relaciones:**
    * `TopicIsAboutConcept`: Vincula conceptos a temas con un orden específico.
    * `ConceptIsRelatedToConcept`: Relaciones dirigidas entre conceptos (mapa conceptual).

#### `apps.courses` (Gestión de Cursos)
Organiza el contenido en estructuras académicas.
* **Modelos Principales:**
    * `Subject` (Asignatura): Contenedor principal de temas.
    * `StudentGroup` (Grupo de Estudiantes): Instancia de una asignatura para un grupo de alumnos (tiene un `groupCode` único para acceso).
* **Relaciones:**
    * `SubjectIsAboutTopic`: Vincula temas a asignaturas.

#### `apps.evaluation` (Evaluación)
Gestiona las pruebas de conocimiento.
* **Modelos Principales:**
    * `Question`: Preguntas (Múltiple opción o Verdadero/Falso).
    * `Answer`: Respuestas asociadas a preguntas.
    * `QuestionEvaluationGroup`: Registro de intentos y aciertos por grupo.
* **Lógica:**
    * Las preguntas se etiquetan por `Topic` y `Concept`.
    * Generación de exámenes aleatorios basados en temas seleccionados.

#### `apps.customauth` (Autenticación)
* **Modelo:** `CustomTeacher` (extiende `AbstractUser`).
* **Roles:**
    * **Teacher:** Puede gestionar sus propios grupos.
    * **SuperTeacher (Admin):** Puede gestionar contenido global, asignaturas y otros usuarios.
* **Autenticación:** JWT (JSON Web Token).

#### `apps.audit` (Auditoría)
Registra los cambios realizados en el sistema.
* **Modelos:** `TeacherMakeChange...` (para Topic, Concept, Question, etc.).
* **Funcionalidad:** Guarda el estado anterior (`old_object`) y el nuevo (`new_object`), junto con el usuario y la fecha.

---

## 4. Funcionalidades del Frontend

### 4.1. Aplicación de Estudiante (`frontendStudent`)
No requiere registro de usuario, funciona mediante códigos de acceso.

* **Pantalla de Inicio:** Entrada mediante código de asignatura/grupo (`XXX-XXX`).
* **Visualización de Temas:** Lista de temas de la asignatura.
* **Detalle del Tema:**
    * Visualización de Epígrafes.
    * Visualización de Conceptos (con modales interactivos y navegación entre conceptos relacionados).
* **Juego (Hexágono):** Juego de preguntas interactivas.
* **Examen:**
    * Configuración: Selección de temas y número de preguntas.
    * Ejecución: Temporizador y selección de respuestas.
    * Resultados: Puntuación, corrección y recomendaciones generadas por IA (simulado/lógica básica).

### 4.2. Aplicación de Profesor (`frontendTeacher`)
Requiere autenticación. Panel de control administrativo.

* **Login:** Autenticación con email/contraseña.
* **Gestión de Grupos:** Crear, listar y eliminar grupos de estudiantes. Generación de códigos de acceso.
* **Gestión de Contenido:**
    * Crear/Editar Temas y Conceptos.
    * Establecer relaciones entre conceptos.
    * Gestionar Epígrafes.
* **Gestión de Preguntas (Wizard):**
    * Creación de preguntas paso a paso.
    * Filtrado por Asignatura y Tema.
    * Soporte multilenguaje (ES/EN) para enunciados y respuestas.
* **Analíticas:**
    * Gráficos de rendimiento (Barras).
    * Filtros por Tema, Concepto, Grupo o Pregunta.
    * Métricas de tasa de aciertos y volumen de fallos.
* **Gestión de Usuarios:** (Solo SuperTeacher) Invitar nuevos profesores.

---

## 5. API Endpoints Principales

### Públicos / Estudiantes
* `GET /studentgroups/exists/?code=...`: Valida código de grupo.
* `GET /studentgroups/subject/?code=...`: Obtiene info de asignatura.
* `GET /studentgroups/topics/?code=...`: Lista temas por código.
* `GET /studentgroups/topic/?title=...`: Detalle de tema (conceptos/epígrafes).
* `GET /exams/generate-exam/`: Genera preguntas aleatorias.
* `POST /exams/evaluate-exam/`: Corrige examen.

### Privados / Profesores (Requiere JWT)
* **Auth:** `/login/`, `/register/`, `/token/refresh/`.
* **Contenido:**
    * `/topics/`, `/concepts/` (CRUD completo).
    * `/topics/{id}/epigraphs/`.
    * `/concepts/{id}/concepts/` (Relaciones).
* **Cursos:**
    * `/subjects/` (CRUD).
    * `/subjects/{id}/groups/` (Gestión de grupos).
    * `/studentgroups/my-groups/`.
* **Evaluación:**
    * `/questions/` (CRUD, filtrado).
    * `/analytics/performance/` (Datos para gráficas).

---

## 6. Instalación y Despliegue

### Requisitos
* Docker y Docker Compose.
* Node.js (para desarrollo local de frontends).

### Despliegue del Backend
El proyecto incluye scripts de utilidad en la raíz:
1.  **Iniciar:** `./startProxy.sh` (Levanta contenedores de BD y Backend).
2.  **Detener:** `./stopProxy.sh`.
3.  **Reiniciar:** `./restartProxy.sh`.

El contenedor `backend` expone el puerto `8000`. Ejecuta migraciones automáticamente al iniciar (`entrypoint.sh`).

### Scripts de Poblado de Datos
* `populate_db.py`: Script Python para insertar datos de prueba mediante peticiones HTTP.
* `populate_xls.py`: Script para cargar datos masivos desde un archivo Excel (`Prueba.xlsx`).

### Ejecución de Frontends
Cada carpeta (`frontendStudent`, `frontendTeacher`) es un proyecto Expo independiente.
```bash
cd frontendStudent
npm install
npx expo start
