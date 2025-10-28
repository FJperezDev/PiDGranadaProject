from django.forms import ValidationError
from ..api.models import Question, Answer, QuestionBelongsToTopic, QuestionRelatedToConcept
from ...content.api.models import Topic, Concept
from ...content.domain import selectors

# --- Question Services ---
def create_question(type: str, statement_es: str = None, statement_en: str = None,
                    approved: bool = False, generated: bool = False, topics: set[Topic] = None, 
                    concepts: set[Concept] = None) -> Question:
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

    return question

def update_question(question: Question, type: str = None, statement_es: str = None,
                    statement_en: str = None, approved: bool = None,
                    generated: bool = None, topics: set[Topic] = None, 
                    concepts: set[Concept] = None, is_true = None) -> Question:
    """Actualiza una pregunta con los nuevos datos proporcionados."""
    if type is not None:
        question.type = type
        if type == 'true_false':
            if is_true is not None:
                answers = question.answers.all()
                for answer in answers:
                    delete_answer(answer)
                create_answer(question, text_es='Verdadero', text_en='True', is_correct=is_true)
                create_answer(question, text_es='Falso', text_en='False', is_correct=not is_true)
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
            topic = selectors.get_topic_by_title(title)
            QuestionBelongsToTopic.objects.create(question=question, topic=topic)
    if concepts is not None:
        QuestionRelatedToConcept.objects.filter(question=question).delete()
        for name in concepts:
            concept = selectors.get_concept_by_name(name)
            QuestionRelatedToConcept.objects.create(question=question, concept=concept)
    question.save()
    return question

def delete_question(question: Question) -> None:
    """Elimina una pregunta dada."""
    question.delete()

# --- Answer Services ---
def create_answer(question: Question, text_es: str = None, text_en: str = None,
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
    return answer

def update_answer(answer: Answer, text_es: str = None, text_en: str = None,
                   is_correct: bool = None) -> Answer:
    """Actualiza una respuesta con los nuevos datos proporcionados."""
    if text_es is not None:
        answer.text_es = text_es
    if text_en is not None:
        answer.text_en = text_en
    if is_correct is not None:
        answer.is_correct = is_correct
    answer.save()
    return answer

def delete_answer(answer: Answer) -> None:
    """Elimina una respuesta dada."""
    answer.delete()