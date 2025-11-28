import pandas as pd
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"
TEACHER_EMAIL = "admin@admin.com"
TEACHER_PASSWORD = "admin123"
EXCEL_FILE = "Prueba.xlsx"

def clean_str(val):
    if pd.isna(val) or val == "":
        return ""
    return str(val).replace(".0", "").strip()

def print_status(response, action):
    if 200 <= response.status_code < 300:
        print(f"✅ {action}")
        try:
            return response.json()
        except json.JSONDecodeError:
            return None
    else:
        print(f"❌ {action} FAILED ({response.status_code})")
        return None

def authenticate():
    r = requests.post(f"{BASE_URL}/login/", json={"email": TEACHER_EMAIL, "password": TEACHER_PASSWORD})
    data = print_status(r, "Autenticando")
    if not data or "access" not in data:
        sys.exit("🛑 Error de autenticación")
    return {"Authorization": f"Bearer {data['access']}"}

def main():
    headers = authenticate()
    xls = {name: df.fillna("") for name, df in pd.read_excel(EXCEL_FILE, sheet_name=None).items()}

    # SUBJECTS
    subjects_map = {}
    for _, row in xls["subjects"].iterrows():
        payload = row.to_dict()
        s_code = clean_str(row["subject_code"])
        payload["subject_code"] = s_code
        
        resp = print_status(requests.post(f"{BASE_URL}/subjects/", headers=headers, json=payload), f"Asignatura {s_code}")
        if resp:
            subjects_map[s_code] = resp["id"]

    # TOPICS
    topics_map = {}
    for _, row in xls["topics"].iterrows():
        payload = row.to_dict()
        t_code = clean_str(row["topic_code"])
        s_code = clean_str(row["subject_code"])
        
        subject_id = subjects_map.get(s_code)
        payload["topic_code"] = t_code
        payload.pop("subject_code", None)

        resp = print_status(requests.post(f"{BASE_URL}/topics/", headers=headers, json=payload), f"Tema {t_code}")
        if resp:
            topics_map[t_code] = resp["id"]
            if subject_id:
                requests.post(f"{BASE_URL}/subjects/{subject_id}/topics/", headers=headers,
                              json={"topic_name": row["title_es"], "order_id": row["order_id"]})

    # CONCEPTS
    concepts_map = {}
    concepts_name_map = {}
    pending_links = []

    for _, row in xls["concepts"].iterrows():
        payload = row.to_dict()
        c_code = clean_str(row["concept_code"])
        t_code = clean_str(payload.pop("related_topic_code", None))
        related_str = str(payload.pop("related_concept_codes", ""))
        
        payload["concept_code"] = c_code
        resp = print_status(requests.post(f"{BASE_URL}/concepts/", headers=headers, json=payload), f"Concepto {c_code}")
        
        if resp:
            c_id = resp["id"]
            concepts_map[c_code] = c_id
            concepts_name_map[c_code] = row["name_es"]

            if t_code and (t_id := topics_map.get(t_code)):
                requests.post(f"{BASE_URL}/topics/{t_id}/concepts/", headers=headers, 
                              json={"concept_name": row["name_es"], "order_id": 1})

    for item in pending_links:
        targets = [clean_str(x) for x in item["targets"].split(",") if clean_str(x)]
        for t_code in targets:
            if t_name := concepts_name_map.get(t_code):
                requests.post(f"{BASE_URL}/concepts/{item['source_id']}/concepts/", headers=headers, json={"concept_name": t_name})

    # --- RELATIONS (NUEVO BLOQUE) ---
    # Procesamos la hoja separada 'relations'
    if "relations" in xls:
        print("\n🔗 Procesando Relaciones (Tabla 'relations')...")
        for index, row in xls["relations"].iterrows():
            # 1. Obtenemos los códigos origen (variable1) y destino (variable2)
            code_from = clean_str(row["variable1"])
            code_to = clean_str(row["variable2"])

            # 2. Buscamos los datos necesarios en los mapas creados anteriormente
            source_id = concepts_map.get(code_from)      # ID para la URL
            target_name = concepts_name_map.get(code_to) # Nombre para el body (según tu API)

            if source_id and target_name:
                # 3. Construimos el payload con las descripciones
                payload_link = {
                    "concept_name": target_name,
                    "description_es": row.get("description_es", ""),
                    "description_en": row.get("description_en", ""),
                    "examples_es": row.get("examples_es", ""),
                    "examples_en": row.get("examples_en", ""),
                }
                
                # 4. Hacemos la petición
                r = requests.post(f"{BASE_URL}/concepts/{source_id}/concepts/", headers=headers, json=payload_link)
                
                if r.status_code >= 300:
                    print(f"   ⚠️ Falló al vincular {code_from} -> {code_to}")
                else:
                    print_status(r, f"Link {code_from} -> {code_to}")
            else:
                if not source_id:
                    print(f"   ⚠️ Fila {index+2}: Concepto Origen '{code_from}' no existe.")
                if not target_name:
                    print(f"   ⚠️ Fila {index+2}: Concepto Destino '{code_to}' no existe.")

    # EPIGRAPHS
    for _, row in xls["epigraphs"].iterrows():
        payload = row.to_dict()
        t_code = clean_str(payload.pop("topic_code", None))
        
        if t_id := topics_map.get(t_code):
            print_status(requests.post(f"{BASE_URL}/topics/{t_id}/epigraphs/", headers=headers, json=payload), f"Epígrafe {row.get('name_es')}")

    # QUESTIONS
    questions_map = {}
    if "questions" in xls:
        for _, row in xls["questions"].iterrows():
            t_code = clean_str(row.get("topic_code"))
            c_code = clean_str(row.get("concept_code"))
            q_code = clean_str(row.get("question_code"))

            if not t_code: continue

            # Búsqueda compacta
            topic_title = next((r["title_es"] for _, r in xls["topics"].iterrows() if clean_str(r["topic_code"]) == t_code), None)
            concept_name = next((r["name_es"] for _, r in xls["concepts"].iterrows() if clean_str(r["concept_code"]) == c_code), None)

            if not topic_title or not concept_name:
                print(f"⚠️ Saltando Q{q_code}: Datos faltantes")
                continue

            payload = row.to_dict()
            payload.update({"topics_titles": [topic_title], "concepts": [concept_name], "question_code": q_code})
            payload.pop("topic_code", None)
            payload.pop("concept_code", None)

            resp = print_status(requests.post(f"{BASE_URL}/questions/", headers=headers, json=payload), f"Pregunta {q_code}")
            if resp:
                questions_map[q_code] = resp["id"]

    # ANSWERS
    if "answers" in xls:
        for _, row in xls["answers"].iterrows():
            q_code = clean_str(row.get("question_code"))
            if q_id := questions_map.get(q_code):
                payload = row.to_dict()
                payload.pop("question_code", None)
                if "is_correct" in payload:
                    payload["is_correct"] = str(payload["is_correct"]).lower() in ['true', '1', 'yes']
                
                print_status(requests.post(f"{BASE_URL}/questions/{q_id}/answers/", headers=headers, json=payload), f"Rta para Q{q_code}")

    # STUDENT GROUPS
    for _, row in xls["student_groups"].iterrows():
        s_code = clean_str(row["subject_code"])
        if s_id := subjects_map.get(s_code):
            payload = row.to_dict()
            payload.pop("subject_code", None)
            print_status(requests.post(f"{BASE_URL}/subjects/{s_id}/groups/", headers=headers, json=payload), f"Grupo {row['name_es']}")

if __name__ == "__main__":
    main()