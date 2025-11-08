import requests
import json

# --- CONFIGURACIÓN ---
BASE_URL = "http://127.0.0.1:8000/"
TEACHER_EMAIL = "admin@admin.com"
TEACHER_PASSWORD = "admin123"

def print_status(response, success_message):
    """Imprime el estado de una petición HTTP."""
    if 200 <= response.status_code < 300:
        print(f"✅ SUCCESS: {success_message} (Status: {response.status_code})")
        try:
            return response.json()
        except json.JSONDecodeError:
            return None
    else:
        print(f"❌ ERROR: {success_message} (Status: {response.status_code})")
        print(f"   Response: {response.text}")
        return None

def authenticate():
    """Obtiene el token de autenticación para el profesor."""
    print("\n--- 1. Autenticando al profesor ---")
    url = f"{BASE_URL}/token/"
    payload = {
        "email": TEACHER_EMAIL,
        "password": TEACHER_PASSWORD
    }
    response = requests.post(url, json=payload)
    data = print_status(response, "Obteniendo token de acceso")
    if data and 'access' in data:
        token = data['access']
        return {"Authorization": f"Bearer {token}"}
    else:
        print("🛑 No se pudo autenticar. Asegúrate de que el superprofesor existe con las credenciales correctas.")
        exit()

def create_subjects(headers):
    """Crea asignaturas de ejemplo."""
    print("\n--- 2. Creando Asignaturas ---")
    subjects_data = [
        {
            "name_es": "Organización de Empresas",
            "name_en": "Business Organization",
            "description_es": "Fundamentos de la estructura y gestión empresarial.",
            "description_en": "Fundamental concepts of business organization."
        },
        {
            "name_es": "Ingeniería del Software",
            "name_en": "Software Engineering",
            "description_es": "Principios y prácticas para el desarrollo de software de calidad.",
            "description_en": "Principles and practices for software development."
        }
    ]
    created_subjects = []
    for subject in subjects_data:
        response = requests.post(f"{BASE_URL}/subjects/", headers=headers, json=subject)
        created_subject = print_status(response, f"Creando asignatura: {subject['name_es']}")
        if created_subject:
            created_subjects.append(created_subject)
    return created_subjects

def create_topics(headers):
    """Crea temas de ejemplo."""
    print("\n--- 3. Creando Temas ---")
    enterprise_topics = [
        {"title_es": "Introducción a la Empresa", "title_en": "Introduction to Business", 
         "description_es": "Descripción de la introducción a la empresa", "description_en": "Description of the introduction to business"},
        {"title_es": "Estructuras Organizativas", "title_en": "Organizational Structures",
         "description_es": "Descripción de las estructuras organizativas", "description_en": "Description of organizational structures"},
    ]
    software_topics = [
        {"title_es": "Ciclo de Vida del Software", "title_en": "Software Lifecycle",
         "description_es": "Descripción del ciclo de vida del software", "description_en": "Description of software lifecycle"},
        {"title_es": "Metodologías Ágiles", "title_en": "Agile Methodologies",
         "description_es": "Descripción de las metodologías ágiles", "description_en": "Description of agile methodologies"},
    ]
    topics_data = enterprise_topics + software_topics
    created_topics = []
    for topic in topics_data:
        response = requests.post(f"{BASE_URL}/topics/", headers=headers, json=topic)
        created_topic = print_status(response, f"Creando tema: {topic['title_es']}")
        if created_topic:
            created_topics.append(created_topic)

    
    return created_topics

