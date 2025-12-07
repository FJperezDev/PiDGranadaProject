# Documentación Técnica: Frontend Student (Student_iOrg)

## 1. Descripción del Proyecto
Aplicación móvil desarrollada con **React Native** y **Expo** para estudiantes. Su objetivo es facilitar el acceso a contenidos de asignaturas, realizar autoevaluaciones (exámenes) y juegos didácticos. El proyecto utiliza una arquitectura basada en componentes funcionales y Hooks.

### Stack Tecnológico
* **Framework:** React Native 0.81.5 / Expo ~54.0.25.
* **Lenguaje:** JavaScript (ES6+).
* **Navegación:** React Navigation (Native Stack).
* **Gestión de Estado:** Context API (`LanguageContext`).
* **Cliente HTTP:** Axios.
* **Estilos:** `StyleSheet` (Styled components personalizados).
* **Iconos:** Lucide React Native y Expo Vector Icons (Ionicons).

---

## 2. Estructura de Directorios
La estructura principal del código fuente (`src` o raíz de desarrollo) es la siguiente:

* **`components/`**: Elementos de UI reutilizables (Modales, Botones, Inputs, Header).
* **`constants/`**: Configuraciones estáticas como colores (`colors.js`) y textos traducidos (`strings.js`).
* **`context/`**: Lógica de estado global (idioma).
* **`screens/`**: Pantallas principales de la navegación.
* **`services/`**: Lógica de comunicación con el backend (`api.js`, `apiClient.js`).
* **`App.js`**: Punto de entrada y configuración de rutas.

---

## 3. Navegación. 
`La aplicación utiliza un `Stack.Navigator` envuelto en un `SafeAreaProvider` y un `LanguageProvider`.

### Rutas Definidas
1.  **Home**: Pantalla inicial de validación de código.
2.  **Subject**: Menú principal de la asignatura.
3.  **TopicDetail**: Detalle de un tema específico.
4.  **Game**: Juego del hexágono.
5.  **GameResult**: Resultados del juego.
6.  **ExamSetup**: Configuración de parámetros del examen.
7.  **Exam**: Pantalla de ejecución del examen.
8.  **ExamResult**: Resultados y corrección del examen.
9.  **ExamRecommendations**: Pantalla de recomendaciones post-examen.

**Configuración Global:**
* Se utiliza un header personalizado (`CustomHeader`) para todas las pantallas.
* La barra de navegación gestiona el historial y permite volver atrás o salir de la sesión (logout) dependiendo de la ruta.

---

## 4. Componentes Principales (`/components`)

### Interfaz de Usuario
* **`CustomHeader`**: Muestra el título de la app, botón de retroceso (o logout en `SubjectScreen`) y el selector de idioma (`LanguageSwitcher`).
* **`StyledButton`**: Botón estandarizado con soporte para iconos y estados de carga/deshabilitado. Usa estilos base redondeados y sombras.
* **`StyledTextInput`**: Input de texto estilizado con bordes y padding consistente.

### Modales
* **`AlertModal`**: Modal simple para mostrar errores o mensajes de sistema (título, mensaje y botón OK).
* **`ContentModal`**: Modal genérico para mostrar contenido de texto plano (usado en Epígrafes) con botón de cierre.
* **`ConceptModal`**: Modal avanzado para visualizar conceptos educativos.
    * **Descripción**: Muestra la definición del concepto.
    * **Ejemplos**: Lista ejemplos prácticos parseados desde un string separado por `@`.
    * **Relaciones**: Renderiza botones para navegar a conceptos relacionados. Al pulsar, actualiza el contenido del modal sin cerrarlo.

---

## 5. Pantallas y Lógica de Negocio (`/screens`)

### Acceso (`HomeScreen`)
* Solicita un "Subject Code" al usuario.
* Valida el código contra la API (`validateStudentGroupCode`). Si es correcto, navega a `Subject`.

### Asignatura (`SubjectScreen`)
* Carga los detalles de la asignatura y la lista de temas (`topics`) desde la API.
* Muestra los temas en una `FlatList`.
* Provee accesos directos al Juego (`Game`) y a la configuración de examen (`ExamSetup`).

### Detalle del Tema (`TopicDetailScreen`)
* Obtiene detalles (conceptos y epígrafes) del tema seleccionado.
* **Interacción**:
    * Pulsar un **Concepto** abre el `ConceptModal`.
    * Pulsar un **Epígrafe** abre el `ContentModal`.

### Sistema de Exámenes (`ExamSetup`, `Exam`, `ExamResult`)
1.  **Configuración (`ExamSetup`)**: Permite seleccionar qué temas incluir (checkboxes) y el número de preguntas.
2.  **Ejecución (`ExamScreen`)**:
    * Genera el examen vía API (`generateExam`).
    * Maneja un temporizador (90 segundos por pregunta).
    * Soporta traducción dinámica de preguntas si se cambia el idioma durante el examen.
3.  **Evaluación (`ExamResult`)**:
    * Envía respuestas al backend para calificación (`evaluateExam`).
    * Visualiza aciertos (verde), fallos (rojo) y respuestas correctas no seleccionadas (punteado verde).
    * Muestra explicaciones para preguntas falladas.

### Gamificación (`GameScreen`, `GameResult`)
* **Juego**: Serie de preguntas cargadas desde `GAME_QUESTIONS`.
* **Lógica**: Cuenta la frecuencia de códigos de respuesta (0-6).
* **Resultado**: Calcula el código predominante y muestra la "Organización Resultante" (imagen y texto) ocultos tras un panel de "Tocar para revelar".

---

## 6. Servicios y API (`/services`)

### Cliente HTTP (`apiClient.js`)
* Configurado con `axios`.
* **Base URL**: `http://172.25.28.130:8000` (Localhost).
* **Interceptor**: Añade automáticamente el header `Accept-Language` basado en el contexto actual (`es` o `en`).

### Endpoints (`api.js`)
La aplicación consume los siguientes endpoints REST:

| Función JS | Método HTTP | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| `validateStudentGroupCode` | GET | `/studentgroups/exists/` | Verifica si el grupo existe. |
| `getSubject` | GET | `/studentgroups/subject/` | Obtiene datos de la asignatura. |
| `getTopics` | GET | `/studentgroups/topics/` | Lista los temas por código. |
| `getTopicDetails` | GET | `/studentgroups/topic/` | Detalle (conceptos/epígrafes). |
| `getConcepts` | GET | `/concepts/` | Lista global de conceptos. |
| `generateExam` | GET | `/exams/generate-exam/` | Crea examen aleatorio. |
| `evaluateExam` | POST | `/exams/evaluate-exam/` | Corrige examen y da feedback. |
| `getQuestion` | GET | `/studentgroups/question-translate/` | Traduce una pregunta específica. |
| `getGameQuestions` | GET | `/game/questions` | Obtiene preguntas del juego. |

---

## 7. Internacionalización (`LanguageContext`)
* **Contexto**: Almacena el idioma actual (`es` por defecto).
* **Traducción**: Expone la función `t(key)` que busca la cadena correspondiente en `constants/strings.js`.
* **Persistencia**: El cambio de idioma se propaga a los headers de la API y recarga componentes sensibles al idioma.
