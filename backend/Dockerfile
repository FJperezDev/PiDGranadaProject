# Imagen base oficial de Python
FROM python:3.12-slim

# Evita archivos pyc y buffers de salida
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Crea y entra al directorio del proyecto
WORKDIR /app

# Instala dependencias del sistema y gosu (CRÍTICO)
RUN apt-get update && apt-get install -y build-essential libpq-dev netcat-openbsd cron gosu

# Copia los requirements
COPY requirements.txt .

# Instala dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# --- CREACIÓN DE USUARIO Y PERMISOS ---
# 1. Creamos el usuario 'django'
RUN adduser --disabled-password django

# 2. Copia todo el proyecto
COPY . .

# 3. Asignamos la propiedad de /app al usuario 'django'
RUN chown -R django:django /app

# 4. Copia los scripts y les da permisos
COPY entrypoint.sh /entrypoint.sh
COPY cron_jobs.sh /cron_jobs.sh
RUN chmod +x /entrypoint.sh /cron_jobs.sh

# --- CONFIGURACIÓN CRONTAB (Usar archivo estático) ---
COPY django_cron /etc/cron.d/django_cron
# Da permisos y crea el archivo de log 
RUN chmod 0644 /etc/cron.d/django_cron && touch /var/log/cron.log
# --- FIN CRONTAB ---

# ELIMINAR: Eliminamos 'USER django'. El contenedor se ejecutará como root.
# USER django 

# Expone el puerto (gunicorn servirá en el 8000)
EXPOSE 8000

# Usa el script como punto de entrada
ENTRYPOINT ["/entrypoint.sh"]
