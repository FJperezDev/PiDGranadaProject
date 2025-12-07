# Documentación Técnica: Frontend Student (Student_iOrg)

## 1. Descripción del Proyecto
[span_0](start_span)[span_1](start_span)Aplicación móvil desarrollada con **React Native** y **Expo** para estudiantes[span_0](end_span)[span_1](end_span). Su objetivo es facilitar el acceso a contenidos de asignaturas, realizar autoevaluaciones (exámenes) y juegos didácticos. El proyecto utiliza una arquitectura basada en componentes funcionales y Hooks.

### Stack Tecnológico
* **[span_2](start_span)Framework:** React Native 0.81.5 / Expo ~54.0.25[span_2](end_span).
* **Lenguaje:** JavaScript (ES6+).
* **[span_3](start_span)Navegación:** React Navigation (Native Stack)[span_3](end_span).
* **[span_4](start_span)Gestión de Estado:** Context API (`LanguageContext`)[span_4](end_span).
* **[span_5](start_span)[span_6](start_span)Cliente HTTP:** Axios[span_5](end_span)[span_6](end_span).
* **[span_7](start_span)[span_8](start_span)Estilos:** `StyleSheet` y utilidades tipo Tailwind (NativeWind/Styled components personalizados)[span_7](end_span)[span_8](end_span).
* **[span_9](start_span)[span_10](start_span)Iconos:** Lucide React Native y Expo Vector Icons (Ionicons)[span_9](end_span)[span_10](end_span).

---

## 2. Estructura de Directorios
[span_11](start_span)La estructura principal del código fuente (`src` o raíz de desarrollo) es la siguiente[span_11](end_span):

* **`components/`**: Elementos de UI reutilizables (Modales, Botones, Inputs, Header).
* **`constants/`**: Configuraciones estáticas como colores (`colors.js`) y textos traducidos (`strings.js`).
* **`context/`**: Lógica de estado global (idioma).
* **`screens/`**: Pantallas principales de la navegación.
* **`services/`**: Lógica de comunicación con el backend (`api.js`, `apiClient.js`).
* **`App.js`**: Punto de entrada y configuración de rutas.

---

## 3. Navegación (`App.js`)
[span_12](start_span)[span_13](start_span)La aplicación utiliza un `Stack.Navigator` envuelto en un `SafeAreaProvider` y un `LanguageProvider`[span_12](end_span)[span_13](end_span).

### Rutas Definidas
1.  **[span_14](start_span)Home**: Pantalla inicial de validación de código[span_14](end_span).
2.  **[span_15](start_span)Subject**: Menú principal de la asignatura[span_15](end_span).
3.  **[span_16](start_span)TopicDetail**: Detalle de un tema específico[span_16](end_span).
4.  **[span_17](start_span)Game**: Juego del hexágono[span_17](end_span).
5.  **[span_18](start_span)GameResult**: Resultados del juego[span_18](end_span).
6.  **[span_19](start_span)ExamSetup**: Configuración de parámetros del examen[span_19](end_span).
7.  **[span_20](start_span)Exam**: Pantalla de ejecución del examen[span_20](end_span).
8.  **[span_21](start_span)ExamResult**: Resultados y corrección del examen[span_21](end_span).
9.  **[span_22](start_span)ExamRecommendations**: Pantalla de recomendaciones post-examen[span_22](end_span).

**Configuración Global:**
* [span_23](start_span)Se utiliza un header personalizado (`CustomHeader`) para todas las pantallas[span_23](end_span).
* [span_24](start_span)La barra de navegación gestiona el historial y permite volver atrás o salir de la sesión (logout) dependiendo de la ruta[span_24](end_span).

---

## 4. Componentes Principales (`/components`)

### Interfaz de Usuario
* **[span_25](start_span)[span_26](start_span)`CustomHeader`**: Muestra el título de la app, botón de retroceso (o logout en `SubjectScreen`) y el selector de idioma (`LanguageSwitcher`)[span_25](end_span)[span_26](end_span).
* **`StyledButton`**: Botón estandarizado con soporte para iconos y estados de carga/deshabilitado. [span_27](start_span)[span_28](start_span)Usa estilos base redondeados y sombras[span_27](end_span)[span_28](end_span).
* **[span_29](start_span)`StyledTextInput`**: Input de texto estilizado con bordes y padding consistente[span_29](end_span).

