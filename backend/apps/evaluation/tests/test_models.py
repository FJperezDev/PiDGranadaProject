from django.test import TestCase
from django.db import IntegrityError
from apps.evaluation.api.models import Question, Answer

class TestQuestionModel(TestCase):
    def test_str_uses_statement_es_when_present(self):
        question = Question.objects.create(type='multiple', statement_es='Pregunta en español')
        self.assertEqual(str(question), 'Pregunta en español')

    def test_str_uses_pk_when_statement_es_missing(self):
        question = Question.objects.create(type='multiple')
        self.assertEqual(str(question), f"Question #{question.pk}")

class TestAnswerModel(TestCase):
    def setUp(self):
        self.question = Question.objects.create(type='multiple')

    def test_default_is_correct_false_and_str_uses_text_es(self):
        answer = Answer.objects.create(question=self.question, text_es='Respuesta')
        self.assertFalse(answer.is_correct)
        self.assertEqual(str(answer), f"Respuesta (Q{self.question.id})")

    def test_str_uses_text_en_when_text_es_missing(self):
        answer = Answer.objects.create(question=self.question, text_en='Answer')
        self.assertEqual(str(answer), f"Answer (Q{self.question.id})")

    def test_question_answers_relation_and_counts(self):
        self.question.answers.create(text_es='A')
        self.question.answers.create(text_es='B', is_correct=True)
        self.assertEqual(self.question.answers.count(), 2)
        texts = [str(a) for a in self.question.answers.all()]
        self.assertIn(f"A (Q{self.question.id})", texts)
        self.assertIn(f"B (Q{self.question.id})", texts)

    def test_cannot_create_two_answers_with_same_id(self):
        # creating first answer with an explicit id
        first = Answer.objects.create(id=99999, question=self.question, text_es='First')
        self.assertEqual(first.id, 99999)
        # attempting to create another answer with the same primary key should raise IntegrityError
        with self.assertRaises(IntegrityError):
            Answer.objects.create(id=99999, question=self.question, text_es='Duplicate')