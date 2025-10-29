from django.test import TestCase
from django.db import IntegrityError, transaction
from apps.courses.api.models import Subject, StudentGroup, SubjectIsAboutTopic
from apps.customauth.models import CustomTeacher as Teacher

def teacher_factory():
    return Teacher.objects.create_user(username="teacher1", password="pass")

def subject_factory():
    return Subject.objects.create(name_es="Matemáticas", name_en="Mathematics", description_es="Descripción ES", description_en="Description EN")

class SubjectModelTests(TestCase):
    def test_str_returns_name_es(self):
        subject = subject_factory()
        self.assertEqual(str(subject), "Matemáticas")

    def test_str_falls_back_to_name_en(self):
        subject = Subject.objects.create(name_es="", name_en="Mathematics")
        self.assertEqual(str(subject), "Mathematics")

    def test_unique_names(self):
        Subject.objects.create(name_es="T1", name_en="T2")
        with self.assertRaises(IntegrityError):
            with transaction.atomic(): 
                Subject.objects.create(name_es="T1", name_en="T3")
        with self.assertRaises(IntegrityError):
            with transaction.atomic(): 
                Subject.objects.create(name_es="T3", name_en="T2")

class StudentGroupModelTests(TestCase):
    def setUp(self):
        self.subject = subject_factory()
        self.teacher = teacher_factory()

    def test_str_representation(self):
        group = StudentGroup.objects.create(name_es="Grupo A", name_en="Group A", subject=self.subject, groupCode="CODE123", teacher=self.teacher)
        self.assertEqual(str(group), "Grupo A (Matemáticas)")

    def test_unique_together_constraint(self):
        StudentGroup.objects.create(subject=self.subject, name_es="Grupo A", name_en="Group A", teacher=self.teacher)
        with self.assertRaises(IntegrityError):
            with transaction.atomic(): 
                StudentGroup.objects.create(subject=self.subject, name_es="Grupo A", name_en="Group B", teacher=self.teacher)