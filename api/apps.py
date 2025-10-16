from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    def ready(self):
        try:
            CustomUser = get_user_model()
            if not CustomUser.objects.filter(is_superuser=True).exists():
                CustomUser.objects.create_superuser(
                    username='admin',
                    email='admin@admin.com',
                    password='admin123',
                    role='superadmin'
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
