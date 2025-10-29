from django.db import models
from django.utils import timezone
from apps.customauth.models import CustomTeacher as Teacher
from apps.utils.audit import ACTION_CHOICES

# Create your models here.

class Subject(models.Model):
    name_es = models.TextField()
    name_en = models.TextField()
    description_es = models.TextField(blank=True, null=True)
    description_en = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name_es or self.name_en

class TeacherMakeChangeSubject(models.Model):
    old_subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='old_changes', null=True, blank=True)
    new_subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='changes')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('subject', 'action', 'created_at')

    def __str__(self):
        return f"{self.teacher} {self.action} {self.subject}"
    

class StudentGroup(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='studentgroups')
    name_es = models.TextField()
    name_en = models.TextField()
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='studentgroups')
    groupCode = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        unique_together = ('id', 'subject')

    def __str__(self):
        return f"{self.name_es} ({self.subject.name_es})"
    
class TeacherMakeChangeStudentGroup(models.Model):
    old_group = models.ForeignKey(StudentGroup, on_delete=models.CASCADE, related_name='old_changes', null=True, blank=True)
    new_group = models.ForeignKey(StudentGroup, on_delete=models.CASCADE, related_name='changes')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('group', 'action', 'created_at')

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