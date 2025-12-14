#!/bin/sh
set -e

echo "Esperando a que la base de datos esté lista..."
until nc -z db 5432; do
  echo "Base de datos no disponible — esperando..."
  sleep 2
done

echo "Base de datos disponible ✅"

# 1. Iniciamos CRON (Como somos root, esto ahora funcionará)
echo "Iniciando servicio cron..."
service cron start

# 2. Ejecutamos migraciones COMO USUARIO DJANGO (usando gosu)
# Si lo hacemos como root, los archivos creados darán problemas de permisos después.
echo "Ejecutando migraciones..."
gosu django python manage.py makemigrations --noinput
gosu django python manage.py migrate --noinput

# 3. Tareas de limpieza iniciales
echo "Ejecutando tareas de mantenimiento (cron_jobs.sh)..."
# Ejecutamos el script como django
gosu django /cron_jobs.sh

echo "Arrancando servidor Gunicorn..."
# 4. Finalmente, arrancamos Gunicorn como usuario django
# 'exec' asegura que gunicorn reciba las señales de parada de Docker (SIGTERM)
exec gosu django gunicorn config.wsgi:application --bind 0.0.0.0:8000