### Modales
* **[span_30](start_span)`AlertModal`**: Modal simple para mostrar errores o mensajes de sistema (título, mensaje y botón OK)[span_30](end_span).
* **[span_31](start_span)`ContentModal`**: Modal genérico para mostrar contenido de texto plano (usado en Epígrafes) con botón de cierre[span_31](end_span).
* **[span_32](start_span)`ConceptModal`**: Modal avanzado para visualizar conceptos educativos[span_32](end_span).
    * **[span_33](start_span)Descripción**: Muestra la definición del concepto[span_33](end_span).
    * **[span_34](start_span)[span_35](start_span)Ejemplos**: Lista ejemplos prácticos parseados desde un string separado por `@`[span_34](end_span)[span_35](end_span).
    * **Relaciones**: Renderiza botones para navegar a conceptos relacionados. [span_36](start_span)[span_37](start_span)Al pulsar, actualiza el contenido del modal sin cerrarlo[span_36](end_span)[span_37](end_span).

---

## 5. Pantallas y Lógica de Negocio (`/screens`)

### Acceso (`HomeScreen`)
* Solicita un "Subject Code" al usuario.
* Valida el código contra la API (`validateStudentGroupCode`). [span_38](start_span)[span_39](start_span)Si es correcto, navega a `Subject`[span_38](end_span)[span_39](end_span).

### Asignatura (`SubjectScreen`)
* [span_40](start_span)Carga los detalles de la asignatura y la lista de temas (`topics`) desde la API[span_40](end_span).
* [span_41](start_span)Muestra los temas en una `FlatList`[span_41](end_span).
* [span_42](start_span)Provee accesos directos al Juego (`Game`) y a la configuración de examen (`ExamSetup`)[span_42](end_span).

### Detalle del Tema (`TopicDetailScreen`)
* [span_43](start_span)Obtiene detalles (conceptos y epígrafes) del tema seleccionado[span_43](end_span).
* **Interacción**:
    * [span_44](start_span)Pulsar un **Concepto** abre el `ConceptModal`[span_44](end_span).
    * [span_45](start_span)Pulsar un **Epígrafe** abre el `ContentModal`[span_45](end_span).

### Sistema de Exámenes (`ExamSetup`, `Exam`, `ExamResult`)
1.  **[span_46](start_span)[span_47](start_span)Configuración (`ExamSetup`)**: Permite seleccionar qué temas incluir (checkboxes) y el número de preguntas[span_46](end_span)[span_47](end_span).
2.  **Ejecución (`ExamScreen`)**:
    * [span_48](start_span)Genera el examen vía API (`generateExam`)[span_48](end_span).
    * [span_49](start_span)Maneja un temporizador (90 segundos por pregunta)[span_49](end_span).
    * [span_50](start_span)Soporta traducción dinámica de preguntas si se cambia el idioma durante el examen[span_50](end_span).
3.  **Evaluación (`ExamResult`)**:
    * [span_51](start_span)Envía respuestas al backend para calificación (`evaluateExam`)[span_51](end_span).
    * [span_52](start_span)[span_53](start_span)Visualiza aciertos (verde), fallos (rojo) y respuestas correctas no seleccionadas (punteado verde)[span_52](end_span)[span_53](end_span).
    * [span_54](start_span)Muestra explicaciones para preguntas falladas[span_54](end_span).

### Gamificación (`GameScreen`, `GameResult`)
* **[span_55](start_span)Juego**: Serie de preguntas cargadas desde `GAME_QUESTIONS`[span_55](end_span).
* **[span_56](start_span)Lógica**: Cuenta la frecuencia de códigos de respuesta (0-6)[span_56](end_span).
* **[span_57](start_span)[span_58](start_span)Resultado**: Calcula el código predominante y muestra la "Organización Resultante" (imagen y texto) ocultos tras un panel de "Tocar para revelar"[span_57](end_span)[span_58](end_span).

---

## 6. Servicios y API (`/services`)

### Cliente HTTP (`apiClient.js`)
* Configurado con `axios`.
* **[span_59](start_span)Base URL**: `http://172.25.28.130:8000` (Localhost)[span_59](end_span).
* **[span_60](start_span)Interceptor**: Añade automáticamente el header `Accept-Language` basado en el contexto actual (`es` o `en`)[span_60](end_span).

### Endpoints (`api.js`)
[span_61](start_span)La aplicación consume los siguientes endpoints REST [cite: 319-343]:

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
* [cite_start]**Contexto**: Almacena el idioma actual (`es` por defecto)[span_61](end_span).
* **[span_62](start_span)Traducción**: Expone la función `t(key)` que busca la cadena correspondiente en `constants/strings.js`[span_62](end_span).
* **[span_63](start_span)[span_64](start_span)Persistencia**: El cambio de idioma se propaga a los headers de la API y recarga componentes sensibles al idioma[span_63](end_span)[span_64](end_span).
