import pandas as pd
from io import BytesIO
import traceback
from django.core.files import File
from django.db import transaction
from .models import BackupFile

# --- IMPORTA TUS MODELOS ---
from apps.content.api.models import (
    Topic, Concept, Epigraph, 
    TopicIsAboutConcept, ConceptIsRelatedToConcept
)
from apps.courses.api.models import (
    Subject, StudentGroup, SubjectIsAboutTopic
)
# HECHO: Importar QuestionRelatedToConcept
from apps.evaluation.api.models import (
    Question, Answer, QuestionBelongsToTopic, QuestionRelatedToConcept
)

# --- HELPERS ---
def clean_str(val):
    if pd.isna(val) or val == "":
        return ""
    val_str = str(val).strip()
    if val_str.endswith('.0') and val_str[:-2].isdigit():
        return val_str[:-2]
    return val_str

# ==========================================
#   GENERACIÓN (EXPORTAR BD -> EXCEL)
# ==========================================
def generate_excel_backup(is_auto=False):
    print("🔄 Iniciando generación de backup COMPLETO...")
    try:
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            
            # 1. SUBJECTS
            print("   - Exportando Subjects...")
            qs_sub = Subject.objects.all().values(
                'id', 'name_es', 'name_en', 'description_es', 'description_en'
            )
            df_sub = pd.DataFrame(list(qs_sub))
            if not df_sub.empty:
                df_sub.rename(columns={'id': 'subject_code'}, inplace=True)
                df_sub.to_excel(writer, sheet_name='subjects', index=False)
            else:
                pd.DataFrame(columns=['subject_code', 'name_es', 'name_en', 'description_es', 'description_en']).to_excel(writer, sheet_name='subjects', index=False)

            # 2. TOPICS
            print("   - Exportando Topics...")
            try:
                qs_top = Topic.objects.all().values(
                    'id', 'subjects__id', 
                    'title_es', 'title_en', 'description_es', 'description_en'
                )
            except:
                qs_top = Topic.objects.all().values('id', 'subjects__id', 'title_es')

            df_top = pd.DataFrame(list(qs_top))
            if not df_top.empty:
                df_top.rename(columns={'id': 'topic_code', 'subjects__id': 'subject_code'}, inplace=True)
                df_top['order_id'] = 1 
                df_top.to_excel(writer, sheet_name='topics', index=False)
            else:
                pd.DataFrame(columns=['topic_code', 'subject_code', 'title_es', 'title_en', 'description_es', 'description_en', 'order_id']).to_excel(writer, sheet_name='topics', index=False)

            # 3. CONCEPTS
            print("   - Exportando Concepts...")
            qs_con = Concept.objects.all().values(
                'id', 'name_es', 'name_en', 
                'description_es', 'description_en',
                'examples_es', 'examples_en',
                'topics__id'
            )
            df_con = pd.DataFrame(list(qs_con))
            if not df_con.empty:
                df_con.rename(columns={'id': 'concept_code', 'topics__id': 'related_topic_code'}, inplace=True)
                df_con.to_excel(writer, sheet_name='concepts', index=False)
            else:
                pd.DataFrame(columns=['concept_code', 'name_es', 'name_en', 'description_es', 'description_en', 'examples_es', 'examples_en', 'related_topic_code']).to_excel(writer, sheet_name='concepts', index=False)

            # 4. RELATIONS
            print("   - Exportando Relaciones...")
            try:
                relations = []
                for rel in ConceptIsRelatedToConcept.objects.all():
                    relations.append({
                        'variable1': rel.concept_from_id,
                        'variable2': rel.concept_to_id,
                        'description_es': rel.description_es,
                        'description_en': rel.description_en,
                    })
                df_rel = pd.DataFrame(relations)
                if not df_rel.empty:
                    df_rel.to_excel(writer, sheet_name='relations', index=False)
                else:
                    pd.DataFrame(columns=['variable1', 'variable2', 'description_es', 'description_en']).to_excel(writer, sheet_name='relations', index=False)
            except Exception:
                pd.DataFrame(columns=['variable1', 'variable2', 'description_es', 'description_en']).to_excel(writer, sheet_name='relations', index=False)

            # 5. EPIGRAPHS
            print("   - Exportando Epígrafes...")
            qs_epi = Epigraph.objects.all().values(
                'id', 'topic__id', 'name_es', 'name_en', 
                'description_es', 'description_en', 'order_id'
            )
            df_epi = pd.DataFrame(list(qs_epi))
            if not df_epi.empty:
                df_epi.rename(columns={'id': 'epigraph_code', 'topic__id': 'topic_code'}, inplace=True)
                df_epi.to_excel(writer, sheet_name='epigraphs', index=False)
            else:
                pd.DataFrame(columns=['epigraph_code', 'topic_code', 'name_es', 'name_en', 'description_es', 'description_en', 'order_id']).to_excel(writer, sheet_name='epigraphs', index=False)

            # 6. QUESTIONS
            print("   - Exportando Questions...")
            qs_quest = Question.objects.all().values('id', 'statement_es', 'statement_en', 'topics__id', 'concepts__id')
            df_quest = pd.DataFrame(list(qs_quest))
            if not df_quest.empty:
                df_quest.rename(columns={'id': 'question_code', 'topics__id': 'topic_code', 'concepts__id': 'concept_code'}, inplace=True)
                df_quest.to_excel(writer, sheet_name='questions', index=False)
            else:
                pd.DataFrame(columns=['question_code', 'statement_es', 'topic_code', 'concept_code']).to_excel(writer, sheet_name='questions', index=False)

            # 7. ANSWERS
            print("   - Exportando Answers...")
            qs_ans = Answer.objects.all().values('text_es', 'text_en', 'is_correct', 'question__id')
            df_ans = pd.DataFrame(list(qs_ans))
            if not df_ans.empty:
                df_ans.rename(columns={'question__id': 'question_code'}, inplace=True)
                df_ans.to_excel(writer, sheet_name='answers', index=False)
            else:
                pd.DataFrame(columns=['question_code', 'text_es', 'is_correct']).to_excel(writer, sheet_name='answers', index=False)

            # 8. STUDENT GROUPS
            print("   - Exportando Student Groups...")
            try:
                qs_grp = StudentGroup.objects.all().values('id', 'name_es', 'name_en', 'subject__id')
                df_grp = pd.DataFrame(list(qs_grp))
                if not df_grp.empty:
                    df_grp.rename(columns={'id': 'group_code', 'subject__id': 'subject_code'}, inplace=True)
                    df_grp.to_excel(writer, sheet_name='student_groups', index=False)
                else:
                    pd.DataFrame(columns=['group_code', 'name_es', 'name_en', 'subject_code']).to_excel(writer, sheet_name='student_groups', index=False)
            except Exception:
                pd.DataFrame(columns=['group_code', 'name_es', 'name_en', 'subject_code']).to_excel(writer, sheet_name='student_groups', index=False)

        output.seek(0)
        print("💾 Guardando archivo...")
        filename = f"backup_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        backup_obj = BackupFile(is_auto_generated=is_auto)
        backup_obj.file.save(filename, File(output))
        backup_obj.save()
        
        print(f"✅ Backup creado: {filename}")
        return backup_obj

    except Exception as e:
        print("\n❌❌ ERROR CRÍTICO EN GENERATE_BACKUP ❌❌")
        traceback.print_exc()
        raise e