def create_concepts(headers):
    """Crea conceptos de ejemplo."""
    print("\n--- 4. Creando Conceptos ---")
    concepts_data = [
        {"name_es": "Misión y Visión", "name_en": "Mission and Vision", 
         "description_es": "Descripción de la misión y visión", "description_en": "Description of mission and vision"},
        {"name_es": "Análisis DAFO", "name_en": "SWOT Analysis", 
         "description_es": "Descripción del análisis DAFO", "description_en": "Description of SWOT analysis"},
        {"name_es": "Estructura Funcional", "name_en": "Functional Structure", 
         "description_es": "Descripción de la estructura funcional", "description_en": "Description of functional structure"},
        {"name_es": "Modelo en Cascada", "name_en": "Waterfall Model", 
         "description_es": "Descripción del modelo en cascada", "description_en": "Description of waterfall model"},
        {"name_es": "Scrum", "name_en": "Scrum", 
         "description_es": "Descripción del Scrum", "description_en": "Description of Scrum"},
        {"name_es": "Kanban", "name_en": "Kanban", 
         "description_es": "Descripción del Kanban", "description_en": "Description of Kanban"},
    ]
    created_concepts = []
    for concept in concepts_data:
        response = requests.post(f"{BASE_URL}/concepts/", headers=headers, json=concept)
        created_concept = print_status(response, f"Creando concepto: {concept['name_es']}")
        if created_concept:
            created_concepts.append(created_concept)
    return created_concepts

def link_content(headers, subjects, topics, concepts):
    """Establece relaciones entre el contenido creado."""
    print("\n--- 5. Vinculando Contenido ---")
    
    # Vincular Temas a Asignaturas
    # Asignatura 1: Organización de Empresas
    requests.post(f"{BASE_URL}/subjects/{subjects[0]['id']}/topics/", headers=headers, json={"topic_name": "Introducción a la Empresa", "order_id": 1})
    requests.post(f"{BASE_URL}/subjects/{subjects[0]['id']}/topics/", headers=headers, json={"topic_name": "Estructuras Organizativas", "order_id": 2})
    print("✅ Temas vinculados a 'Organización de Empresas'")

    # Asignatura 2: Ingeniería del Software
    requests.post(f"{BASE_URL}/subjects/{subjects[1]['id']}/topics/", headers=headers, json={"topic_name": "Ciclo de Vida del Software", "order_id": 1})
    requests.post(f"{BASE_URL}/subjects/{subjects[1]['id']}/topics/", headers=headers, json={"topic_name": "Metodologías Ágiles", "order_id": 2})
    print("✅ Temas vinculados a 'Ingeniería del Software'")

    # Vincular Conceptos a Temas
    # Tema 1: Introducción a la Empresa
    requests.post(f"{BASE_URL}/topics/{topics[0]['id']}/concepts/", headers=headers, json={"concept_name": "Misión y Visión", "order_id": 1})
    requests.post(f"{BASE_URL}/topics/{topics[0]['id']}/concepts/", headers=headers, json={"concept_name": "Análisis DAFO", "order_id": 2})
    print("✅ Conceptos vinculados a 'Introducción a la Empresa'")

    # Tema 2: Estructuras Organizativas
    requests.post(f"{BASE_URL}/topics/{topics[1]['id']}/concepts/", headers=headers, json={"concept_name": "Estructura Funcional", "order_id": 1})
    print("✅ Conceptos vinculados a 'Estructuras Organizativas'")

    # Tema 3: Ciclo de Vida del Software
    requests.post(f"{BASE_URL}/topics/{topics[2]['id']}/concepts/", headers=headers, json={"concept_name": "Modelo en Cascada", "order_id": 1})
    print("✅ Conceptos vinculados a 'Ciclo de Vida del Software'")

    # Tema 4: Metodologías Ágiles
    requests.post(f"{BASE_URL}/topics/{topics[3]['id']}/concepts/", headers=headers, json={"concept_name": "Scrum", "order_id": 1})
    requests.post(f"{BASE_URL}/topics/{topics[3]['id']}/concepts/", headers=headers, json={"concept_name": "Kanban", "order_id": 2})
    print("✅ Conceptos vinculados a 'Metodologías Ágiles'")

    # Vincular Conceptos entre sí
    requests.post(f"{BASE_URL}/concepts/{concepts[4]['id']}/concepts/", headers=headers, json={"concept_to_name": "Kanban", "bidirectional": False})
    print("✅ Relación creada: Scrum -> Kanban")

