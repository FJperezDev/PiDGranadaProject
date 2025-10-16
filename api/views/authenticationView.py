from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from ..serializers import CustomUserSerializer
from ..models import CustomUser


class LoggedUserView(APIView):  
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        return Response(CustomUserSerializer(request.user).data, status=status.HTTP_200_OK)

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Aquí validas usuario y contraseña (o usas serializer)
        user = authenticate(email=request.data['email'], password=request.data['password'])
        if user is None:
            return Response({'message': 'Invalid credentials'}, status=401)

        response = super().post(request)
        if response.status_code == status.HTTP_200_OK:
            response.data['message'] = 'Logged in successfully'
            # response.data['user'] = CustomUserSerializer(user).data
        else:
            response.data['error'] = str(response.status_code)

        return response

class LogoutView(APIView):
    permission_classes= [permissions.AllowAny]

    def post(self, request):
        response = Response()
        response.data = {'message': 'Logged out'}
        return response

class LogoutAllView(APIView):
    permission_classes= [permissions.AllowAny]

    def post(self, request):
        tokens = OutstandingToken.objects.filter(user=request.user)

        for token in tokens:
            try:
                # Agrega a la blacklist si aún no está
                BlacklistedToken.objects.get_or_create(token=token)
            except Exception:
                pass  # puedes registrar el error si lo deseas

        return Response({"message": "All tokens revoked"}, status=200)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):

        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        if not email or not password or not username:
            return Response({'error': 'Email, username, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if CustomUser.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if CustomUser.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser(
            email=email,
            username=username,
            password=make_password(password)  # Hash the password before saving
        )
        user.save()

        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

