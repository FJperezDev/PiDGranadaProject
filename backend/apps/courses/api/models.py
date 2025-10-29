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
    modified = models.BooleanField(default=False)

    def __str__(self):
        return self.name_es or self.name_en

# Note: TeacherMakeChangeSubject model intentionally omitted because migrations do not
# create a corresponding table. Keeping this class in models would cause Django to
# expect a table that doesn't exist and trigger OperationalError on cascade deletes.
    

class StudentGroup(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='studentgroups')
    name_es = models.TextField(unique=True)
    name_en = models.TextField(unique=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='studentgroups')
    groupCode = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        unique_together = ('id', 'subject')

    def __str__(self):
        return f"{self.name_es} ({self.subject.name_es})"
    
class TeacherMakeChangeStudentGroup(models.Model):
    # Match the fields created/removed by migrations: only keep group, subject, teacher, action, created_at
    group = models.ForeignKey(StudentGroup, on_delete=models.CASCADE, related_name='changes')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('group', 'subject', 'action', 'created_at', 'teacher')

    def __str__(self):
        return f"{self.teacher} {self.action} {self.group}"

class SubjectIsAboutTopic(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='topics')
    topic = models.ForeignKey('content.Topic', on_delete=models.CASCADE, related_name='subjects')
    order_id = models.IntegerField()

    class Meta:
        unique_together = ('subject', 'topic', 'order_id')

    def __str__(self):
        return f"{self.subject} is about {self.topic}"