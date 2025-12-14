from rest_framework import serializers
from .models import CustomTeacher
from django.contrib.auth.password_validation import validate_password

class CustomTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomTeacher
        fields = ['id', 'username', 'email', 'is_super']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    # Validamos la contraseña usando las reglas de Django
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    # Username es obligatorio según tus REQUIRED_FIELDS
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = CustomTeacher
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        # Usamos create_user en lugar de create() manual para asegurar 
        # que Django maneje el hasheo y normalización del email correctamente.
        user = CustomTeacher.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Nota: Tu método save() personalizado en el modelo se encargará 
        # de los permisos automáticamente aquí.
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual no es correcta.")
        return value

    def validate_new_password(self, value):
        # Valida la complejidad de la contraseña usando los validadores de Django settings
        validate_password(value)
        return value