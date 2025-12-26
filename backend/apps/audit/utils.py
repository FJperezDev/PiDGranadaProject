import pandas as pd
from io import BytesIO
import traceback
from django.core.files import File
from django.db import transaction
from django.db.models import Q
from .models import BackupFile

# --- IMPORTA TUS MODELOS ---
from apps.content.api.models import (
    Topic, Concept, Epigraph, 
    TopicIsAboutConcept, ConceptIsRelatedToConcept
)
from apps.courses.api.models import (
    Subject, StudentGroup, SubjectIsAboutTopic 
)
from apps.evaluation.api.models import (
    Question, Answer, QuestionBelongsToTopic, QuestionRelatedToConcept,
    QuestionEvaluationGroup  # <--- IMPORTANTE: Asegúrate de importar esto
)
from apps.customauth.models import CustomTeacher as Teacher 

from apps.courses.utils import generate_groupCode

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
    print("🔄 Iniciando generación de backup COMPLETO (+Analytics)...")
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
            qs_top = Topic.objects.all().values(
                'id', 'title_es', 'title_en', 'description_es', 'description_en'
            )
            df_top = pd.DataFrame(list(qs_top))
            if not df_top.empty:
                df_top.rename(columns={'id': 'topic_code'}, inplace=True)
                df_top.to_excel(writer, sheet_name='topics', index=False)
            else:
                pd.DataFrame(columns=['topic_code', 'title_es', 'title_en', 'description_es', 'description_en']).to_excel(writer, sheet_name='topics', index=False)

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

            # 4. RELATIONS (Conceptos Relacionados)
            print("   - Exportando Relaciones Concepto-Concepto...")
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
                
            # 5. RELACIÓN SUBJECT-TOPIC
            print("   - Exportando Subject-Topics (Vínculos)...")
            qs_sub_top = SubjectIsAboutTopic.objects.all().values(
                'subject__id', 
                'topic__id', 
                'order_id'
            )
            df_sub_top = pd.DataFrame(list(qs_sub_top))
            if not df_sub_top.empty:
                df_sub_top.rename(columns={
                    'subject__id': 'subject_code', 
                    'topic__id': 'topic_code'
                }, inplace=True)
                df_sub_top.to_excel(writer, sheet_name='subject_topics', index=False)
            else:
                pd.DataFrame(columns=['subject_code', 'topic_code', 'order_id']).to_excel(writer, sheet_name='subject_topics', index=False)

            # 6. EPIGRAPHS
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

            # 7. QUESTIONS
            print("   - Exportando Questions...")
            qs_quest = Question.objects.all().values('id', 'statement_es', 'statement_en')
            df_quest = pd.DataFrame(list(qs_quest))
            if not df_quest.empty:
                df_quest.rename(columns={'id': 'question_code'}, inplace=True)
                df_quest.to_excel(writer, sheet_name='questions', index=False)
            else:
                pd.DataFrame(columns=['question_code', 'statement_es']).to_excel(writer, sheet_name='questions', index=False)

            # 8. RELACIONES QUESTION-TOPIC y QUESTION-CONCEPT
            print("   - Exportando Vínculos Question-Topic/Concept...")
            
            # Question-Topic
            qs_q_top = QuestionBelongsToTopic.objects.all().values(
                'question__id', 'topic__id'
            )
            df_q_top = pd.DataFrame(list(qs_q_top))
            if not df_q_top.empty:
                df_q_top.rename(columns={'question__id': 'question_code', 'topic__id': 'topic_code'}, inplace=True)
                df_q_top.to_excel(writer, sheet_name='question_topics', index=False)
            else:
                pd.DataFrame(columns=['question_code', 'topic_code']).to_excel(writer, sheet_name='question_topics', index=False)
                
            # Question-Concept
            qs_q_con = QuestionRelatedToConcept.objects.all().values(
                'question__id', 'concept__id'
            )
            df_q_con = pd.DataFrame(list(qs_q_con))
            if not df_q_con.empty:
                df_q_con.rename(columns={'question__id': 'question_code', 'concept__id': 'concept_code'}, inplace=True)
                df_q_con.to_excel(writer, sheet_name='question_concepts', index=False)
            else:
                pd.DataFrame(columns=['question_code', 'concept_code']).to_excel(writer, sheet_name='question_concepts', index=False)

            # 9. ANSWERS
            print("   - Exportando Answers...")
            qs_ans = Answer.objects.all().values('text_es', 'text_en', 'is_correct', 'question__id')
            df_ans = pd.DataFrame(list(qs_ans))
            if not df_ans.empty:
                df_ans.rename(columns={'question__id': 'question_code'}, inplace=True)
                df_ans.to_excel(writer, sheet_name='answers', index=False)
            else:
                pd.DataFrame(columns=['question_code', 'text_es', 'is_correct']).to_excel(writer, sheet_name='answers', index=False)

            # 10. STUDENT GROUPS
            print("   - Exportando Student Groups...")
            qs_grp = StudentGroup.objects.all().values(
                'id', 'name_es', 'name_en', 'groupCode',
                'subject__id', 
                'teacher__email'
            )
            df_grp = pd.DataFrame(list(qs_grp))
            if not df_grp.empty:
                df_grp.rename(columns={
                    'id': 'group_code', 
                    'groupCode': 'groupCode',
                    'subject__id': 'subject_code',
                    'teacher__email': 'teacher_email'
                }, inplace=True)
                df_grp.to_excel(writer, sheet_name='student_groups', index=False)
            else:
                pd.DataFrame(columns=['group_code', 'name_es', 'name_en', 'groupCode', 'subject_code', 'teacher_email']).to_excel(writer, sheet_name='student_groups', index=False)

            # 11. QUESTION EVALUATION GROUPS (ANALYTICS) - NUEVO
            print("   - Exportando Analytics (QuestionEvaluationGroup)...")
            qs_eval = QuestionEvaluationGroup.objects.all().values(
                'group__id',
                'question__id',
                'ev_count',
                'correct_count'
            )
            df_eval = pd.DataFrame(list(qs_eval))
            if not df_eval.empty:
                df_eval.rename(columns={
                    'group__id': 'group_code',
                    'question__id': 'question_code'
                }, inplace=True)
                df_eval.to_excel(writer, sheet_name='analytics', index=False)
            else:
                pd.DataFrame(columns=['group_code', 'question_code', 'ev_count', 'correct_count']).to_excel(writer, sheet_name='analytics', index=False)


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
        # Borramos las evaluaciones primero porque dependen de StudentGroup y Question
        QuestionEvaluationGroup.objects.all().delete()
        
        SubjectIsAboutTopic.objects.all().delete()
        TopicIsAboutConcept.objects.all().delete()
        ConceptIsRelatedToConcept.objects.all().delete()
        try:
            QuestionBelongsToTopic.objects.all().delete()
            QuestionRelatedToConcept.objects.all().delete() 
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
        groups_map = {} # NUEVO: Mapa para guardar grupos por su ID antiguo
        teachers_cache = {} # Cache para teachers

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

                if 'name_es' in payload: payload['title_es'] = payload.pop('name_es')
                if 'name_en' in payload: payload['title_en'] = payload.pop('name_en')
                
                valid_fields = {f.name for f in Topic._meta.get_fields()}
                clean_payload = {k: v for k, v in payload.items() if k in valid_fields}

                obj = Topic.objects.create(**clean_payload)
                topics_map[t_code] = obj
                
        # --- 4. SUBJECT_TOPICS ---
        if "subject_topics" in xls:
            print("   > Procesando vínculos Subject-Topics...")
            for _, row in xls["subject_topics"].iterrows():
                s_code = clean_str(row.get("subject_code"))
                t_code = clean_str(row.get("topic_code"))
                order_id = int(clean_str(row.get('order_id')) or 1)
                
                subject_obj = subjects_map.get(s_code)
                topic_obj = topics_map.get(t_code)

                if subject_obj and topic_obj:
                    SubjectIsAboutTopic.objects.create(
                        subject=subject_obj, 
                        topic=topic_obj, 
                        order_id=order_id
                    )

        # --- 5. CONCEPTS ---
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

                if topic_obj:
                    TopicIsAboutConcept.objects.create(topic=topic_obj, concept=obj, order_id=1)

        # --- 6. RELATIONS ---
        if "relations" in xls:
            for _, row in xls["relations"].iterrows():
                code_from = clean_str(row.get("variable1"))
                code_to = clean_str(row.get("variable2"))
                source_obj = concepts_map.get(code_from)
                target_obj = concepts_map.get(code_to) 
                if not target_obj: target_obj = concepts_name_map.get(code_to)

                if source_obj and target_obj:
                    ConceptIsRelatedToConcept.objects.create(
                        concept_from=source_obj, concept_to=target_obj,
                        description_es=row.get('description_es', ''),
                        description_en=row.get('description_en', '')
                    )

        # --- 7. EPIGRAPHS ---
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

        # --- 8. QUESTIONS ---
        if "questions" in xls:
            for _, row in xls["questions"].iterrows():
                payload = row.to_dict()
                q_code = clean_str(payload.pop("question_code", None))
                
                valid_fields = {f.name for f in Question._meta.get_fields()}
                clean_payload = {k: v for k, v in payload.items() if k in valid_fields}
                
                q_obj = Question.objects.create(**clean_payload)
                questions_map[q_code] = q_obj
                
        # --- 9. QUESTION VINCULOS (TOPIC) ---
        if "question_topics" in xls:
            print("   > Procesando vínculos Question-Topic...")
            for _, row in xls["question_topics"].iterrows():
                q_code = clean_str(row.get("question_code"))
                t_code = clean_str(row.get("topic_code"))
                
                question_obj = questions_map.get(q_code)
                topic_obj = topics_map.get(t_code)

                if question_obj and topic_obj:
                    QuestionBelongsToTopic.objects.create(question=question_obj, topic=topic_obj)
        
        # --- 10. QUESTION VINCULOS (CONCEPT) ---
        if "question_concepts" in xls:
            print("   > Procesando vínculos Question-Concept...")
            for _, row in xls["question_concepts"].iterrows():
                q_code = clean_str(row.get("question_code"))
                c_code = clean_str(row.get("concept_code"))
                
                question_obj = questions_map.get(q_code)
                concept_obj = concepts_map.get(c_code)

                if question_obj and concept_obj:
                    QuestionRelatedToConcept.objects.create(question=question_obj, concept=concept_obj)


        # --- 11. ANSWERS ---
        if "answers" in xls:
            for _, row in xls["answers"].iterrows():
                payload = row.to_dict()
                q_code = clean_str(payload.pop("question_code", None))
                is_correct = str(payload.get("is_correct")).lower() in ['true', '1', 'yes']
                payload['is_correct'] = is_correct
                q_obj = questions_map.get(q_code)
                if q_obj:
                    Answer.objects.create(question=q_obj, **payload)

        # --- 12. STUDENT GROUPS (ASIGNACIÓN DE TEACHER) ---
        if "student_groups" in xls:
            print("   > Procesando Student Groups y asignando Teachers...")
            for _, row in xls["student_groups"].iterrows():
                payload = row.to_dict()
                
                # IMPORTANTE: Capturamos el ID antiguo para mapearlo luego en analytics
                g_old_code = clean_str(payload.pop("group_code", None))
                
                s_code = clean_str(payload.pop("subject_code", None))
                teacher_email = clean_str(row.get("teacher_email")) 
                
                subject_obj = subjects_map.get(s_code)
                teacher_obj = None

                # 1. Buscar Teacher en cache o DB
                if teacher_email:
                    if teacher_email in teachers_cache:
                        teacher_obj = teachers_cache[teacher_email]
                    else:
                        try:
                            teacher_obj = Teacher.objects.get(email=teacher_email)
                            teachers_cache[teacher_email] = teacher_obj
                        except Teacher.DoesNotExist:
                            print(f"⚠️ Profesor con email '{teacher_email}' no encontrado. Grupo sin asignar.")
                            teacher_obj = None 

                valid_fields = {f.name for f in StudentGroup._meta.get_fields()}
                clean_payload = {k: v for k, v in payload.items() if k in valid_fields}
                
                # 2. Asignar Foreign Keys
                if subject_obj: clean_payload['subject'] = subject_obj
                if teacher_obj: clean_payload['teacher'] = teacher_obj 
                
                if 'groupCode' in payload:
                    clean_payload['groupCode'] = clean_str(payload['groupCode'])

                # Crear el grupo
                obj = StudentGroup.objects.create(**clean_payload)
                
                # Guardamos en mapa: ID Antiguo -> Objeto Nuevo
                if g_old_code:
                    groups_map[g_old_code] = obj

        # --- 13. QUESTION EVALUATION GROUPS (ANALYTICS) ---
        if "analytics" in xls:
            print("   > Procesando Analytics (QuestionEvaluationGroup)...")
            count_evals = 0
            for _, row in xls["analytics"].iterrows():
                # Recuperamos los códigos antiguos
                g_code = clean_str(row.get("group_code"))
                q_code = clean_str(row.get("question_code"))
                
                # Buscamos los objetos nuevos usando los mapas
                group_obj = groups_map.get(g_code)
                question_obj = questions_map.get(q_code)
                
                if group_obj and question_obj:
                    QuestionEvaluationGroup.objects.create(
                        group=group_obj,
                        question=question_obj,
                        ev_count=int(row.get('ev_count', 0)),
                        correct_count=int(row.get('correct_count', 0))
                    )
                    count_evals += 1
            print(f"     -> {count_evals} registros de analítica restaurados.")

        print("🏁 Restauración completada exitosamente.")

