from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.customauth.models import CustomTeacher
from apps.customauth.views import LoginView

class LoginViewTests(APITestCase):
    def setUp(self):
        self.username = "admin"
        self.email = "admin@admin.com"
        self.password = "admin123"
        self.user = CustomTeacher.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password
        )
        self.login_url = reverse('customauth:login')

    def test_login_with_username_and_password(self):
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['message'], 'Logged in successfully')

    def test_login_with_email_and_password(self):
        data = {
            "email": self.email,
            "password": self.password
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['message'], 'Logged in successfully')

    def test_login_with_invalid_credentials(self):
        data = {
            "username": self.username,
            "password": "wrongpassword"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['message'], 'Invalid credentials')

    def test_login_missing_fields(self):
        data = {
            "username": "",
            "email": "",
            "password": ""
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Email or username and password are required')

    def get_access_token(self):
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(self.login_url, data, format='json')
        return response.data.get('access')