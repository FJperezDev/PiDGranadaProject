from rest_framework.test import APIRequestFactory
from django.test import TestCase
from django.urls import reverse 
from rest_framework import status
from django.contrib.auth import get_user_model

from backend.apps.customauth.teachers import CustomTeacher

CustomTeacher = get_user_model()

class SessionAuthTestCase(TestCase):

    factory = APIRequestFactory()

    def setUp(self):
        self.user_data = {
            "username": "fran",
            "email": "fran@ejemplo.com",
            "password": "1234"
        }
        # Creamos el usuario directamente (más rápido que llamar a RegisterView)
        self.user = CustomTeacher.objects.create_user(
            username=self.user_data["username"],
            email=self.user_data["email"],
            password=self.user_data["password"],
            is_super=True
        )
        self.login_url = reverse("login")
        self.logout_url = reverse("logout")
        self.profile_url = reverse("profile")
        
    def login(self):
        response = self.client.post(self.login_url, {
            "email": self.user_data["email"],
            "password": self.user_data["password"]
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Login Succesful')

    def test_logged_user_after_login(self):
        self.login()

        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user_data["email"])
        
    def test_logout_success(self):
        self.login()

        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Successfully logged out.")

    def test_logged_user_after_logout(self):
        self.login()
        self.client.post(self.logout_url)

        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)  
    
    def test_login_invalid_credentials(self):
        url = reverse("login")
        response = self.client.post(url, {
            "email": self.user_data["email"],
            "password": "wrongpass"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "Invalid credentials")

    def test_login_missing_fields(self):
        url = reverse("login")
        response = self.client.post(url, {
            "email": ""
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)