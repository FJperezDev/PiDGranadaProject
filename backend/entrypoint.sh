#!/bin/sh
set -e

echo "Esperando a que la base de datos esté lista..."
# Espera a que el servicio db responda
until nc -z db 5432; do
  echo "Base de datos no disponible — esperando..."
  sleep 2
done

echo "Base de datos disponible ✅"

# Iniciamos el demonio cron en segundo plano.
echo "Iniciando servicio cron..."
/usr/sbin/cron

# Ejecuta las migraciones automáticamente
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Llama al script de cron para realizar la limpieza de archivos viejos 
# y la posible generación si es día 1.
echo "Ejecutando tareas de mantenimiento y limpieza (cron_jobs.sh)..."
/cron_jobs.sh

# (opcional) collectstatic si usas archivos estáticos
# python manage.py collectstatic --noinput

echo "Arrancando servidor Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000
