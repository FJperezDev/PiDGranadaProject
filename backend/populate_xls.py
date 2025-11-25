import pandas as pd
import requests
import json
import sys

# --- CONFIGURACIÓN ---
BASE_URL = "http://127.0.0.1:8000"
TEACHER_EMAIL = "admin@admin.com"
TEACHER_PASSWORD = "admin123"
EXCEL_FILE = "Prueba.xlsx"

def print_status(response, action):
    if 200 <= response.status_code < 300:
        print(f"✅ {action} (status {response.status_code})")
        try:
            return response.json()
        except json.JSONDecodeError:
            return None
    else:
        print(f"❌ {action} FAILED (status {response.status_code})")
        print(f"   Response: {response.text}")
        return None

def authenticate():
    url = f"{BASE_URL}/login/"
    payload = {"email": TEACHER_EMAIL, "password": TEACHER_PASSWORD}
    r = requests.post(url, json=payload)
    data = print_status(r, "Autenticando profesor")
    if not data or "access" not in data:
        sys.exit("🛑 Error de autenticación")
    return {"Authorization": f"Bearer {data['access']}"}

def main():
    headers = authenticate()

    # Leer las hojas
    xls = {name: df.fillna("") for name, df in pd.read_excel(EXCEL_FILE, sheet_name=None).items()}

    # --- SUBJECTS ---
    subjects_map = {}
    for _, row in xls["subjects"].iterrows():
        payload = row.to_dict()
        r = requests.post(f"{BASE_URL}/subjects/", headers=headers, json=payload)
        resp = print_status(r, f"Creando asignatura {row['name_es']}")
        if resp:
            subjects_map[row["subject_code"]] = resp["id"]

    # --- TOPICS ---
    topics_map = {}
    for _, row in xls["topics"].iterrows():
        payload = row.to_dict()
        subject_id = subjects_map.get(row["subject_code"])
        payload.pop("subject_code")
        r = requests.post(f"{BASE_URL}/topics/", headers=headers, json=payload)
        resp = print_status(r, f"Creando tema {row['title_es']}")
        if resp:
            topics_map[row["topic_code"]] = resp["id"]
            # Vincular a la asignatura
            requests.post(f"{BASE_URL}/subjects/{subject_id}/topics/", headers=headers,
                          json={"topic_name": row["title_es"], "order_id": row["order_id"]})

    # --- CONCEPTS ---
    concepts_map = {}       # Mapa: Código -> ID (para la URL del origen)
    concepts_name_map = {}  # Mapa: Código -> Nombre (para el body de la petición destino)
    pending_concept_links = [] # Lista de tuplas: (id_origen, string_codigos_destino)

    print("📘 topics_map generado:", topics_map)
    for _, row in xls["concepts"].iterrows():
        payload = row.to_dict()
        topic_code = payload.pop("related_topic_code", None)
        related_codes_str = payload.pop("related_concept_codes", None) # Columna (C002, C003)
    
        r = requests.post(f"{BASE_URL}/concepts/", headers=headers, json=payload)
        resp = print_status(r, f"Creando concepto {row['name_es']}")
        
        if resp:
            current_id = resp["id"]
            current_code = str(row["concept_code"]).strip()
            current_name = row["name_es"]

            concepts_map[current_code] = current_id
            concepts_name_map[current_code] = current_name

            if topic_code:
                topic_id = topics_map.get(topic_code)
                if topic_id:
                    requests.post(f"{BASE_URL}/topics/{topic_id}/concepts/",
                                  headers=headers, json={"concept_name": current_name, "order_id": 1})

            if related_codes_str:
                pending_concept_links.append({
                    "source_id": current_id,
                    "target_codes": related_codes_str
                })
    
    for item in pending_concept_links:
        source_id = item["source_id"]
        raw_targets = str(item["target_codes"])
        target_codes = [code.strip() for code in raw_targets.split(",") if code.strip()]
        
        for t_code in target_codes:

            target_name = concepts_name_map.get(t_code)
            
            if target_name:
                payload_link = {"concept_name": target_name}
                r = requests.post(f"{BASE_URL}/concepts/{source_id}/concepts/", headers=headers, json=payload_link)
                
                if r.status_code >= 300:
                    print(f"   ⚠️ Falló al vincular {source_id} con {t_code} ({target_name})")
            else:
                print(f"   ⚠️ No se encontró el concepto con código {t_code} para vincular.")

    # --- EPIGRAPHS ---
    for _, row in xls["epigraphs"].iterrows():
        payload = row.to_dict()
        topic_id = topics_map[row["topic_code"]]
        payload.pop("topic_code")
        r = requests.post(f"{BASE_URL}/topics/{topic_id}/epigraphs/", headers=headers, json=payload)
        print_status(r, f"Creando epígrafe {row['name_es']}")

    # --- QUESTIONS ---
    questions_map = {}
    if "questions" in xls:
        print("\n❓ Procesando preguntas...")
        for index, row in xls["questions"].iterrows():
            # 1. Obtenemos los códigos y los limpiamos (quitamos espacios y .0)
            t_code = str(row.get("topic_code", "")).strip().replace(".0", "")
            c_code = str(row.get("concept_code", "")).strip().replace(".0", "")

            # Si la fila está vacía (Excel a veces deja basura al final), saltamos
            if not t_code or t_code == "nan": 
                continue

            # 2. BÚSQUEDA ROBUSTA (Convirtiendo todo a string para comparar)
            # Buscamos en la hoja 'topics' donde la columna 'topic_code' (como string) coincida
            topic_match = xls["topics"].loc[
                xls["topics"]["topic_code"].astype(str).str.strip().str.replace(".0", "") == t_code, 
                "title_es"
            ]

            # Buscamos en la hoja 'concepts'
            concept_match = xls["concepts"].loc[
                xls["concepts"]["concept_code"].astype(str).str.strip().str.replace(".0", "") == c_code, 
                "name_es"
            ]

            # 3. VALIDACIÓN: Si no existe, AVISAR en lugar de ROMPERSE
            if topic_match.empty:
                print(f"   ⚠️ SALTA Fila {index+2}: El topic_code '{t_code}' no existe en la hoja 'topics'.")
                continue # <--- Esto evita el crash
            
            if concept_match.empty:
                print(f"   ⚠️ SALTA Fila {index+2}: El concept_code '{c_code}' no existe en la hoja 'concepts'.")
                continue # <--- Esto evita el crash

            # 4. Si llegamos aquí, es seguro extraer los datos
            topic_title = topic_match.iloc[0]
            concept_name = concept_match.iloc[0]

            payload = row.to_dict()
            payload["topics_titles"] = [topic_title]
            payload["concepts"] = [concept_name]
            
            # Limpiamos campos internos del excel
            if "topic_code" in payload: payload.pop("topic_code")
            if "concept_code" in payload: payload.pop("concept_code")
            
            # Enviar al backend
            r = requests.post(f"{BASE_URL}/questions/", headers=headers, json=payload)
            
            # Log visual corto
            statement = str(row.get('statement_es', 'Sin enunciado'))[:30]
            resp = print_status(r, f"Pregunta: {statement}...")
            
            if resp and "id" in resp:
                questions_map[row["question_code"]] = resp["id"]

    # --- ANSWERS ---
    if "answers" in xls:
        print("\n📝 Procesando respuestas...")
        for index, row in xls["answers"].iterrows():
            q_code = row.get("question_code")
            
            # VALIDACIÓN DEFENSIVA: Verificamos si la pregunta padre existe
            if q_code in questions_map:
                qid = questions_map[q_code]
                
                payload = row.to_dict()
                if "question_code" in payload: payload.pop("question_code")
                
                r = requests.post(f"{BASE_URL}/questions/{qid}/answers/", headers=headers, json=payload)
                
                # Log corto
                texto_rta = str(row.get('text_es', 'Sin texto'))[:20]
                print_status(r, f"Rta '{texto_rta}' para Q{q_code}")
            else:
                # Si la pregunta no se creó (por error o salto), avisamos pero NO ROMPEMOS
                print(f"   ⚠️ SALTA Rta Fila {index+2}: Pregunta padre '{q_code}' no existe (no se creó previamente).")
        print_status(r, f"Creando respuesta {row['text_es']}")

    # --- STUDENT GROUPS ---
    for _, row in xls["student_groups"].iterrows():
        subject_id = subjects_map[row["subject_code"]]
        payload = row.to_dict()
        payload.pop("subject_code")
        r = requests.post(f"{BASE_URL}/subjects/{subject_id}/groups/", headers=headers, json=payload)
        print_status(r, f"Creando grupo {row['name_es']}")

    # print("\n🎉 ¡Base de datos poblada exitosamente desde Excel!")

if __name__ == "__main__":
    main()
