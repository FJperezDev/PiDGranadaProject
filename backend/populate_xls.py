import pandas as pd
import requests
import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "http://localhost:8000"
TEACHER_EMAIL = "admin@admin.com"
TEACHER_PASSWORD = "admin123"
EXCEL_FILE = "Prueba.xlsx"

# Número de peticiones simultáneas (ajustar si el servidor se satura)
MAX_WORKERS = 3

def clean_str(val):
    if pd.isna(val) or val == "":
        return ""
    return str(val).replace(".0", "").strip()

def log_error(context, status, response_text=""):
    """Solo imprime si hay error"""
    print(f"❌ Error en {context} (Status: {status}) | {response_text[:100]}")

def log_warning(msg):
    """Imprime advertencias de lógica"""
    print(f"⚠️ {msg}")

def authenticate(session):
    try:
        r = session.post(f"{BASE_URL}/login/", json={"email": TEACHER_EMAIL, "password": TEACHER_PASSWORD})
        if r.status_code == 200:
            token = r.json().get("access")
            session.headers.update({"Authorization": f"Bearer {token}"})
            print("✅ Autenticado correctamente. Iniciando carga masiva...")
            return True
        else:
            log_error("Login", r.status_code, r.text)
            return False
    except Exception as e:
        print(f"🛑 Error crítico de conexión: {e}")
        return False

def post_task(session, url, payload, identifier, map_key=None):
    """
    Función unitaria que ejecutará cada hilo.
    Retorna: (identificador, id_creado_en_bd, respuesta_json)
    """
    try:
        r = session.post(url, json=payload)
        if 200 <= r.status_code < 300:
            try:
                data = r.json()
                # Retornamos la clave para el mapa (ej: codigo asignatura) y el ID real de la BD
                return map_key, data.get("id"), data
            except:
                return map_key, None, None
        else:
            log_error(identifier, r.status_code, r.text)
            return map_key, None, None
    except Exception as e:
        print(f"❌ Excepción enviando {identifier}: {e}")
        return map_key, None, None

