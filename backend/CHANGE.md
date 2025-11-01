# Propuestas de Mejoras y Nuevos Endpoints

Este documento describe una serie de endpoints y funcionalidades que podrían añadirse a la aplicación para hacerla más completa y robusta como plataforma educativa.

## 1. Mejoras en la Gestión de Contenidos

### Endpoints para Material de Estudio

Actualmente, los temas y epígrafes son solo texto. Sería muy útil poder asociarles material de estudio como archivos (PDF, slides) o enlaces externos (vídeos, artículos).

*   **`POST /topics/{id}/materials/`**: Sube un archivo o añade un enlace como material de estudio para un tema. (IsTeacher)
    *   **Body**: `{ "type": "file" | "link", "title": "...", "file": <archivo>, "url": "..." }`
*   **`GET /topics/{id}/materials/`**: Lista los materiales de estudio de un tema. (AllowAny)
*   **`DELETE /topics/{id}/materials/{material_id}/`**: Elimina un material de estudio. (IsSuperTeacher)

## 2. Funcionalidades para Estudiantes

Para que la plataforma sea interactiva, los estudiantes necesitan sus propios endpoints. Esto requeriría un nuevo rol de usuario `IsStudent`.

### Endpoints de Progreso del Estudiante

*   **`GET /me/subjects/`**: Lista las asignaturas en las que está inscrito el estudiante autenticado. (IsStudent)
*   **`GET /me/subjects/{id}/progress/`**: Muestra el progreso del estudiante en una asignatura (temas vistos, exámenes realizados, calificaciones). (IsStudent)
*   **`POST /me/topics/{id}/mark-as-viewed/`**: Marca un tema como visto por el estudiante. (IsStudent)

### Endpoints para Realizar Exámenes

El endpoint actual de evaluación es para el profesor. Los estudiantes necesitan una forma de realizar y enviar los exámenes.

*   **`GET /exams/start/`**: Inicia un nuevo examen para el estudiante, basado en una configuración (ej. de una asignatura). Devuelve las preguntas del examen. (IsStudent)
    *   **Body**: `{ "subject_id": "..." }`
*   **`POST /exams/{exam_id}/submit/`**: Envía las respuestas de un examen. El backend lo corrige y guarda el resultado. (IsStudent)
    *   **Body**: `{ "answers": { "question_id_1": "answer_id_a", "question_id_2": "answer_id_c", ... } }`
*   **`GET /me/exams/{exam_id}/results/`**: Permite al estudiante ver los resultados de un examen que ha completado. (IsStudent)

## 3. Analíticas y Estadísticas para Profesores

Ampliar las capacidades de analítica para dar a los profesores una visión más clara del rendimiento de sus estudiantes.

### Endpoints de Estadísticas Avanzadas

*   **`GET /subjects/{id}/analytics/`**: Devuelve estadísticas agregadas para una asignatura:
    *   Rendimiento medio por tema.
    *   Preguntas con mayor tasa de fallos.
    *   Progreso general de los grupos.
    (IsTeacher)

*   **`GET /groups/{id}/analytics/`**: Estadísticas detalladas para un grupo específico, incluyendo el rendimiento individual de cada estudiante (si se añade el modelo `Student`). (IsTeacher)

*   **`GET /questions/{id}/analytics/`**: Muestra estadísticas de una pregunta específica: cuántas veces se ha respondido, porcentaje de aciertos, y cuál es la respuesta incorrecta más común. (IsTeacher)

```

Espero que estos archivos te sean de gran utilidad para continuar con el desarrollo de tu proyecto. ¡Si necesitas algo más, no dudes en preguntar!

<!--
[PROMPT_SUGGESTION]Basado en el CHANGES.md, ¿podrías generar los modelos de Django para el material de estudio y el progreso del estudiante?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Explícame cómo implementarías el sistema de roles para diferenciar entre `IsTeacher` y un nuevo rol `IsStudent`.[/PROMPT_SUGGESTION]
