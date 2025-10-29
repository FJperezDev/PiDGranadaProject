from rest_framework import status
from rest_framework.test import APITestCase
from apps.content.domain import services
from apps.courses.api.models import Subject, StudentGroup, SubjectIsAboutTopic
from apps.customauth.models import CustomTeacher
from django.contrib.auth import get_user_model
from django.urls import reverse

CustomTeacher = get_user_model()

class SubjectViewSetTests(APITestCase):

    def setUp(self):
        self.subject = Subject.objects.create(
            name_es="Matemáticas",
            name_en="Mathematics",
            description_es="Descripción en español",
            description_en="Description in English"
        )
        self.teacher = CustomTeacher.objects.create(
            email="admin@admin.com",
            password="admin123",
            is_super=True,
            username="admin"
        )
        self.student_group = StudentGroup.objects.create(
            subject=self.subject,
            teacher=self.teacher,
        )
    
    def test_create_subject(self):
        response = self.client.post("/subjects/", {
            "name_es": "Física",
            "name_en": "Physics",
            "description_es": "Descripción de física",
            "description_en": "Description of physics"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_get_subjects(self):
        response = self.client.get("/subjects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.subject.name_es, [subject["name"] for subject in response.data])
    
    def test_update_subject(self):
        response = self.client.put(f"/subjects/{self.subject.id}/", {
            "name_es": "Matemáticas Avanzadas",
            "name_en": "Advanced Mathematics",
            "description_es": "Descripción actualizada",
            "description_en": "Updated description"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Matemáticas Avanzadas")
    
    def test_delete_subject(self):
        response = self.client.delete(f"/subjects/{self.subject.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_get_subject_detail(self):
        response = self.client.get(f"/subjects/{self.subject.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], self.subject.name_es)

    def test_create_subject_group(self):
        response = self.client.post(f"/subjects/{self.subject.id}/groups/", {
            "name_es": "Grupo de Matemáticas",
            "name_en": "Mathematics Group"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_subject_group(self):
        response = self.client.put(f"/subjects/{self.subject.id}/groups/{self.student_group.id}/", {
            "name_es": "Grupo de Matemáticas Modificado",
            "name_en": "Modified Mathematics Group"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Grupo de Matemáticas Modificado")

    def test_delete_subject_group(self):
        response = self.client.delete(f"/subjects/{self.subject.id}/groups/{self.student_group.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_get_subject_groups(self):
        response = self.client.get(f"/subjects/{self.subject.id}/groups/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.student_group.name_es, [group["name"] for group in response.data])

    def test_get_subject_group_detail(self):
        response = self.client.get(f"/subjects/{self.subject.id}/groups/{self.student_group.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], self.student_group.name_es)