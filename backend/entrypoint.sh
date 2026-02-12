#!/bin/sh
set -e

echo "Esperando a que la base de datos esté lista (comprobación real)..."

python << END
import sys
import time
import psycopg2
import os

# Loop infinito hasta que Postgres responda a través de PgBouncer
while True:
    try:
        conn = psycopg2.connect(
            dbname="${DB_NAME:-django_db}",
            user="${DB_USER:-django}",
            password="${DB_PASSWORD:-django123}",
            host="pgbouncer",
            port=5432,
            connect_timeout=3
        )
        conn.close()
        print("✅ ¡Conexión exitosa a Postgres a través de PgBouncer!")
        break
    except psycopg2.OperationalError as e:
        print(f"⏳ PgBouncer responde, pero Postgres aún no está listo... ({e})")
        time.sleep(3)
END

echo "Base de datos disponible. Iniciando..."

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

echo "Arrancando servidor Gunicorn modo gevent..."
# --- EXPLICACIÓN DE LA CONFIGURACIÓN ---
# --workers 5: (Num_Cores + 1). La Pi tiene 4 cores. 5 workers mantienen la CPU ocupada.
# --worker-class gevent: CAMBIO CLAVE. Usa corrutinas ligeras en lugar de hilos pesados.
# --worker-connections 1000: Cada worker puede manejar 1000 alumnos "esperando" a la vez.
# --timeout 120: Si PgBouncer tiene cola, esperamos pacientemente 2 minutos sin fallar.
# --keep-alive 60: Cerramos conexiones HTTP inactivas lento (consume más recursos en la pi pero reutiliza para el router).

exec gosu django gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 5 \
    --threads 12 \
    --worker-class gthread \
    --worker-tmp-dir /dev/shm \
    --backlog 4096 \
    --timeout 15 \
    --keep-alive 5 \
    --log-level error
