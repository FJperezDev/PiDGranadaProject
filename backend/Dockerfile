# Imagen base oficial de Python
FROM python:3.12-slim

# Evita archivos pyc y buffers de salida
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Crea y entra al directorio del proyecto
WORKDIR /app

# --- CORRECCIÓN AQUÍ ---
# Agregamos 'cron' a la lista de instalación
RUN apt-get update && apt-get install -y build-essential libpq-dev netcat-openbsd cron

# Copia los requirements
COPY requirements.txt .

# Instala dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el proyecto
COPY . .

# Copia el entrypoint y scripts
COPY entrypoint.sh /entrypoint.sh
COPY cron_jobs.sh /cron_jobs.sh
RUN chmod +x /entrypoint.sh /cron_jobs.sh

# Crea el usuario no root PRIMERO para poder asignar permisos
RUN adduser --disabled-password django

# --- CORRECCIÓN AQUÍ ---
# 1. Crear el archivo de log para que exista.
# 2. Darle permisos al usuario django, ya que él ejecutará el cron.
RUN touch /var/log/cron.log && chown django:django /var/log/cron.log

# CONFIGURACIÓN DE CRONTAB
# Nota: Al ejecutarse como usuario django, este crontab será del usuario, no de root.
RUN (crontab -l 2>/dev/null; echo "0 0 * * * /cron_jobs.sh >> /var/log/cron.log 2>&1") | crontab -u django -

# Cambiamos al usuario
USER django

# Expone el puerto
EXPOSE 8000

# Usa el script como punto de entrada
ENTRYPOINT ["/entrypoint.sh"]