from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from ..serializers import CustomTeacherSerializer, ChangePasswordSerializer
from ..models import CustomTeacher

import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from django.conf import settings

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, *args, **kwargs):
        user = request.user
        data = request.data.copy()
        
        old_password_input = data.get('old_password')
        new_password_input = data.get('new_password')

        if not settings.DEBUG:
            try:
                private_key_pem = settings.RSA_PRIVATE_KEY.encode('utf-8')
                private_key = serialization.load_pem_private_key(private_key_pem, password=None)

                def decrypt_field(encrypted_value):
                    if not encrypted_value: return ""
                    ciphertext = base64.b64decode(encrypted_value)
                    decrypted_bytes = private_key.decrypt(
                        ciphertext,
                        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
                    )
                    return decrypted_bytes.decode('utf-8')

                if old_password_input: data['old_password'] = decrypt_field(old_password_input)
                if new_password_input: data['new_password'] = decrypt_field(new_password_input)

            except Exception as e:
                return Response({'message': 'Encryption error'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ChangePasswordSerializer(data=data, context={'request': request})

        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Contraseña actualizada.'}, status=status.HTTP_200_OK)

        # Esto devuelve: {"new_password": ["This password is too common."]}
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoggedUserView(APIView):  
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        return Response(CustomTeacherSerializer(request.user).data, status=status.HTTP_200_OK)

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):

        username = request.data.get("username") 
        email = request.data.get("email")
        encrypted_password = request.data.get("password")
        
        if not encrypted_password and not (username or email):
            return Response({'message': 'Email or username and password are required'}, status=400)
        
        if not settings.DEBUG:
            try:
                private_key_pem = settings.RSA_PRIVATE_KEY.encode('utf-8') 
                
                private_key = serialization.load_pem_private_key(
                    private_key_pem,
                    password=None
                )

                # El frontend envía base64, decodificamos a bytes
                ciphertext = base64.b64decode(encrypted_password)

                decrypted_password_bytes = private_key.decrypt(
                    ciphertext,
                    padding.OAEP(
                        mgf=padding.MGF1(algorithm=hashes.SHA256()),
                        algorithm=hashes.SHA256(),
                        label=None
                    )
                )
                password = decrypted_password_bytes.decode('utf-8')
                
            except Exception as e:
                print(f"Error decrypting: {e}")
                return Response({'message': 'Encryption error or invalid payload'}, status=400)

        else:
            password = encrypted_password

        user = None            
        if username:
            email = CustomTeacher.objects.get(username=username).email
            request.data["email"] = email
            
        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response({'message': 'Invalid credentials'}, status=401)

        response = super().post(request)
        if response.status_code == status.HTTP_200_OK:
            response.data['message'] = 'Logged in successfully'
            # response.data['user'] = CustomTeacherSerializer(user).data
        else:
            response.data['error'] = str(response.status_code)

        return response

class LogoutView(APIView):
    permission_classes= [permissions.AllowAny]

    def post(self, request):
        response = Response()
        response.data = {'message': 'Logged out'}
        return response

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):

        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        if not email or not password or not username:
            return Response({'error': 'Email, username, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if CustomTeacher.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if CustomTeacher.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomTeacher(
            email=email,
            username=username,
            password=make_password(password)  # Hash the password before saving
        )
        user.save()

        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