def create_epigraphs(headers, topics):
    """Crea epígrafes para los temas."""
    print("\n--- 6. Creando Epígrafes ---")
    epigraphs_data = {
        "Introducción a la Empresa": [
            {"name_es": "1.1. ¿Qué es una empresa?", "name_en": "1.1. What is a company?", "order_id": 1},
            {"name_es": "1.2. ¿Qué es una organización?", "name_en": "1.2. What is an organization?", "order_id": 2},
        ],
        "Metodologías Ágiles": [
            {"name_es": "2.1. Manifiesto Ágil", "name_en": "2.1. Agile Manifesto", "order_id": 1},
            {"name_es": "2.2. Roles en Scrum", "name_en": "2.2. Scrum Roles", "order_id": 2},
        ]
    }

    topic_map = {t['title']: t['id'] for t in topics}

    for topic_title, epigraphs in epigraphs_data.items():
        topic_id = topic_map.get(topic_title)
        if topic_id:
            for epi in epigraphs:
                print(epi)
                payload = {
                    "name_es": epi["name_es"],
                    "name_en": epi["name_en"],
                    "order_id": epi["order_id"],
                    "description_es": f"Contenido para {epi['name_es']}"
                }
                response = requests.post(f"{BASE_URL}/topics/{topic_id}/epigraphs/", headers=headers, json=payload)
                print_status(response, f"Creando epígrafe '{epi['name_es']}' para '{topic_title}'")

def create_questions_and_answers(headers):
    """Crea preguntas y sus respuestas."""
    print("\n--- 7. Creando Preguntas y Respuestas ---")
    questions_data = [
        {
            "question": {
                "type": "multiple",
                "statement_es": "¿Cuál de los siguientes NO es un componente del análisis DAFO?",
                "statement_en": "Which of the following is NOT a component of SWOT analysis?",
                "topics_titles": ["Introducción a la Empresa"],
                "concepts_names": ["Análisis DAFO"]
            },
            "answers": [
                {"text_es": "Debilidades", "text_en": "Weaknesses", "is_correct": False},
                {"text_es": "Oportunidades", "text_en": "Opportunities", "is_correct": False},
                {"text_es": "Fortalezas", "text_en": "Strengths", "is_correct": True},
                {"text_es": "Flexibilidad", "text_en": "Flexibility", "is_correct": False},
            ]
        },
        {
            "question": {
                "type": "multiple",
                "statement_es": "¿Qué rol NO pertenece a un equipo Scrum?",
                "statement_en": "Which role does NOT belong to a Scrum team?",
                "topics_titles": ["Metodologías Ágiles"],
                "concepts_names": ["Scrum"]
            },
            "answers": [
                {"text_es": "Programador", "text_en": "Developer", "is_correct": False},
                {"text_es": "Analista", "text_en": "Analyst", "is_correct": False},
                {"text_es": "Tester", "text_en": "Tester", "is_correct": True},
                {"text_es": "Scrum Master", "text_en": "Scrum Master", "is_correct": False},
            ]
        }
    ]

    for item in questions_data:
        # Crear la pregunta
        response_q = requests.post(f"{BASE_URL}/questions/", headers=headers, json=item["question"])
        created_question = print_status(response_q, f"Creando pregunta: {item['question']['statement_es'][:30]}...")
        
        if created_question:
            question_id = created_question['id']
            # Crear las respuestas para esa pregunta
            for answer in item["answers"]:
                payload = {
                    "text_es": answer["text_es"],
                    "text_en": answer.get("text_en", answer["text_es"]),
                    "is_correct": answer["is_correct"]
                }
                response_a = requests.post(f"{BASE_URL}/questions/{question_id}/answers/", headers=headers, json=payload)
                print_status(response_a, f"  -> Creando respuesta: {answer['text_es']}")

