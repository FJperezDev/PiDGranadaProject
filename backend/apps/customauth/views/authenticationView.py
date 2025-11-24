from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from ..serializers import CustomTeacherSerializer, ChangePasswordSerializer
from ..models import CustomTeacher

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, *args, **kwargs):
        user = request.user
        # Pasamos el request en el context para poder acceder al usuario dentro del serializer
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            # set_password se encarga de hashear la contraseña automáticamente
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {'message': 'Contraseña actualizada exitosamente.'}, 
                status=status.HTTP_200_OK
            )

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
        password = request.data.get("password")
        
        if not password and not (username or email):
            return Response({'message': 'Email or username and password are required'}, status=400)

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

