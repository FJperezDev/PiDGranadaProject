import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Crea usuarios iniciales si no existen'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # 1. Datos del Super Admin (desde variables de entorno o valores por defecto seguros)
        admin_user = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        admin_email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@admin.com')
        admin_pass = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')

        if not User.objects.filter(username=admin_user).exists():
            self.stdout.write(f'Creando superusuario: {admin_user}...')
            User.objects.create_superuser(
                username=admin_user,
                email=admin_email,
                password=admin_pass,
                is_super=True,
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS('✅ Superusuario creado.'))
        else:
            self.stdout.write('ℹ️ Superusuario ya existe.')

        # 2. Datos del Usuario "Fran" (Demo/Profesor)
        # Puedes hardcodearlo aquí si es solo para desarrollo, o usar env vars también
        fran_user = 'fran'
        fran_email = 'fran@gmail.com'
        fran_pass = os.environ.get('DJANGO_FRAN_PASSWORD', 'fran123') # Mejor usar env var

        if not User.objects.filter(username=fran_user).exists():
            self.stdout.write(f'Creando usuario profesor: {fran_user}...')
            User.objects.create_user(
                username=fran_user,
                email=fran_email,
                password=fran_pass,
                is_active=True,
                is_super=False
            )
            self.stdout.write(self.style.SUCCESS('✅ Usuario Fran creado.'))
        else:
            self.stdout.write('ℹ️ Usuario Fran ya existe.')