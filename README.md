# Proyecto PiD (iOrg) - Plataforma Educativa Integral

Plataforma de gestión educativa diseñada para asignaturas universitarias complejas. El sistema permite a los profesores gestionar contenidos semánticos (grafos de conceptos) y analizar el rendimiento de los alumnos, mientras que los estudiantes acceden a herramientas de autoevaluación y gamificación.

El proyecto implementa una arquitectura desacoplada con un backend en **Django REST Framework** y dos clientes **React Native (Expo)**.

## 🛠 Tech Stack

### Backend (API REST)
* **[span_0](start_span)[span_1](start_span)Lenguaje/Framework:** Python 3.12, Django 5, Django REST Framework[span_0](end_span)[span_1](end_span).
* **[span_2](start_span)Base de Datos:** PostgreSQL[span_2](end_span).
* **[span_3](start_span)[span_4](start_span)Arquitectura:** Diseño orientado a dominios (Domain-Driven) separando la lógica en capas de **Servicios** (lógica de negocio) y **Selectores** (consultas eficientes)[span_3](end_span)[span_4](end_span).
* **[span_5](start_span)Infraestructura:** Docker & Docker Compose, Gunicorn, Traefik (Proxy Inverso)[span_5](end_span).
* **[span_6](start_span)Testing:** Pytest para pruebas unitarias y de integración[span_6](end_span).
* **Key Features:**
    * [span_7](start_span)Sistema de **Auditoría** de cambios (registro de quién modificó qué y cuándo)[span_7](end_span).
    * [span_8](start_span)[span_9](start_span)Soporte **Multi-idioma (i18n)** a nivel de base de datos (`_es`, `_en`)[span_8](end_span)[span_9](end_span).
    * [span_10](start_span)Carga masiva de datos desde Excel utilizando `pandas`[span_10](end_span).

### Frontend (Ecosistema Móvil & Web)
* **[span_11](start_span)Framework:** React Native / Expo (SDK 54)[span_11](end_span).
* **Apps:**
    1.  **[span_12](start_span)Teacher App:** Panel de administración web/tablet para gestión de contenidos y visualización de analíticas (`react-native-chart-kit`)[span_12](end_span).
    2.  **[span_13](start_span)Student App:** Aplicación móvil para realizar exámenes y juegos educativos ("El Hexágono")[span_13](end_span).
* **[span_14](start_span)Estado & Networking:** Context API, Axios con interceptores para JWT[span_14](end_span).

---

## 🏛 Arquitectura del Backend

A diferencia de un MVC estándar, este proyecto implementa una separación estricta de responsabilidades para garantizar mantenibilidad:

1.  **API Layer (`views.py`):** Maneja solo la petición HTTP y la serialización.
2.  **[span_15](start_span)Domain Layer (`services.py`):** Contiene la lógica pura (ej: algoritmos de generación de exámenes, validación de grafos de conceptos)[span_15](end_span).
3.  **[span_16](start_span)Data Access Layer (`selectors.py`):** Encapsula consultas complejas (ORM), optimizando el rendimiento con `prefetch_related`[span_16](end_span).

---

## ✨ Funcionalidades Principales

### 👨‍🏫 Panel del Profesor
* **[span_17](start_span)Gestión Semántica:** CRUD de Asignaturas, Temas y Conceptos con relaciones bidireccionales[span_17](end_span).
* **Generador de Preguntas:** Creación de bancos de preguntas vinculados a conceptos específicos.
* **[span_18](start_span)Analíticas:** Visualización del rendimiento de grupos por tema o concepto específico[span_18](end_span).
* **[span_19](start_span)Gestión de Accesos:** Invitación de usuarios y roles (`IsTeacher`, `IsSuperTeacher`)[span_19](end_span).

### 🎓 App del Estudiante
* **[span_20](start_span)Acceso por Código:** Sistema de login simplificado mediante códigos de grupo (`XXX-XXX`) sin necesidad de registro[span_20](end_span).
* **[span_21](start_span)Exámenes Autogenerados:** Algoritmo que crea exámenes aleatorios basados en los temas seleccionados por el alumno[span_21](end_span).
* **[span_22](start_span)Feedback Inmediato:** Recomendaciones automáticas post-examen basadas en los fallos cometidos[span_22](end_span).
* **[span_23](start_span)Gamificación:** Juego interactivo para repasar conceptos[span_23](end_span).

---

## 🚀 Instalación y Despliegue

### Backend
El proyecto está contenerizado. Para iniciar el servidor y la base de datos:

```bash
# Iniciar servicios
docker compose -f backend/docker-compose.yml up -d --build

# (Opcional) Poblar base de datos con datos de prueba
docker exec -it django_backend python populate_db.py
