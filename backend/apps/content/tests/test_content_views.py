from rest_framework import status
from rest_framework.test import APITestCase
from apps.content.domain import services
from apps.content.api.models import Topic, Epigraph, Concept
from django.contrib.auth import get_user_model

CustomTeacher = get_user_model()

class TopicViewSetTests(APITestCase):

    def setUp(self):
        self.teacher = CustomTeacher.objects.create_user(username="testteacher", password="password", is_super=True)
        self.client.force_authenticate(user=self.teacher)
        self.topic = Topic.objects.create(title_es="Tema", title_en="Topic")
        self.epigraph_data = {
            "name_es": "Epígrafe",
            "name_en": "Epigraph",
            "order_id": 1,
            "description_es": "Descripción del epígrafe",
            "description_en": "Epigraph description"
        }
        self.updated_epigraph_data = {
            "name_es": "Epígrafe Actualizado",
            "name_en": "Updated Epigraph",
            "order_id": 3,
            "description_es": "Descripción del epígrafe",
            "description_en": "Epigraph description"
        }
        self.concept_data = {
            "concept_name": "Concepto",
            "order_id": 1
        }
        self.epigraph = services.create_epigraph(
            self.topic,
            name_es="Epígrafe B",
            teacher=self.teacher,  
            name_en="Epigraph B",
            order_id=2,
            description_es="Descripción del epígrafe",
            description_en="Epigraph description"
        )
            
    def test_create_topic(self):
        response = self.client.post("/topics/", {
            "title_es": "Nuevo Tema",
            "title_en": "New Topic",
            "description_es": "Descripción del nuevo tema",
            "description_en": "Description of the new topic"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_topics(self):
        response = self.client.get("/topics/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.topic.title_es, [topic["title"] for topic in response.data])

    def test_create_epigraph(self):
        response = self.client.post(f"/topics/{self.topic.id}/epigraphs/", self.epigraph_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], self.epigraph_data["name_es"]) 

    def test_update_epigraph(self):
        response = self.client.put(f"/topics/{self.topic.id}/epigraphs/{self.epigraph.order_id}/", self.updated_epigraph_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name_es"], "Epígrafe Actualizado")

    def test_link_concept(self):
        concept = Concept.objects.create(name_es="Concepto", name_en="Concept")
        response = self.client.post(f"/topics/{self.topic.id}/concepts/", {
            "concept_name": concept.name_es,
            "order_id": 1
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Concept linked to topic successfully", response.data["message"])

    def test_unlink_concept(self):
        concept = Concept.objects.create(name_es="Concepto", name_en="Concept")
        self.client.post(f"/topics/{self.topic.id}/concepts/", {
            "concept_name": concept.name_es,
            "order_id": 1
        }, format="json")
        response = self.client.delete(f"/topics/{self.topic.id}/concepts/", {
            "concept_name": concept.name_es
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Concept linked to topic removed successfully", response.data["message"])

class EpigraphViewSetTests(APITestCase):
    def setUp(self):
        self.teacher = CustomTeacher.objects.create_user(username="testteacher2", password="password", is_super=True)
        self.client.force_authenticate(user=self.teacher) 
        self.topic = Topic.objects.create(title_es="Tema", title_en="Topic")
        self.epigraph = services.create_epigraph(
            self.topic,
            name_es="Epígrafe",
            name_en="Epigraph",
            order_id=1,
            description_es="Descripción del epígrafe",
            description_en="Epigraph description",
            teacher=self.teacher
        )

    def test_get_epigraphs(self):
        response = self.client.get(f"/topics/{self.topic.id}/epigraphs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.epigraph.name_es, [epigraph["name"] for epigraph in response.data])

class ConceptViewSetTests(APITestCase):
    def setUp(self):
        self.topic = Topic.objects.create(title_es="Tema", title_en="Topic")
        self.concept = Concept.objects.create(name_es="Concepto", name_en="Concept")
        services.link_concept_to_topic(self.topic, self.concept, order_id=1)

    def test_get_concepts(self):
        response = self.client.get(f"/topics/{self.topic.id}/concepts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.concept.name_es, [concept["name"] for concept in response.data])

    def test_get_concept_detail(self):
        response = self.client.get(f"/concepts/{self.concept.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], self.concept.name_es)