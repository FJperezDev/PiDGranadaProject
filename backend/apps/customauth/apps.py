from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError
from django.conf import settings

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.customauth'
    
    def ready(self):
        # if settings.DEBUG:
        try:
            CustomTeacher = get_user_model()
            if not CustomTeacher.objects.filter(is_superuser=True).exists():
                CustomTeacher.objects.create_superuser(
                    username='admin',
                    email='admin@admin.com',
                    password='admin123',
                    is_super=True,
                    is_active=True
                )
                CustomTeacher.objects.create_user(
                    username='fran',
                    email='fran@gmail.com',
                    password='fran123',
                    is_active=True,
                    is_super=False
                )
        except (OperationalError, ProgrammingError):
            # Base de datos aún no está lista (por ejemplo al correr 'migrate')
            pass
