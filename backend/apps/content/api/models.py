from django.db import models
from ...courses.api.models import Subject, SubjectIsAboutTopic

# Create your models here.

class Topic(models.Model):
    title_es = models.TextField(unique=True)
    title_en = models.TextField(unique=True)
    description_es = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title_es or self.title_en

class Concept(models.Model):
    name_es = models.TextField(unique=True)
    name_en = models.TextField(unique=True)
    description_es = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name_es or self.name_en

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
