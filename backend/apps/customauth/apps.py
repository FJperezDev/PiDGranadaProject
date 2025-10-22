from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.customauth'
    
    def ready(self):
        try:
            CustomTeacher = get_user_model()
            if not CustomTeacher.objects.filter(is_superuser=True).exists():
                CustomTeacher.objects.create_superuser(
                    username='admin',
                    email='admin@admin.com',
                    password='admin123',
                    is_super=True
                )
                CustomTeacher.objects.create_user(
                    username='fran',
                    email='fran@gmail.com',
                    password='fran123',
                    is_super=False
                )
                print("Superuser created successfully.\n" \
                "Please change the password after logging in for the first time.    " \
                "This is a default superuser account.\n" \
                "You can log in with the following credentials:\n" \
                    "Username: admin\n" \
                    "Email: admin@admin.com\n" \
                    "Password: admin123")
        except (OperationalError, ProgrammingError):
            # Base de datos aún no está lista (por ejemplo al correr 'migrate')
            pass
