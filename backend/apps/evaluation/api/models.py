from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone

# Importar desde otras apps
from apps.customauth.models import CustomTeacher as Teacher
from apps.content.api.models import Topic, Concept 
from apps.courses.api.models import StudentGroup
from apps.utils.audit import ACTION_CHOICES

class Question(models.Model):
    QUESTION_TYPES = [
        ('multiple', 'Multiple Choice'),
        ('truefalse', 'True/False'),
    ]

    type = models.CharField(max_length=50, choices=QUESTION_TYPES)
    statement_es = models.TextField(blank=True, null=True)
    statement_en = models.TextField(blank=True, null=True)
    approved = models.BooleanField(default=False)
    generated = models.BooleanField(default=False)

    def __str__(self):
        return self.statement_es or f"Question #{self.pk}"


class TeacherMakeChangeQuestion(models.Model):
    old_question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='old_changes', null=True, blank=True)
    new_question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='changes')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('question', 'action', 'created_at')

    def __str__(self):
        return f"{self.teacher} {self.action} {self.question}"


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text_es = models.TextField(blank=True, null=True)
    text_en = models.TextField(blank=True, null=True)
    is_correct = models.BooleanField(default=False)

    class Meta:
        unique_together = ('id', 'question')

    def __str__(self):
        return f"{self.text_es or self.text_en} (Q{self.question.id})"


class TeacherMakeChangeAnswer(models.Model):
    old_answer = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='old_changes', null=True, blank=True)
    new_answer = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='changes')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('question', 'answer', 'action', 'created_at')

    def __str__(self):
        return f"{self.teacher} {self.action} {self.answer}"


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

    def __str__(self):
        return f"{self.group} evaluated Q{self.question.id}  "
