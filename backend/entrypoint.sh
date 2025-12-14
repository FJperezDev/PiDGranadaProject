#!/bin/sh
set -e

echo "Esperando a que la base de datos esté lista..."
until nc -z db 5432; do
  echo "Base de datos no disponible — esperando..."
  sleep 2
done

echo "Base de datos disponible ✅"

# 1. Iniciamos CRON (Ahora como root, usando el binario directamente y en background)
echo "Iniciando servicio cron..."
/usr/sbin/cron &

# 2. Ejecutamos migraciones COMO USUARIO DJANGO (usando gosu)
echo "Ejecutando migraciones..."
gosu django python manage.py makemigrations --noinput
gosu django python manage.py migrate --noinput

# 3. Tareas de limpieza iniciales
echo "Ejecutando tareas de mantenimiento (cron_jobs.sh)..."
# Ejecutamos el script como django
gosu django /cron_jobs.sh

echo "Arrancando servidor Gunicorn..."
# 4. Finalmente, arrancamos Gunicorn como usuario django
exec gosu django gunicorn config.wsgi:application --bind 0.0.0.0:8000
