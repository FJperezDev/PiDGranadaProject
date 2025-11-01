from django.db import models
from django.utils import timezone
from apps.customauth.models import CustomTeacher as Teacher
from apps.utils.choices import ACTION_CHOICES

# Create your models here.

class Subject(models.Model):
    name_es = models.TextField(unique=True)
    name_en = models.TextField(unique=True)
    description_es = models.TextField(blank=True, null=True)
    description_en = models.TextField(blank=True, null=True)
    old = models.BooleanField(default=False)

    def __str__(self):
        return self.name_es or self.name_en

class TeacherMakeChangeSubject(models.Model):
    old_subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='changes', null=True, blank=True)
    new_subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='+', null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('old_subject', 'new_subject', 'created_at', 'teacher')

    def __str__(self):
        return f"{self.teacher} changed {self.old_subject} to {self.new_subject}"

class StudentGroup(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='studentgroups')
    name_es = models.TextField(unique=True)
    name_en = models.TextField(unique=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='studentgroups')
    groupCode = models.CharField(max_length=20, null=True, blank=True)
    old = models.BooleanField(default=False)

    class Meta:
        unique_together = ('id', 'subject')

    def __str__(self):
        return f"{self.name_es} ({self.subject.name_es})"
    
class TeacherMakeChangeStudentGroup(models.Model):
    # Match the fields created/removed by migrations: only keep group, subject, teacher, action, created_at
    old_group = models.ForeignKey(StudentGroup, on_delete=models.CASCADE, related_name='changes', null=True, blank=True)
    new_group = models.ForeignKey(StudentGroup, on_delete=models.CASCADE, related_name='+', null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('old_group', 'new_group','created_at', 'teacher')

    def __str__(self):
        return f"{self.teacher} changed {self.old_group} to {self.new_group}"

class SubjectIsAboutTopic(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='topics')
    topic = models.ForeignKey('content.Topic', on_delete=models.CASCADE, related_name='subjects')
    order_id = models.IntegerField()

    class Meta:
        unique_together = ('subject', 'topic', 'order_id')

    def __str__(self):
        return f"{self.subject} is about {self.topic}"