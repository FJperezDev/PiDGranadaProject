from django.utils import timezone
from django.db import models
from apps.customauth.models import CustomTeacher as Teacher
from apps.utils.choices import ACTION_CHOICES
from apps.courses.api.models import Subject, SubjectIsAboutTopic

# Create your models here.

class Topic(models.Model):
    title_es = models.TextField(unique=True)
    title_en = models.TextField(unique=True)
    description_es = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title_es or self.title_en

class TeacherMakeChangeTopic(models.Model):
    old_topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='old_changes')
    new_topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='changes')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)

class Concept(models.Model):
    name_es = models.TextField(unique=True)
    name_en = models.TextField(unique=True)
    description_es = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name_es or self.name_en

class TeacherMakeChangeConcept(models.Model):
    old_concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='old_changes')
    new_concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='changes')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)

class ConceptIsRelatedToConcept(models.Model):
    concept_from= models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='related_concepts_from')
    concept_to = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='related_concepts_to')

    class Meta:
        unique_together = ('concept_from', 'concept_to')

    def __str__(self):
        return f"{self.concept_from} → {self.concept_to}"

Concept.add_to_class(
    'related_concepts',
    models.ManyToManyField(
        'self',
        through='ConceptIsRelatedToConcept',
        symmetrical=False,
        related_name='related_to_concepts'
    )
)

class TopicIsAboutConcept(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE)
    order_id = models.IntegerField(unique=True)

    class Meta:
        unique_together = ('topic', 'concept', 'order_id')
        ordering = ['order_id']

Topic.add_to_class('concepts', models.ManyToManyField(Concept, through=TopicIsAboutConcept, related_name='topics'))

class Epigraph(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='epigraphs')
    name_es = models.TextField()
    name_en = models.TextField()
    description_es = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)
    order_id = models.IntegerField()

    class Meta:
        unique_together = ('id', 'topic')
        ordering = ['order_id']

    def __str__(self):
        return self.name_es or self.name_en

class TeacherMakeChangeEpigraph(models.Model):
    old_epigraph = models.ForeignKey(Epigraph, on_delete=models.CASCADE, related_name='old_changes')
    new_epigraph = models.ForeignKey(Epigraph, on_delete=models.CASCADE, related_name='changes')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)