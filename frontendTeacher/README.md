# Documentación Técnica: frontendTeacher

## Descripción General
Este proyecto es una aplicación móvil y web desarrollada en **React Native** con **Expo**. Su función principal es servir como panel de administración para profesores (`Teacher_iOrg`), permitiendo la gestión de grupos de alumnos, contenido académico (temas y conceptos), bancos de preguntas y visualización de analíticas de rendimientos.

---

## Estructura del Proyecto

El proyecto sigue una arquitectura modular separando la lógica de negocio, la interfaz de usuario y el estado global:

* **`api/`**: Contiene la configuración de Axios y las funciones para realizar peticiones HTTP al backend.
* **`components/`**: Componentes de UI reutilizables (Modales, Headers, Botones).
* **`constants/`**: Definición de constantes globales como colores y textos para internacionalización.
* **`context/`**: Gestión del estado global mediante React Context (Autenticación e Idioma).
* **`navigation/`**: Configuración del enrutamiento de la app (React Navigation).
* **`screens/`**: Pantallas principales de la aplicación.
* **`utils/`**: Utilidades auxiliares (persistencia de tokens).

---

## 1. Configuración y Dependencias

* **Core:** React Native, Expo (SDK 54), React 19.
* **Navegación:** `@react-navigation/native` y `@react-navigation/native-stack`.
* **HTTP Client:** `axios` con interceptores para manejo de tokens y errores.
* **Almacenamiento:** `expo-secure-store` para persistencia segura de credenciales (móvil) y `localStorage` para web.
* **Gráficos:** `react-native-chart-kit` para visualización de analíticas.
* **UI/Iconos:** `lucide-react-native` para iconografía.

---

## 2. Gestión de Estado y Autenticación

### Contexto de Autenticación (`AuthContext`)
Gestiona el ciclo de vida de la sesión del usuario:
* **Login:** Autentica contra el backend y almacena `access` y `refresh` tokens.
* **Sesión:** Verifica y restaura la sesión al iniciar la app usando `restoreSession`.
* **Roles:** Determina si el usuario es "Super Admin" para habilitar funciones extra (ver grupos de otros, invitar usuarios).

### Manejo de Tokens (`sessionApi.js`)
Implementa un sistema robusto de renovación de tokens:
* **Interceptor:** Intercepta errores 401 en las peticiones.
* **Refresh Logic:** Pausa las peticiones fallidas, solicita un nuevo token de acceso usando el refresh token, y reintenta las peticiones en cola.
* **Logout:** Elimina tokens y cierra sesión si falla la renovación.

### Internacionalización (`LanguageContext`)
Permite el cambio dinámico entre Español (`es`) e Inglés (`en`) utilizando un diccionario de strings centralizado.

---

## 3. Módulos Principales (Pantallas)

### Gestión de Grupos (`ManageGroupsScreen`)
* Permite ver los grupos propios y, si es administrador, los grupos de otros profesores.
* **Creación:** Modal para crear nuevos grupos vinculados a una asignatura.
* **Detalle:** Visualización del código de acceso del grupo con opciones para copiar o compartir. Navegación directa a las analíticas del grupo.

### Gestión de Contenido (`ManageContentScreen`)
Administración compleja de estructuras académicas mediante pestañas:
1.  **Temas (Topics):** CRUD de temas. Permite vincular temas a múltiples Asignaturas y Conceptos.
    * Gestiona relaciones (Link/Unlink) comparando el estado original con el nuevo.
2.  **Conceptos (Concepts):** CRUD de conceptos. Permite relacionar conceptos entre sí (Jerarquía padre-hijo).
3.  **Epígrafes (`TopicDetailScreen`):** Gestión de secciones específicas dentro de un tema, ordenadas por `order_id`.

### Banco de Preguntas (`ManageQuestionsScreen`)
* **Listado:** Muestra preguntas con etiquetas de temas y asignaturas.
* **Filtros:** Sistema de filtrado tipo acordeón para buscar por Asignatura o Tema.
* **Wizard (`QuestionWizardModal`):** Asistente de 3 pasos para crear preguntas:
    1.  **Contexto:** Selección de asignatura, temas (y conceptos filtrados por tema) y tipo de pregunta (Múltiple/Booleana).
    2.  **Español:** Redacción del enunciado y respuestas en español, marcando las correctas.
    3.  **Inglés:** Traducción de los campos al inglés.

### Analíticas (`AnalyticsScreen`)
* Visualización de rendimiento mediante gráficos de barras.
* **Filtros Dinámicos:** Permite agrupar los datos por Tema, Concepto, Grupo o Pregunta.
* **Filtrado por Asignatura:** Modal para acotar los datos a una asignatura específica.
* Muestra una tabla detallada con porcentajes de aciertos e intentos debajo de la gráfica.

### Gestión de Usuarios (`ManageUsersScreen`)
* Funcionalidad exclusiva para super-administradores (`isSuper`).
* Lista usuarios existentes con sus roles y permite invitar a nuevos profesores o administradores vía email.

---

## 4. Componentes Reutilizables Destacados

* **`CustomHeader`:** Cabecera adaptable que maneja la navegación, muestra el título, y contiene el acceso a ajustes (Cambio de idioma, Cambio de contraseña, Logout).
* **`ContentModals`:** Contiene `TopicModal`, `ConceptModal` y `EpigraphModal`. Manejan formularios complejos con selectores múltiples (`MultiSelect`) para vinculaciones.
* **`QuestionWizardModal`:** Modal complejo de pasos para la creación estructurada de evaluaciones.

## 5. Endpoints API Utilizados

La aplicación se comunica con una API REST (Django, presumiblemente) en `http://172.25.28.130:8000/`.

* **Auth:** `/login/`, `/logout/`, `/token/refresh/`, `/account/profile/`, `/change-password/`.
* **Cursos:** `/subjects/`, `/studentgroups/my-groups/`, `/studentgroups/others-groups/`.
* **Contenido:** `/topics/`, `/concepts/`, `/topics/{id}/epigraphs/`.
* **Relaciones:** `/subjects/{id}/topics/`, `/topics/{id}/concepts/`, `/concepts/{id}/concepts/`.
* **Evaluación:** `/questions/long-questions/`, `/questions/{id}/answers/`.
* **Analíticas:** `/analytics/performance/`.
* **Usuarios:** `/users/invite` (Simulado/Mock en código actual).

