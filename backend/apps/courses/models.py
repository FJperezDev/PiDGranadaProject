from django.db import models
from django.utils import timezone
from ..customauth.models import CustomTeacher as Teacher

# Create your models here.

class Subject(models.Model):
    name_es = models.TextField()
    name_en = models.TextField()
    description_es = models.TextField(blank=True, null=True)
    description_en = models.TextField(blank=True, null=True)
    modified = models.BooleanField(default=False)

    def __str__(self):
        return self.name_es or self.name_en

class StudentGroup(models.Model):
    id = models.IntegerField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='groups')
    name_es = models.TextField()
    name_en = models.TextField()
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='groups')

    class Meta:
        unique_together = ('id', 'subject')

    def __str__(self):
        return f"{self.name_es} ({self.subject.name_es})"
    

class TeacherMakeChangeStudentGroup(models.Model):
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
    ]

    group = models.ForeignKey(StudentGroup, on_delete=models.CASCADE, related_name='changes')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)
    name_es = models.TextField()
    name_en = models.TextField()

    class Meta:
        unique_together = ('group', 'subject', 'action', 'created_at', 'teacher')

    def __str__(self):
        return f"{self.teacher} {self.action} group {self.group}"