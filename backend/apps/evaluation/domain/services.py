from datetime import timezone
from django.forms import ValidationError
from apps.evaluation.api.models import Question, Answer, QuestionBelongsToTopic, QuestionRelatedToConcept, QuestionEvaluationGroup
from apps.content.api.models import Topic, Concept
from apps.content.domain import selectors as content_selectors
from apps.utils.audit import makeChanges
from apps.courses.api.models import StudentGroup
from apps.evaluation.domain import selectors as evaluation_selectors

# --- Question Services ---
def create_question(user, type: str, statement_es: str = None, statement_en: str = None,
                    approved: bool = False, generated: bool = False, topics: set[Topic] = None, 
                    concepts: set[Concept] = None, _from_audit: bool = False) -> Question:
    """Crea una nueva pregunta con validaciones básicas."""
    if not statement_es or not statement_en:
        raise ValidationError("Debe proporcionar el enunciado en ambos idiomas.")
    question = Question.objects.create(
        type=type,
        statement_es=statement_es,
        statement_en=statement_en,
        approved=approved,
        generated=generated,
    )
    if topics:
        for topic in topics:
            QuestionBelongsToTopic.objects.create(question=question, topic=topic)
    
    if concepts:
        for concept in concepts:
            QuestionRelatedToConcept.objects.create(question=question, concept=concept)
    if not _from_audit:
        makeChanges(user, question, 'created')

    return question

def update_question(user, question: Question, type: str = None, statement_es: str = None,
                    statement_en: str = None, approved: bool = None,
                    generated: bool = None, topics: set[Topic] = None, 
                    concepts: set[Concept] = None, is_true = None, _from_audit: bool = False) -> Question:
    """Actualiza una pregunta con los nuevos datos proporcionados."""
    if type is not None:
        question.type = type
        if type == 'true_false':
            if is_true is not None:
                for answer in question.answers.all():
                    delete_answer(user, answer)
                create_answer(user, question, text_es='Verdadero', text_en='True', is_correct=is_true)
                create_answer(user, question, text_es='Falso', text_en='False', is_correct=not is_true)
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
    if not _from_audit:
        makeChanges(user, question, 'updated')
    return question

def delete_question(user, question: Question, _from_audit: bool = False) -> None:
    """Elimina una pregunta dada."""
    if not _from_audit:
        makeChanges(user, question, 'deleted')
    question.delete()

# --- Answer Services ---
def create_answer(user, question: Question, text_es: str = None, text_en: str = None,
                   is_correct: bool = False) -> Answer:
    """Crea una nueva respuesta para una pregunta dada."""
    if not text_es or not text_en:
        raise ValidationError("Debe proporcionar el texto de la respuesta en ambos idiomas.")
    answer = Answer.objects.create(
        question=question,
        text_es=text_es,
        text_en=text_en,
        is_correct=is_correct,
    )
    # This service is simple, so we can remove the audit call to prevent loops.
    # The audit will be handled by the calling function (e.g., update_question).
    return answer

def update_answer(user, answer: Answer, text_es: str = None, text_en: str = None,
                   is_correct: bool = None, _from_audit: bool = False) -> Answer:
    """Actualiza una respuesta con los nuevos datos proporcionados."""
    if text_es is not None:
        answer.text_es = text_es
    if text_en is not None:
        answer.text_en = text_en
    if is_correct is not None:
        answer.is_correct = is_correct
    answer.save()
    if not _from_audit:
        makeChanges(user, answer, 'updated')
    return answer

def delete_answer(user, answer: Answer, _from_audit: bool = False) -> None:
    """Elimina una respuesta dada."""
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

def create_exam(user, topics: set[Topic], num_questions: int) -> list[Question]:
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