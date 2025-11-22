from datetime import timezone
from django.forms import ValidationError
from apps.evaluation.api.models import Question, Answer, QuestionBelongsToTopic, QuestionRelatedToConcept, QuestionEvaluationGroup
from apps.content.api.models import Topic, Concept
from apps.content.domain import selectors as content_selectors
from apps.utils.audit import makeChanges
from apps.courses.api.models import StudentGroup
from apps.evaluation.domain import selectors as evaluation_selectors
from apps.customauth.models import CustomTeacher as Teacher

# --- Question Services ---
def create_question(teacher: Teacher, type: str, statement_es: str = None, statement_en: str = None,
                    approved: bool = False, generated: bool = False, topics_titles: set[str] = None, 
                    concepts_names: set[str] = None, is_true = None, answers: list[Answer] = None,
                    recommendation_es: str = None, recommendation_en: str = None) -> Question:
    """Crea una nueva pregunta con validaciones básicas."""

    if not statement_es or not statement_en:
        raise ValidationError("Debe proporcionar el enunciado en ambos idiomas.")
    question = Question.objects.create(
        type=type,
        statement_es=statement_es,
        statement_en=statement_en,
        recommendation_es=recommendation_es,
        recommendation_en=recommendation_en,
        approved=approved,
        generated=generated,
    )
    if answers:
        for answer in answers:
            create_answer(teacher, question, text_es=answer.text_es, text_en=answer.text_en, is_correct=answer.is_correct)
    if type is not None:
        if type == 'true_false':
            if is_true is not None:
                create_answer(teacher, question, text_es='Verdadero', text_en='True', is_correct=is_true)
                create_answer(teacher, question, text_es='Falso', text_en='False', is_correct=not is_true)
            else:
                raise ValidationError("Debe proporcionar el valor de is_true para preguntas de verdadero/falso.")

    if topics_titles:
        for title in topics_titles:
            print(title)
            topic = content_selectors.get_topic_by_title(title)
            QuestionBelongsToTopic.objects.create(question=question, topic=topic)
    
    if concepts_names:
        for name in concepts_names:
            concept = content_selectors.get_concept_by_name(name)
            QuestionRelatedToConcept.objects.create(question=question, concept=concept)
            try:
                relationship = QuestionRelatedToConcept.objects.get(question=question, concept=concept)
                print("La relación QuestionRelatedToConcept se ha creado correctamente.")
                # Puedes acceder a los atributos de la relación si es necesario
                print(f"Question ID: {relationship.question.id}, Concept ID: {relationship.concept.id}")
            except QuestionRelatedToConcept.DoesNotExist:
                print("La relación QuestionRelatedToConcept no se encontró.")
    

    makeChanges(user=teacher, old_object=None, new_object=question)

    return question

def update_question(teacher: Teacher, question: Question, type: str = None, statement_es: str = None,
                    statement_en: str = None, approved: bool = None,
                    generated: bool = None, topics: set[Topic] = None, 
                    concepts: set[Concept] = None, is_true = None) -> Question:
    """Actualiza una pregunta con los nuevos datos proporcionados."""
    old_question = Question.objects.get(pk=question.pk)
    old_question.pk = None 
    old_question.old = True
    if type is not None:
        question.type = type
        if type == 'true_false':
            if is_true is not None:
                for answer in question.answers.all():
                    delete_answer(teacher, answer)
                create_answer(teacher, question, text_es='Verdadero', text_en='True', is_correct=is_true)
                create_answer(teacher, question, text_es='Falso', text_en='False', is_correct=not is_true)
            else:
                raise ValidationError("Debe proporcionar el valor de is_true para preguntas de verdadero/falso.")
    if statement_es is not None:
        question.statement_es = statement_es
    if statement_en is not None:
        question.statement_en = statement_en
    if approved is not None:
        question.approved = approved
    if generated is not None:
        question.generated = generated
    if topics is not None:
        QuestionBelongsToTopic.objects.filter(question=question).delete()
        for title in topics:
            topic = content_selectors.get_topic_by_title(title)
            QuestionBelongsToTopic.objects.create(question=question, topic=topic)
    if concepts is not None:
        QuestionRelatedToConcept.objects.filter(question=question).delete()
        for name in concepts:
            concept = content_selectors.get_concept_by_name(name)
            QuestionRelatedToConcept.objects.create(question=question, concept=concept)
    question.save()
    old_question.save()
    makeChanges(teacher, old_object=old_question, new_object=question)
    return question

def delete_question(teacher: Teacher, question: Question) -> None:
    """Elimina una pregunta dada."""
    makeChanges(teacher, old_object=question, new_object=None)
    question.delete()

# --- Answer Services ---
def create_answer(teacher: Teacher, question: Question, text_es: str = None, text_en: str = None,
                   is_correct: bool = False) -> Answer:
    if not text_es or not text_en:
        raise ValidationError("Debe proporcionar el texto de la respuesta en ambos idiomas.")
    answer = Answer.objects.create(
        question=question,
        text_es=text_es,
        text_en=text_en,
        is_correct=is_correct,
    )
    makeChanges(teacher, old_object=None, new_object=answer)
    return answer

def update_answer(teacher: Teacher, answer: Answer, text_es: str = None, text_en: str = None,
                   is_correct: bool = None) -> Answer:
    """Actualiza una respuesta con los nuevos datos proporcionados."""
    old_answer = Answer.objects.get(pk=answer.pk)
    old_answer.pk = None
    old_answer.old = True
    if text_es is not None:
        answer.text_es = text_es
    if text_en is not None:
        answer.text_en = text_en
    if is_correct is not None:
        answer.is_correct = is_correct
    answer.save()
    old_answer.save()
    makeChanges(teacher, old_object=old_answer, new_object=answer)
    return answer

def delete_answer(teacher: Teacher, answer: Answer) -> None:
    """Elimina una respuesta dada."""
    makeChanges(teacher, old_object=answer, new_object=None)
    answer.delete()

def evaluate_question(student_group: StudentGroup, question: Question, answer: Answer) -> bool:
    """Evalúa una pregunta para un grupo de estudiantes dado y actualiza las métricas correspondientes."""

    if answer.question != question:
        raise ValidationError("La respuesta proporcionada no pertenece a la pregunta dada.")

    is_correct = answer.is_correct
    qeg, created = QuestionEvaluationGroup.objects.get_or_create(
        question=question,
        group=student_group,
        defaults={'ev_count': 0, 'correct_count': 0}
    )
    qeg.ev_count += 1
    if is_correct:
        qeg.correct_count += 1
    qeg.save()
    return is_correct

def create_exam(topics: set[Topic], num_questions: int) -> list[Question]:
    exam_questions = []
    
    for topic in topics:
        question = evaluation_selectors.get_random_question_from_topic(topic)
        if question and question not in exam_questions:
            exam_questions.append(question)
    if len(exam_questions) >= num_questions:
        return exam_questions[:num_questions]

    remaining_questions_needed = num_questions - len(exam_questions)
    additional_questions = evaluation_selectors.get_random_questions_from_topics(topics, remaining_questions_needed)
    for question in additional_questions:
        if question not in exam_questions:
            exam_questions.append(question)
        if len(exam_questions) >= num_questions:
            break

    return exam_questions

def correct_exam(student_group: StudentGroup, questions_and_answers: dict[Question, Answer]) -> int:
    """Corrige un examen dado un conjunto de preguntas y respuestas."""
    mark = 0

    for question, answer in questions_and_answers.items():
        is_correct = evaluate_question(student_group, question, answer)
        if is_correct:
            mark += 1
    return mark