# ==========================================
#   IMPORTACIÓN MASIVA (CORREGIDA RELACIONES)
# ==========================================
def import_content_from_excel(file_obj, teacher):
    """
    Replica la lógica de carga masiva, con corrección en Relaciones
    y reporte de errores fila por fila.
    """
    try:
        xls = {name: df.fillna("") for name, df in pd.read_excel(file_obj, sheet_name=None).items()}
    except Exception as e:
        raise Exception(f"Error leyendo archivo Excel: {str(e)}")

    with transaction.atomic():
        print("⚠️ INICIANDO LIMPIEZA TOTAL DE DATOS DE LA ASIGNATURA...")
        
        # --- 0. FLUSH (BORRADO PREVIO) ---
        SubjectIsAboutTopic.objects.all().delete()
        TopicIsAboutConcept.objects.all().delete()
        ConceptIsRelatedToConcept.objects.all().delete()
        try:
            QuestionBelongsToTopic.objects.all().delete()
            QuestionRelatedToConcept.objects.all().delete()
        except:
            pass

        Answer.objects.all().delete()
        Question.objects.all().delete()
        Epigraph.objects.all().delete()
        StudentGroup.objects.all().delete()
        Concept.objects.all().delete()
        Topic.objects.all().delete()
        Subject.objects.all().delete()
        
        print("✅ Base de datos limpia. Iniciando carga masiva...")

        # Mapas
        subjects_map = {}
        topics_map = {}
        concepts_map = {}      # Code -> Object
        concepts_name_map = {} # Name -> Object (Para búsqueda por nombre)
        questions_map = {}

        # --- 1. SUBJECTS ---
        if "subjects" in xls:
            print("📘 Procesando Subjects...")
            for index, row in xls["subjects"].iterrows():
                try:
                    s_code = clean_str(row.get("subject_code"))
                    if not s_code: continue
                    
                    payload = {
                        'name_es': row.get('name_es'),
                        'name_en': row.get('name_en'),
                        'description_es': row.get('description_es', ''),
                        'description_en': row.get('description_en', ''),
                    }
                    obj, _ = Subject.objects.update_or_create(
                        name_es=payload['name_es'], defaults=payload
                    )
                    subjects_map[s_code] = obj
                except Exception as e:
                    print(f"❌ [Subjects] Fila {index+2}: {e}")

        # --- 2. TOPICS ---
        if "topics" in xls:
            print("📙 Procesando Topics...")
            for index, row in xls["topics"].iterrows():
                try:
                    t_code = clean_str(row.get("topic_code"))
                    s_code = clean_str(row.get("subject_code"))
                    
                    if not t_code: continue

                    payload = {
                        'title_es': row.get('title_es'),
                        'title_en': row.get('title_en'),
                        'description_es': row.get('description_es', ''),
                        'description_en': row.get('description_en', ''),
                    }
                    obj, _ = Topic.objects.update_or_create(
                        title_es=payload['title_es'], defaults=payload
                    )
                    topics_map[t_code] = obj

                    subject_obj = subjects_map.get(s_code)
                    if subject_obj:
                        SubjectIsAboutTopic.objects.get_or_create(
                            subject=subject_obj, topic=obj,
                            defaults={'order_id': int(row.get('order_id', 1) or 1)}
                        )
                except Exception as e:
                    print(f"❌ [Topics] Fila {index+2}: {e}")

        # --- 3. CONCEPTS ---
        if "concepts" in xls:
            print("📗 Procesando Concepts...")
            for index, row in xls["concepts"].iterrows():
                try:
                    c_code = clean_str(row.get("concept_code"))
                    t_code = clean_str(row.get("related_topic_code"))
                    
                    payload = {
                        'name_es': row.get('name_es'),
                        'name_en': row.get('name_en'),
                        'description_es': row.get('description_es', ''),
                        'description_en': row.get('description_en', ''),
                        'examples_es': row.get('examples_es', ''),
                        'examples_en': row.get('examples_en', ''),
                    }
                    obj, _ = Concept.objects.update_or_create(
                        name_es=payload['name_es'], defaults=payload
                    )
                    concepts_map[c_code] = obj
                    
                    # Guardamos también por nombre para búsquedas flexibles
                    if obj.name_es:
                        concepts_name_map[clean_str(obj.name_es)] = obj

                    topic_obj = topics_map.get(t_code)
                    if topic_obj:
                        TopicIsAboutConcept.objects.get_or_create(
                            topic=topic_obj, concept=obj, defaults={'order_id': 1}
                        )
                except Exception as e:
                    print(f"❌ [Concepts] Fila {index+2}: {e}")

        # --- 4. RELATIONS (CORREGIDO) ---
        if "relations" in xls:
            print("🔗 Procesando Relaciones...")
            for index, row in xls["relations"].iterrows():
                excel_row = index + 2
                try:
                    # Obtenemos los valores limpios
                    val_1 = clean_str(row.get("variable1")) # Origen
                    val_2 = clean_str(row.get("variable2")) # Destino

                    if not val_1 or not val_2:
                        continue

                    # 1. Buscar Origen (preferiblemente por código, fallback por nombre)
                    source_obj = concepts_map.get(val_1)
                    if not source_obj:
                        source_obj = concepts_name_map.get(val_1)

                    # 2. Buscar Destino (preferiblemente por código, fallback por nombre)
                    target_obj = concepts_map.get(val_2)
                    if not target_obj:
                        target_obj = concepts_name_map.get(val_2)

                    # 3. Crear relación si ambos existen
                    if source_obj and target_obj:
                        ConceptIsRelatedToConcept.objects.get_or_create(
                            concept_from=source_obj,
                            concept_to=target_obj,
                            defaults={
                                'description_es': row.get("description_es", ""),
                                'description_en': row.get("description_en", "")
                            }
                        )
                    else:
                        # Reporte detallado de qué faltó
                        missing = []
                        if not source_obj: missing.append(f"Origen '{val_1}' no encontrado")
                        if not target_obj: missing.append(f"Destino '{val_2}' no encontrado")
                        print(f"⚠️ [Relations] Fila {excel_row}: No se creó. {', '.join(missing)}.")

                except Exception as e:
                    print(f"❌ [Relations] Error crítico en fila {excel_row}: {e}")

        # --- 5. EPIGRAPHS ---
        if "epigraphs" in xls:
            print("📑 Procesando Epigraphs...")
            for index, row in xls["epigraphs"].iterrows():
                try:
                    t_code = clean_str(row.get("topic_code"))
                    topic_obj = topics_map.get(t_code)
                    if topic_obj:
                        Epigraph.objects.get_or_create(
                            topic=topic_obj,
                            name_es=row.get('name_es'),
                            defaults={
                                'name_en': row.get('name_en'),
                                'description_es': row.get('description_es', ''),
                                'description_en': row.get('description_en', ''),
                                'order_id': int(row.get('order_id', 1) or 1)
                            }
                        )
                except Exception as e:
                    print(f"❌ [Epigraphs] Fila {index+2}: {e}")

        # --- 6. QUESTIONS ---
        if "questions" in xls:
            print("❓ Procesando Questions...")
            for index, row in xls["questions"].iterrows():
                try:
                    q_code = clean_str(row.get("question_code"))
                    t_code = clean_str(row.get("topic_code"))
                    c_code = clean_str(row.get("concept_code"))
                    
                    if not q_code: continue

                    payload = {
                        'statement_es': row.get('statement_es'),
                        'statement_en': row.get('statement_en'),
                    }
                    q_obj, _ = Question.objects.update_or_create(
                        statement_es=payload['statement_es'], defaults=payload
                    )
                    questions_map[q_code] = q_obj

                    if t_code:
                        t_obj = topics_map.get(t_code)
                        if t_obj: QuestionBelongsToTopic.objects.get_or_create(question=q_obj, topic=t_obj)
                    
                    if c_code:
                        c_obj = concepts_map.get(c_code)
                        if c_obj: QuestionRelatedToConcept.objects.get_or_create(question=q_obj, concept=c_obj)

                except Exception as e:
                    print(f"❌ [Questions] Fila {index+2}: {e}")

        # --- 7. ANSWERS ---
        if "answers" in xls:
            print("✏️ Procesando Answers...")
            for index, row in xls["answers"].iterrows():
                excel_row = index + 2
                try:
                    q_code = clean_str(row.get("question_code"))
                    q_obj = questions_map.get(q_code)
                    
                    if q_obj:
                        is_correct = str(row.get("is_correct")).lower() in ['true', '1', 'yes']
                        Answer.objects.get_or_create(
                            question=q_obj,
                            text_es=clean_str(row.get("text_es")),
                            defaults={
                                'text_en': clean_str(row.get("text_en")),
                                'is_correct': is_correct
                            }
                        )
                    else:
                        print(f"❌ [Answers] Fila {excel_row}: Pregunta padre '{q_code}' no encontrada.")
                except Exception as e:
                    print(f"❌ [Answers] Fila {excel_row}: {e}")

        # --- 8. STUDENT GROUPS ---
        if "student_groups" in xls:
            print("👥 Procesando Student Groups...")
            for index, row in xls["student_groups"].iterrows():
                try:
                    s_code = clean_str(row.get("subject_code"))
                    subject_obj = subjects_map.get(s_code)
                    
                    if subject_obj:
                        teacher_email = clean_str(teacher.email)
                        teacher_obj = None
                        if teacher_email:
                            try:
                                teacher_obj = Teacher.objects.get(email=teacher_email)
                            except Teacher.DoesNotExist:
                                pass

                        StudentGroup.objects.get_or_create(
                            name_es=row.get('name_es'),
                            subject=subject_obj,
                            defaults={
                                'name_en': row.get('name_en'),
                                'groupCode': generate_groupCode(),
                                'teacher': teacher_obj 
                            }
                        )
                except Exception as e:
                    print(f"❌ [Groups] Fila {index+2}: {e}")

    return True