def create_student_groups(headers, subjects):
    """Crea grupos de estudiantes para las asignaturas."""
    print("\n--- 8. Creando Grupos de Estudiantes ---")
    
    # Grupo para Organización de Empresas
    subject_id_org = subjects[0]['id']
    group_org = {
        "name_es": "Grupo de Prácticas Mañana",
        "name_en": "Morning Practice Group"
    }
    response_g1 = requests.post(f"{BASE_URL}/subjects/{subject_id_org}/groups/", headers=headers, json=group_org)
    created_g1 = print_status(response_g1, f"Creando grupo para '{subjects[0]['name']}'")
    if created_g1:
        print(f"   Código de Grupo generado: {created_g1.get('groupCode')}")

    # Grupo para Ingeniería del Software
    subject_id_is = subjects[1]['id']
    group_is = {
        "name_es": "Grupo de Laboratorio Tarde",
        "name_en": "Afternoon Lab Group"
    }
    response_g2 = requests.post(f"{BASE_URL}/subjects/{subject_id_is}/groups/", headers=headers, json=group_is)
    created_g2 = print_status(response_g2, f"Creando grupo para '{subjects[1]['name']}'")
    if created_g2:
        print(f"   Código de Grupo generado: {created_g2.get('groupCode')}")

def clear_database(headers):
    """Limpia la base de datos eliminando los objetos creados."""
    print("\n--- 0. Limpiando la base de datos ---")
    
    # Obtener y eliminar todos los grupos de estudiantes (a través de sus asignaturas)
    subjects_resp = requests.get(f"{BASE_URL}/subjects/", headers=headers)
    if subjects_resp.status_code == 200:
        subjects = subjects_resp.json()
        for subject in subjects:
            groups_resp = requests.get(f"{BASE_URL}/subjects/{subject['id']}/groups/", headers=headers)
            if groups_resp.status_code == 200:
                groups = groups_resp.json()
                for group in groups:
                    requests.delete(f"{BASE_URL}/studentgroups/{group['id']}/", headers=headers)
            print_status(requests.delete(f"{BASE_URL}/subjects/{subject['id']}/", headers=headers), f"Eliminando asignatura: {subject['name_es']}")

    # Obtener y eliminar todas las preguntas
    questions_resp = requests.get(f"{BASE_URL}/questions/", headers=headers)
    if questions_resp.status_code == 200:
        questions = questions_resp.json()
        for question in questions:
            print_status(requests.delete(f"{BASE_URL}/questions/{question['id']}/", headers=headers), f"Eliminando pregunta ID: {question['id']}")

    # Obtener y eliminar todos los temas
    topics_resp = requests.get(f"{BASE_URL}/topics/", headers=headers)
    if topics_resp.status_code == 200:
        topics = topics_resp.json()
        for topic in topics:
            print_status(requests.delete(f"{BASE_URL}/topics/{topic['id']}/", headers=headers), f"Eliminando tema: {topic['title_es']}")

    # Obtener y eliminar todos los conceptos
    concepts_resp = requests.get(f"{BASE_URL}/concepts/", headers=headers)
    if concepts_resp.status_code == 200:
        concepts = concepts_resp.json()
        for concept in concepts:
            print_status(requests.delete(f"{BASE_URL}/concepts/{concept['id']}/", headers=headers), f"Eliminando concepto: {concept['name_es']}")

    print("✅ Limpieza completada.")


def main():
    """Función principal que orquesta la población de la base de datos."""
    auth_headers = authenticate()

    subjects = create_subjects(auth_headers)
    topics = create_topics(auth_headers)
    concepts = create_concepts(auth_headers)

    if not all([subjects, topics, concepts]):
        print("🛑 Error al crear entidades base. Abortando.")
        return

    link_content(auth_headers, subjects, topics, concepts)
    create_epigraphs(auth_headers, topics)
    create_questions_and_answers(auth_headers)
    create_student_groups(auth_headers, subjects)

    print("\n🎉 ¡Población de la base de datos completada con éxito!")

if __name__ == "__main__":
    main()