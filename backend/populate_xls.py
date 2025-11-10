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
    concepts_map = {}
    print("📘 topics_map generado:", topics_map)
    for _, row in xls["concepts"].iterrows():
        payload = row.to_dict()
        topic_code = payload.pop("related_topic_code", None)
        r = requests.post(f"{BASE_URL}/concepts/", headers=headers, json=payload)
        resp = print_status(r, f"Creando concepto {row['name_es']}")
        if resp:
            concepts_map[row["concept_code"]] = resp["id"]
            if topic_code:
                topic_id = topics_map.get(topic_code)
                requests.post(f"{BASE_URL}/topics/{topic_id}/concepts/",
                              headers=headers, json={"concept_name": row["name_es"], "order_id": 1})

    # --- EPIGRAPHS ---
    for _, row in xls["epigraphs"].iterrows():
        payload = row.to_dict()
        topic_id = topics_map[row["topic_code"]]
        payload.pop("topic_code")
        r = requests.post(f"{BASE_URL}/topics/{topic_id}/epigraphs/", headers=headers, json=payload)
        print_status(r, f"Creando epígrafe {row['name_es']}")

    # --- QUESTIONS ---
    questions_map = {}
    for _, row in xls["questions"].iterrows():
        payload = row.to_dict()
        topic_title = xls["topics"].loc[xls["topics"]["topic_code"] == row["topic_code"], "title_es"].iloc[0]
        concept_name = xls["concepts"].loc[xls["concepts"]["concept_code"] == row["concept_code"], "name_es"].iloc[0]
        payload["topics_titles"] = [topic_title]
        payload["concepts_names"] = [concept_name]
        payload.pop("topic_code")
        payload.pop("concept_code")
        r = requests.post(f"{BASE_URL}/questions/", headers=headers, json=payload)
        resp = print_status(r, f"Creando pregunta: {row['statement_es'][:40]}...")
        if resp:
            questions_map[row["question_code"]] = resp["id"]

    # --- ANSWERS ---
    for _, row in xls["answers"].iterrows():
        qid = questions_map[row["question_code"]]
        payload = row.to_dict()
        payload.pop("question_code")
        r = requests.post(f"{BASE_URL}/questions/{qid}/answers/", headers=headers, json=payload)
        print_status(r, f"Creando respuesta {row['text_es']}")

    # --- STUDENT GROUPS ---
    for _, row in xls["student_groups"].iterrows():
        subject_id = subjects_map[row["subject_code"]]
        payload = row.to_dict()
        payload.pop("subject_code")
        r = requests.post(f"{BASE_URL}/subjects/{subject_id}/groups/", headers=headers, json=payload)
        print_status(r, f"Creando grupo {row['name_es']}")

    print("\n🎉 ¡Base de datos poblada exitosamente desde Excel!")

if __name__ == "__main__":
    main()
