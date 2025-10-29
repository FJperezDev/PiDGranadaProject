from django.test import TestCase
from django.db import IntegrityError, transaction
from apps.content.api.models import Topic, Concept, ConceptIsRelatedToConcept, TopicIsAboutConcept, Epigraph

class TopicModelTests(TestCase):
    def test_str_returns_title_es(self):
        topic = Topic.objects.create(title_es="Título ES", title_en="Title EN")
        self.assertEqual(str(topic), "Título ES")

    def test_str_falls_back_to_title_en(self):
        topic = Topic.objects.create(title_es="", title_en="Title EN")
        self.assertEqual(str(topic), "Title EN")

    def test_unique_titles(self):
        Topic.objects.create(title_es="T1", title_en="T2")
        with self.assertRaises(IntegrityError):
            with transaction.atomic(): 
                Topic.objects.create(title_es="T1", title_en="T3")
        with self.assertRaises(IntegrityError):
            with transaction.atomic(): 
                Topic.objects.create(title_es="T3", title_en="T2")

class ConceptModelTests(TestCase):
    def test_str_returns_name_es(self):
        concept = Concept.objects.create(name_es="Nombre ES", name_en="Name EN")
        self.assertEqual(str(concept), "Nombre ES")

    def test_str_falls_back_to_name_en(self):
        concept = Concept.objects.create(name_es="", name_en="Name EN")
        self.assertEqual(str(concept), "Name EN")

    def test_unique_names(self):
        Concept.objects.create(name_es="C1", name_en="C2")
        with self.assertRaises(IntegrityError):
            with transaction.atomic(): 
                Concept.objects.create(name_es="C1", name_en="C3")
        with self.assertRaises(IntegrityError):
            with transaction.atomic(): 
                Concept.objects.create(name_es="C3", name_en="C2")

class ConceptIsRelatedToConceptModelTests(TestCase):
    def setUp(self):
        self.c1 = Concept.objects.create(name_es="C1", name_en="C1")
        self.c2 = Concept.objects.create(name_es="C2", name_en="C2")

    def test_str_representation(self):
        rel = ConceptIsRelatedToConcept.objects.create(concept_from=self.c1, concept_to=self.c2)
        self.assertEqual(str(rel), "C1 → C2")

    def test_unique_together(self):
        ConceptIsRelatedToConcept.objects.create(concept_from=self.c1, concept_to=self.c2)
        with self.assertRaises(IntegrityError):
            ConceptIsRelatedToConcept.objects.create(concept_from=self.c1, concept_to=self.c2)

    def test_related_concepts_m2m(self):
        self.c1.related_concepts.add(self.c2)
        self.assertIn(self.c2, self.c1.related_concepts.all())

class TopicIsAboutConceptModelTests(TestCase):
    def setUp(self):
        self.topic = Topic.objects.create(title_es="T", title_en="T")
        self.concept = Concept.objects.create(name_es="C", name_en="C")

    def test_unique_together(self):
        TopicIsAboutConcept.objects.create(topic=self.topic, concept=self.concept, order_id=1)
        with self.assertRaises(IntegrityError):
            TopicIsAboutConcept.objects.create(topic=self.topic, concept=self.concept, order_id=1)

    def test_ordering(self):
        c2 = Concept.objects.create(name_es="C2", name_en="C2")
        TopicIsAboutConcept.objects.create(topic=self.topic, concept=self.concept, order_id=2)
        TopicIsAboutConcept.objects.create(topic=self.topic, concept=c2, order_id=1)
        concepts = list(self.topic.concepts.all().order_by('topicisaboutconcept__order_id'))
        self.assertEqual([c.name_es for c in concepts], ["C2", "C"])

class EpigraphModelAdditionalTests(TestCase):
    def setUp(self):
        self.topic = Topic.objects.create(title_es="T", title_en="T")

    def test_ordering_meta(self):
        Epigraph.objects.create(topic=self.topic, name_es="E2", name_en="E2", order_id=2)
        Epigraph.objects.create(topic=self.topic, name_es="E1", name_en="E1", order_id=1)
        epigraphs = list(Epigraph.objects.filter(topic=self.topic))
        self.assertEqual([e.order_id for e in epigraphs], [1, 2])

    def test_unique_together_id_and_topic(self):
        ep1 = Epigraph.objects.create(id=99, topic=self.topic, name_es="E", name_en="E", order_id=1)
        with self.assertRaises(IntegrityError):
            Epigraph.objects.create(id=99, topic=self.topic, name_es="E2", name_en="E2", order_id=2)