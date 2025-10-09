from .base import *

DEBUG = False

if not SECRET_KEY or 'insecure-development' in SECRET_KEY:
    raise RuntimeError("SECRET_KEY inseguro: define DJANGO_SECRET_KEY env o /run/secrets/django_secret_key")

ALLOWED_HOSTS = [h for h in os.environ.get('ALLOWED_HOSTS','').split(',') if h]
if not ALLOWED_HOSTS:
    raise RuntimeError("ALLOWED_HOSTS no definido. Establece ALLOWED_HOSTS en el entorno.")

# Security settings
SECURE_SSL_REDIRECT = True                       # redirige HTTP->HTTPS
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = int(os.environ.get('SECURE_HSTS_SECONDS', 31536000))  # 1 año por defecto
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.environ.get('SECURE_HSTS_INCLUDE_SUBDOMAINS','True') == 'True'
SECURE_HSTS_PRELOAD = os.environ.get('SECURE_HSTS_PRELOAD','True') == 'True'
X_FRAME_OPTIONS = 'DENY'

# Proxy headers (Traefik / nginx suelen añadir X-Forwarded-Proto)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# CSRF_TRUSTED_ORIGINS: Django requiere esquema+host, ejemplo: https://example.com
cs_roots = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
if cs_roots:
    CSRF_TRUSTED_ORIGINS = [x.strip() for x in cs_roots.split(',') if x.strip()]

# DATABASES override para Postgres (leer variables de entorno)
if os.environ.get('DB_ENGINE') == 'django.db.backends.postgresql':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ['POSTGRES_DB'],
            'USER': os.environ['POSTGRES_USER'],
            'PASSWORD': os.environ['POSTGRES_PASSWORD'],
            'HOST': os.environ.get('DB_HOST', 'db'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'CONN_MAX_AGE': int(os.environ.get('CONN_MAX_AGE', 600)),
        }
    }

# Static files: use WhiteNoise in simple deployments
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')  # justo después de SecurityMiddleware
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Opcional: limitar tamaño de subida
DATA_UPLOAD_MAX_MEMORY_SIZE = int(os.environ.get('DATA_UPLOAD_MAX_MEMORY_SIZE', 10485760))  # 10MB default
