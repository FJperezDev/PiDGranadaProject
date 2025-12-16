import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError

class Command(BaseCommand):
    help = 'Crea usuarios iniciales predefinidos si no existen'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Lista de usuarios a crear
        # is_super=True usará create_superuser
        # is_super=False usará create_user
        users_data = [
            # --- SUPERUSUARIOS / ADMINS ---
            {
                'username': 'Admin',
                'email': 'admin@admin.com',
                'password': 'admin123',
                'is_super': True
            },
            {
                'username': 'Marilena',
                'email': 'marilena@ugr.es',
                'password': 'marilena',
                'is_super': True
            },
            {
                'username': 'Carlos',
                'email': 'calbacet@ugr.es',
                'password': 'calbacet',
                'is_super': True
            },
            {
                'username': 'Marcelino',
                'email': 'mcabrera@ugr.es',
                'password': 'mcabrera',
                'is_super': True
            },
            {
                'username': 'Araceli',
                'email': 'gallegoburin@ugr.es',
                'password': 'gallegoburin',
                'is_super': True
            },
            
            # --- USUARIOS NORMALES ---
            {
                'username': 'Fran',
                'email': 'fran@gmail.com',
                'password': 'fran123',
                'is_super': False
            }
        ]

        self.stdout.write('--- Verificando usuarios iniciales ---')
        User.objects.delete()

        for u in users_data:
            username = u['username']
            email = u['email']
            password = u['password']
            is_super = u['is_super']
            
            if User.objects.filter(email=email).exists():
                self.stdout.write(f'ℹ️ Email "{email}" ya está en uso por otro usuario. Saltando creación de "{username}"...')
                continue

            self.stdout.write(f'Creando usuario: {username} ({email})...')
            try:
                if is_super:
                    # Crear como Superusuario
                    User.objects.create_superuser(
                        username=username,
                        email=email,
                        password=password,
                        is_super=True,
                        is_active=True
                    )
                else:
                    # Crear como Usuario Normal
                    User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        is_super=False,
                        is_active=True
                    )
                
                self.stdout.write(self.style.SUCCESS(f'✅ {username} creado exitosamente.'))
            except IntegrityError as e:
                # Capturamos el error por si acaso hay una condición de carrera rara o datos sucios
                self.stdout.write(self.style.WARNING(f'⚠️ Error de integridad al crear {username}: {str(e)}. Probablemente ya existe.'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error creando {username}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS('--- Proceso de usuarios finalizado ---'))
