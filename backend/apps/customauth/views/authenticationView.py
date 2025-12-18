from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken 

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from ..serializers import CustomTeacherSerializer, ChangePasswordSerializer, RegisterSerializer
from ..models import CustomTeacher
from ..utils import decrypt_rsa_password

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
        
        # Usamos la utilidad
        if 'old_password' in data:
            data['old_password'] = decrypt_rsa_password(data['old_password'])
        if 'new_password' in data:
            data['new_password'] = decrypt_rsa_password(data['new_password'])

        # Si la desencriptación falló (retornó None), el serializer fallará o podemos validar aquí
        if data.get('new_password') is None:
             return Response({'message': 'Error de encriptación o contraseña vacía'}, status=400)

        serializer = ChangePasswordSerializer(data=data, context={'request': request})

        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Contraseña actualizada.'}, status=200)

        return Response(serializer.errors, status=400)

class LoggedUserView(APIView):  
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        return Response(CustomTeacherSerializer(request.user).data, status=status.HTTP_200_OK)

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # 1. Ahora esperamos EMAIL obligatoriamente, no username
        email = request.data.get("email")
        encrypted_password = request.data.get("password")
        
        if not email or not encrypted_password:
             return Response({'message': 'Email y contraseña son requeridos'}, status=400)

        # 2. Desencriptar (Usando la utilidad que creamos antes)
        password = decrypt_rsa_password(encrypted_password)
        
        if not password:
             return Response({'message': 'Error de encriptación'}, status=400)

        try:
            # Buscamos el usuario "a mano" para ver si existe
            user_manual = CustomTeacher.objects.get(email=email)
            print(f"✅ Usuario encontrado en DB: ID={user_manual.id}, Username={user_manual.username}, Email={user_manual.email}")
            
            # Verificamos el password "a mano"
            is_password_correct = user_manual.check_password(password)
            print(f"❓ check_password manual: {is_password_correct}")
            
        except CustomTeacher.DoesNotExist:
            print(f"❌ Usuario con email '{email}' NO EXISTE en la base de datos.")

        # 3. Autenticar
        # NOTA CRUCIAL: Aunque el parámetro se llama 'username', Django 
        # internamente lo mapea a tu USERNAME_FIELD (que es 'email').
        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response({'message': 'Credenciales inválidas'}, status=401)

        # 4. Generar Tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': CustomTeacherSerializer(user).data
        }, status=200)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy() 

        # 1. Desencriptar contraseña
        decrypted_pass = decrypt_rsa_password(data.get('password'))
        
        if not decrypted_pass:
            return Response({'error': 'Encryption failed'}, status=400)
            
        data['password'] = decrypted_pass

        # 2. Usar el RegisterSerializer actualizado
        serializer = RegisterSerializer(data=data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generar tokens para auto-login tras registro
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Usuario creado exitosamente',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': CustomTeacherSerializer(user).data
            }, status=201)
            
        return Response(serializer.errors, status=400)
      
class LogoutView(APIView):
    permission_classes= [permissions.AllowAny]

    def post(self, request):
        response = Response()
        response.data = {'message': 'Logged out'}
        return response

