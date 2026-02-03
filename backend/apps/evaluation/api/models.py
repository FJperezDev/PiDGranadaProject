from django.db import models
from django.utils import timezone
from apps.customauth.models import CustomTeacher as Teacher
from apps.content.api.models import Topic, Concept 
from apps.courses.api.models import StudentGroup

class Question(models.Model):
    QUESTION_TYPES = [
        ('multiple', 'Multiple Choice'),
        ('truefalse', 'True/False'),
    ]

    type = models.CharField(max_length=50, choices=QUESTION_TYPES)
    statement_es = models.TextField(blank=False, null=True)
    statement_en = models.TextField(blank=False, null=True)
    explanation_es = models.TextField(blank=True, null=True)
    explanation_en = models.TextField(blank=True, null=True)
    approved = models.BooleanField(default=False)
    generated = models.BooleanField(default=False)
    old = models.BooleanField(default=False)

    class Meta:
        # AÑADIDO: Índices para acelerar la generación de exámenes
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['approved']),
            models.Index(fields=['generated']),
        ]

    def __str__(self):
      return self.statement_es or f"Question #{self.pk}"

class TeacherMakeChangeQuestion(models.Model):
    old_object = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='old_changes', null=True, blank=True)
    new_object = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='changes', null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.teacher} changed {self.old_object} to {self.new_object}"

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text_es = models.TextField(blank=False, null=True)
    text_en = models.TextField(blank=False, null=True)
    is_correct = models.BooleanField(default=False)
    old = models.BooleanField(default=False)

    class Meta:
        unique_together = ('id', 'question')
        # AÑADIDO: Índice para recuperar respuestas de una pregunta instantáneamente
        indexes = [
            models.Index(fields=['question']),
        ]

    def __str__(self):
        return f"{self.text_es or self.text_en} (Q{self.question.id})"

class TeacherMakeChangeAnswer(models.Model):
    old_object = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='old_changes', null=True, blank=True)
    new_object = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='changes', null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.teacher} changed {self.old_object} to {self.new_object}"


class QuestionBelongsToTopic(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='topics')

    class Meta:
        unique_together = ('topic', 'question')

    def __str__(self):
        return f"Q{self.question.id} -> Topic {self.topic.id}"


class QuestionRelatedToConcept(models.Model):
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='concepts')

    class Meta:
        unique_together = ('concept', 'question')

    def __str__(self):
        return f"Q{self.question.id} -> Concept {self.concept.id}"

class QuestionEvaluationGroup(models.Model):
    group = models.ForeignKey(StudentGroup, on_delete=models.CASCADE, related_name='evaluations')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='evaluations')
    ev_count = models.PositiveIntegerField(default=0)
    correct_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('group', 'question')
        indexes = [
            # Ayuda a agrupar por pregunta rápidamente
            models.Index(fields=['question']), 
        ]

    def __str__(self):
        return f"{self.group} evaluated Q{self.question.id}  "