def main():
    # 1. Cargar Excel
    try:
        xls = {name: df.fillna("") for name, df in pd.read_excel(EXCEL_FILE, sheet_name=None).items()}
    except FileNotFoundError:
        sys.exit(f"🛑 No se encontró el archivo {EXCEL_FILE}")

    # 2. Iniciar Sesión HTTP persistente
    session = requests.Session()
    if not authenticate(session):
        sys.exit()

    # Mapas para guardar las referencias (Code -> ID_BD)
    subjects_map = {}
    topics_map = {}
    concepts_map = {}
    concepts_name_map = {}
    questions_map = {}

    # Usamos un Executor para paralelizar
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:

        # --- SUBJECTS ---
        futures = []
        for _, row in xls["subjects"].iterrows():
            payload = row.to_dict()
            s_code = clean_str(row["subject_code"])
            payload["subject_code"] = s_code
            
            # Lanzamos la tarea
            futures.append(executor.submit(post_task, session, f"{BASE_URL}/subjects/", payload, f"Asignatura {s_code}", s_code))

        # Recogemos resultados Subjects
        for future in as_completed(futures):
            key, db_id, _ = future.result()
            if key and db_id:
                subjects_map[key] = db_id

        # --- TOPICS ---
        futures = []
        # Guardamos datos extra para la segunda llamada (vinculación)
        topic_relations_payloads = [] 

        for _, row in xls["topics"].iterrows():
            t_code = clean_str(row["topic_code"])
            s_code = clean_str(row["subject_code"])
            
            subject_id = subjects_map.get(s_code)
            
            payload = row.to_dict()
            payload["topic_code"] = t_code
            payload.pop("subject_code", None)

            # Enviamos POST Topic
            f = executor.submit(post_task, session, f"{BASE_URL}/topics/", payload, f"Tema {t_code}", t_code)
            futures.append((f, subject_id, row["title_es"], row["order_id"])) # Guardamos contexto para post-proceso

        # Recogemos resultados Topics y lanzamos vinculaciones
        relation_futures = []
        for future, s_id, title, order in futures:
            key, t_id, _ = future.result() # key es t_code
            if key and t_id:
                topics_map[key] = t_id
                if s_id:
                    # Vinculación Subject-Topic (rápida, no bloqueamos esperando respuesta)
                    rel_payload = {"topic_name": title, "order_id": order}
                    relation_futures.append(executor.submit(post_task, session, f"{BASE_URL}/subjects/{s_id}/topics/", rel_payload, f"Link S{s_id}->T{t_id}", None))
        
        # Esperamos a que terminen las vinculaciones de temas (opcional, pero ordenado)
        for f in as_completed(relation_futures): pass


        # --- CONCEPTS ---
        futures = []
        concept_relations_payloads = []

        for _, row in xls["concepts"].iterrows():
            c_code = clean_str(row["concept_code"])
            t_code = clean_str(row.get("related_topic_code"))
            
            payload = row.to_dict()
            payload.pop("related_topic_code", None)
            payload.pop("related_concept_codes", None) # Lo ignoramos aquí, usamos hoja relations o lógica posterior
            payload["concept_code"] = c_code

            f = executor.submit(post_task, session, f"{BASE_URL}/concepts/", payload, f"Concepto {c_code}", c_code)
            futures.append((f, t_code, row["name_es"]))

        for future, t_code, c_name in futures:
            key, c_id, _ = future.result()
            if key and c_id:
                concepts_map[key] = c_id
                concepts_name_map[key] = c_name
                
                # Vincular con Tema si existe
                if t_code and (t_id := topics_map.get(t_code)):
                    rel_payload = {"concept_name": c_name, "order_id": 1}
                    executor.submit(post_task, session, f"{BASE_URL}/topics/{t_id}/concepts/", rel_payload, f"Link T{t_code}->C{key}", None)

        # --- RELATIONS (Hoja separada) ---
        if "relations" in xls:
            print("⏳ Procesando Relaciones...")
            rel_futures = []
            for idx, row in xls["relations"].iterrows():
                code_from = clean_str(row["variable1"])
                code_to = clean_str(row["variable2"])
                
                source_id = concepts_map.get(code_from)
                target_name = concepts_name_map.get(code_to)

                if source_id and target_name:
                    payload = {
                        "concept_name": target_name,
                        "description_es": row.get("description_es", ""),
                        "description_en": row.get("description_en", ""),
                        "examples_es": row.get("examples_es", ""),
                        "examples_en": row.get("examples_en", ""),
                    }
                    rel_futures.append(executor.submit(post_task, session, f"{BASE_URL}/concepts/{source_id}/concepts/", payload, f"Rel {code_from}->{code_to}", None))
                else:
                    if not source_id: log_warning(f"Relación fila {idx+2}: Origen '{code_from}' no encontrado")
                    if not target_name: log_warning(f"Relación fila {idx+2}: Destino '{code_to}' no encontrado")
            
            # Limpiar cola de relaciones
            for f in as_completed(rel_futures): pass

        # --- EPIGRAPHS ---
        if "epigraphs" in xls:
            for _, row in xls["epigraphs"].iterrows():
                # CORRECCIÓN: Convertimos a dict PRIMERO, así podemos usar .pop(key, default)
                payload = row.to_dict()
                
                # Ahora extraemos el topic_code del diccionario, no de la Serie de pandas
                t_code = clean_str(payload.pop("topic_code", None))
                
                if t_id := topics_map.get(t_code):
                    executor.submit(
                        post_task, 
                        session, 
                        f"{BASE_URL}/topics/{t_id}/epigraphs/", 
                        payload, 
                        f"Epígrafe {payload.get('name_es')}", 
                        None
                    )

        # --- QUESTIONS ---
        q_futures = []
        if "questions" in xls:
            print("⏳ Procesando Preguntas...")
            for _, row in xls["questions"].iterrows():
                t_code = clean_str(row.get("topic_code"))
                c_code = clean_str(row.get("concept_code"))
                q_code = clean_str(row.get("question_code"))

                # Buscamos títulos y nombres en los DataFrames originales para no depender de llamadas API
                # Esto es más rápido que hacer GETs
                topic_title = next((r["title_es"] for _, r in xls["topics"].iterrows() if clean_str(r["topic_code"]) == t_code), None)
                concept_name = concepts_name_map.get(c_code)

                if not topic_title or not concept_name:
                    log_warning(f"Saltando Q{q_code}: Falta Tema '{t_code}' o Concepto '{c_code}'")
                    continue

                payload = row.to_dict()
                payload.update({
                    "topics_titles": [topic_title], 
                    "concepts": [concept_name], 
                    "question_code": q_code
                })
                payload.pop("topic_code", None)
                payload.pop("concept_code", None)

                f = executor.submit(post_task, session, f"{BASE_URL}/questions/", payload, f"Pregunta {q_code}", q_code)
                q_futures.append(f)

            # Recoger IDs de preguntas para las respuestas
            for f in as_completed(q_futures):
                key, q_id, _ = f.result()
                if key and q_id:
                    questions_map[key] = q_id

        # --- ANSWERS ---
        if "answers" in xls:
            print("⏳ Procesando Respuestas...")
            for _, row in xls["answers"].iterrows():
                q_code = clean_str(row.get("question_code"))
                
                if q_id := questions_map.get(q_code):
                    # FORZAMOS LA RECOGIDA EXPLÍCITA DE LOS CAMPOS
                    payload = {
                        "text_es": clean_str(row.get("text_es")),
                        "text_en": clean_str(row.get("text_en")),
                        "is_correct": str(row.get("is_correct")).lower() in ['true', '1', 'yes']
                    }
                    
                    # Validamos que no enviamos respuestas vacías
                    if not payload["text_es"] and not payload["text_en"]:
                        log_warning(f"Saltando respuesta para Q{q_code}: Texto vacío")
                        continue

                    # Fuego y olvido
                    executor.submit(post_task, session, f"{BASE_URL}/questions/{q_id}/answers/", payload, f"Rta Q{q_code}", None)
                else:
                    log_warning(f"Saltando respuesta: Pregunta Q{q_code} no encontrada (Mapa tiene {len(questions_map)} preguntas)")

        # --- STUDENT GROUPS ---
        if "student_groups" in xls:
            for _, row in xls["student_groups"].iterrows():
                s_code = clean_str(row["subject_code"])
                if s_id := subjects_map.get(s_code):
                    payload = row.to_dict()
                    payload.pop("subject_code", None)
                    executor.submit(post_task, session, f"{BASE_URL}/subjects/{s_id}/groups/", payload, f"Grupo {row['name_es']}", None)

    print("\n🏁 Proceso finalizado.")

if __name__ == "__main__":
    main()