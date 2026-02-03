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

python manage.py collectstatic --noinput

# 2. Ejecutamos migraciones COMO USUARIO DJANGO (usando gosu)
echo "Ejecutando migraciones..."
gosu django python manage.py makemigrations --noinput
gosu django python manage.py migrate --noinput

echo "Verificando/Creando usuarios iniciales..."
gosu django python manage.py init_users

# 3. Tareas de limpieza iniciales
echo "Ejecutando tareas de mantenimiento (cron_jobs.sh)..."
# Ejecutamos el script como django
gosu django /cron_jobs.sh

echo "Arrancando servidor Gunicorn (Modo Turbo para Pi 5)..."
# 4. Finalmente, arrancamos Gunicorn optimizado
# --workers 5:  (2 x Num_Cores) + 1. La Pi tiene 4 cores, ponemos 5 para dejar CPU a Postgres.
# --threads 4:  Cada worker maneja 4 hilos. Ayuda mucho cuando se espera a la DB (I/O bound).
# --worker-class gthread: Necesario para usar hilos.
# --timeout 60: Damos 60s antes de matar un proceso (por si la Pi se satura momentáneamente).
# --keep-alive 5: Cierra conexiones inactivas rápido para liberar hueco a los 300 alumnos.

exec gosu django gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 5 \
    --threads 4 \
    --worker-class gthread \
    --timeout 60 \
    --keep-alive 5