# ==========================================
#   RESTAURACIÓN (IMPORTAR EXCEL -> BD)
# ==========================================
def restore_excel_backup(backup_id):
    try:
        backup = BackupFile.objects.get(id=backup_id)
    except BackupFile.DoesNotExist:
        raise Exception("Backup no encontrado")

    file_path = backup.file.path
    try:
        xls = {name: df.fillna("") for name, df in pd.read_excel(file_path, sheet_name=None).items()}
    except Exception as e:
        raise Exception(f"Error leyendo archivo Excel: {str(e)}")

    with transaction.atomic():
        print("⚠️ Iniciando restauración. Borrando datos actuales...")
        
        # 1. FLUSH DE DATOS (IMPORTANTE: Borrar intermedias primero)
        SubjectIsAboutTopic.objects.all().delete()
        TopicIsAboutConcept.objects.all().delete()
        ConceptIsRelatedToConcept.objects.all().delete()
        # HECHO: Borrar QuestionRelatedToConcept
        try:
            QuestionBelongsToTopic.objects.all().delete()
            QuestionRelatedToConcept.objects.all().delete() # AÑADIDO
        except:
            pass

        Answer.objects.all().delete()
        Question.objects.all().delete()
        Epigraph.objects.all().delete()
        StudentGroup.objects.all().delete()
        Concept.objects.all().delete()
        Topic.objects.all().delete()
        Subject.objects.all().delete()
        
        print("✅ Datos borrados. Iniciando importación...")

        subjects_map = {} 
        topics_map = {}   
        concepts_map = {} 
        concepts_name_map = {} 
        questions_map = {} 

        # --- 2. SUBJECTS ---
        if "subjects" in xls:
            for _, row in xls["subjects"].iterrows():
                payload = row.to_dict()
                s_code = clean_str(payload.pop("subject_code", None))
                if 'title_es' in payload: payload['name_es'] = payload.pop('title_es')
                if 'title_en' in payload: payload['name_en'] = payload.pop('title_en')

                valid_fields = {f.name for f in Subject._meta.get_fields()}
                clean_payload = {k: v for k, v in payload.items() if k in valid_fields}
                obj = Subject.objects.create(**clean_payload)
                subjects_map[s_code] = obj 

        # --- 3. TOPICS ---
        if "topics" in xls:
            for _, row in xls["topics"].iterrows():
                payload = row.to_dict()
                t_code = clean_str(payload.pop("topic_code", None))
                s_code = clean_str(payload.pop("subject_code", None))
                if 'name_es' in payload: payload['title_es'] = payload.pop('name_es')
                if 'name_en' in payload: payload['title_en'] = payload.pop('name_en')
                
                # OJO: Leer order_id para SubjectIsAboutTopic
                order_id = int(clean_str(row.get('order_id')) or 1) 
                
                subject_obj = subjects_map.get(s_code)
                valid_fields = {f.name for f in Topic._meta.get_fields()}
                clean_payload = {k: v for k, v in payload.items() if k in valid_fields}

                obj = Topic.objects.create(**clean_payload)
                topics_map[t_code] = obj
                
                # CORRECCIÓN: Usar order_id al crear SubjectIsAboutTopic
                if subject_obj:
                    SubjectIsAboutTopic.objects.create(subject=subject_obj, topic=obj, order_id=order_id)

        # --- 4. CONCEPTS ---
        if "concepts" in xls:
            for _, row in xls["concepts"].iterrows():
                payload = row.to_dict()
                c_code = clean_str(payload.pop("concept_code", None))
                t_code = clean_str(payload.pop("related_topic_code", None))
                topic_obj = topics_map.get(t_code)
                valid_fields = {f.name for f in Concept._meta.get_fields()}
                clean_payload = {k: v for k, v in payload.items() if k in valid_fields}

                obj = Concept.objects.create(**clean_payload)
                concepts_map[c_code] = obj
                if 'name_es' in clean_payload:
                    concepts_name_map[clean_payload['name_es']] = obj

                # CORRECCIÓN: Tabla intermedia Topic-Concept
                if topic_obj:
                    TopicIsAboutConcept.objects.create(topic=topic_obj, concept=obj, order_id=1)

        # --- 5. RELATIONS ---
        if "relations" in xls:
            for _, row in xls["relations"].iterrows():
                code_from = clean_str(row.get("variable1"))
                code_to = clean_str(row.get("variable2"))
                source_obj = concepts_map.get(code_from)
                target_obj = concepts_map.get(code_to) 
                if not target_obj: target_obj = concepts_name_map.get(code_to)

                if source_obj and target_obj:
                    # CORRECCIÓN: Tabla intermedia Concept-Relation
                    ConceptIsRelatedToConcept.objects.create(
                        concept_from=source_obj, concept_to=target_obj,
                        description_es=row.get('description_es', ''),
                        description_en=row.get('description_en', '')
                    )

        # --- 6. EPIGRAPHS ---
        if "epigraphs" in xls:
            for _, row in xls["epigraphs"].iterrows():
                payload = row.to_dict()
                payload.pop("epigraph_code", None)
                t_code = clean_str(payload.pop("topic_code", None))
                topic_obj = topics_map.get(t_code)
                if 'content_es' in payload: payload['description_es'] = payload.pop('content_es')
                if 'content_en' in payload: payload['description_en'] = payload.pop('content_en')

                valid_fields = {f.name for f in Epigraph._meta.get_fields()}
                clean_payload = {k: v for k, v in payload.items() if k in valid_fields}
                
                if topic_obj:
                    Epigraph.objects.create(topic=topic_obj, **clean_payload)

        # --- 7. QUESTIONS ---
        if "questions" in xls:
            for _, row in xls["questions"].iterrows():
                payload = row.to_dict()
                q_code = clean_str(payload.pop("question_code", None))
                t_code = clean_str(payload.pop("topic_code", None))
                c_code = clean_str(payload.pop("concept_code", None))
                
                valid_fields = {f.name for f in Question._meta.get_fields()}
                clean_payload = {k: v for k, v in payload.items() if k in valid_fields}
                
                q_obj = Question.objects.create(**clean_payload)
                questions_map[q_code] = q_obj
                
                # CORRECCIÓN: Tabla intermedia Question-Topic
                if t_obj := topics_map.get(t_code):
                    QuestionBelongsToTopic.objects.create(question=q_obj, topic=t_obj)
                
                # HECHO: Reemplazar q_obj.concepts.add(c_obj) por la tabla intermedia
                if c_obj := concepts_map.get(c_code):
                    QuestionRelatedToConcept.objects.create(question=q_obj, concept=c_obj)

        # --- 8. ANSWERS ---
        if "answers" in xls:
            for _, row in xls["answers"].iterrows():
                payload = row.to_dict()
                q_code = clean_str(payload.pop("question_code", None))
                is_correct = str(payload.get("is_correct")).lower() in ['true', '1', 'yes']
                payload['is_correct'] = is_correct
                q_obj = questions_map.get(q_code)
                if q_obj:
                    Answer.objects.create(question=q_obj, **payload)

        # --- 9. STUDENT GROUPS ---
        if "student_groups" in xls:
            for _, row in xls["student_groups"].iterrows():
                payload = row.to_dict()
                payload.pop("group_code", None)
                s_code = clean_str(payload.pop("subject_code", None))
                subject_obj = subjects_map.get(s_code)
                valid_fields = {f.name for f in StudentGroup._meta.get_fields()}
                clean_payload = {k: v for k, v in payload.items() if k in valid_fields}
                if subject_obj: clean_payload['subject'] = subject_obj
                obj = StudentGroup.objects.create(**clean_payload)

        print("🏁 Restauración completada exitosamente.")