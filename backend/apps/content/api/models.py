from django.utils import timezone
from django.db import models
from apps.customauth.models import CustomTeacher as Teacher
from apps.utils.choices import ACTION_CHOICES
from apps.courses.api.models import Subject, SubjectIsAboutTopic
from django.db.models import Q

# Create your models here.

class Topic(models.Model):
    title_es = models.TextField(max_length=255)
    title_en = models.TextField(max_length=255)
    description_es = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)
    old = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['title_es'],
                condition=Q(old=False),
                name='unique_active_topic_title_es'
            ),
            models.UniqueConstraint(
                fields=['title_en'],
                condition=Q(old=False),
                name='unique_active_topic_title_en'
            )
        ]

    def __str__(self):
        return self.title_es or self.title_en

class TeacherMakeChangeTopic(models.Model):
    old_object = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='old_changes', null=True, blank=True)
    new_object = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='changes', null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.teacher} changed {self.old_object} to {self.new_object}"

class Concept(models.Model):
    name_es = models.TextField(max_length=255)
    name_en = models.TextField(max_length=255)
    description_es = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)
    examples_es = models.TextField(null=True, blank=True)
    examples_en = models.TextField(null=True, blank=True)
    
    old = models.BooleanField(default=False)

    def __str__(self):
        return self.name_es or self.name_en

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['name_es'],
                condition=Q(old=False),
                name='unique_active_concept_name_es'
            ),
            models.UniqueConstraint(
                fields=['name_en'],
                condition=Q(old=False),
                name='unique_active_concept_name_en'
            )
        ]

class TeacherMakeChangeConcept(models.Model):
    old_object = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='old_changes', null=True, blank=True)
    new_object = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='changes', null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.teacher} changed {self.old_object} to {self.new_object}"


class ConceptIsRelatedToConcept(models.Model):
    concept_from= models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='related_concepts_from')
    concept_to = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='related_concepts_to')
    description_es = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)

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
    order_id = models.IntegerField()

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
    old = models.BooleanField(default=False)

    class Meta:
        unique_together = ('id', 'topic')
        ordering = ['order_id']

    def __str__(self):
        return self.name_es or self.name_en

class TeacherMakeChangeEpigraph(models.Model):
    old_object = models.ForeignKey(Epigraph, on_delete=models.CASCADE, related_name='old_changes', null=True, blank=True)
    new_object = models.ForeignKey(Epigraph, on_delete=models.CASCADE, related_name='changes', null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.teacher} changed {self.old_object} to {self.new_object}"