from rest_framework import serializers
from .models import CustomTeacher
from django.contrib.auth.password_validation import validate_password

class CustomTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomTeacher
        fields = ['id', 'username', 'email', 'is_super']
        read_only_fields = ['id']

class CustomTeacherManageSerializer(serializers.ModelSerializer):
    """Serializer usado por SuperTeacher para crear y editar otras cuentas."""
    # La contraseña es opcional para la edición (PUT/PATCH), pero write_only.
    password = serializers.CharField(
        write_only=True, 
        required=False, 
        validators=[validate_password]
    )
    
    # is_super es editable, no read-only.

    class Meta:
        model = CustomTeacher
        fields = ['id', 'username', 'email', 'is_super', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        # Usamos create_user para hashear la contraseña y crear el usuario.
        password = validated_data.pop('password', None)
        
        if not password:
             raise serializers.ValidationError("La contraseña es obligatoria para crear un usuario.")

        user = CustomTeacher.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            is_super=validated_data.get('is_super', False)
        )
        return user

    def update(self, instance, validated_data):
        # Permite actualizar la contraseña si se proporciona
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        
        # Actualiza el resto de los campos (incluyendo is_super)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.save()
        return instance

class CustomTeacherInviteSerializer(CustomTeacherManageSerializer):
    """
    Serializer usado por SuperTeacher para invitar (crear) usuarios.
    Elimina los validadores de password para permitir contraseñas temporales cortas.
    """
    password = serializers.CharField(
        write_only=True, 
        required=True, # La contraseña es obligatoria para la creación
        validators=[] # <--- CRÍTICO: Anulamos la validación de Django
    )

    class Meta(CustomTeacherManageSerializer.Meta):
        # Aseguramos que los campos se mantienen igual, solo cambia la validación
        fields = CustomTeacherManageSerializer.Meta.fields
        read_only_fields = CustomTeacherManageSerializer.Meta.read_only_fields

    # El método create() hereda el CustomTeacher.objects.create_user seguro 
    # de CustomTeacherManageSerializer, que usa set_password.

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