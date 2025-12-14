# Imagen base oficial de Python
FROM python:3.12-slim

# Evita archivos pyc y buffers de salida
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Crea y entra al directorio del proyecto
WORKDIR /app

# Instala dependencias del sistema
RUN apt-get update && apt-get install -y build-essential libpq-dev netcat-openbsd

# Copia los requirements
COPY requirements.txt .

# Instala dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el proyecto
COPY . .

# Copia el entrypoint
COPY entrypoint.sh /entrypoint.sh
COPY cron_jobs.sh /cron_jobs.sh
RUN chmod +x /entrypoint.sh /cron_jobs.sh

# CONFIGURACIÓN DE CRONTAB: Ejecutar cron_jobs.sh diariamente
# 0 0 * * * -> Ejecutar cada día a medianoche (00:00)
# Esto es más seguro que usar el cron interno de Linux.
RUN (crontab -l 2>/dev/null; echo "0 0 * * * /cron_jobs.sh >> /var/log/cron.log 2>&1") | crontab -

# Crea el usuario no root
RUN adduser --disabled-password django
USER django

# Expone el puerto (gunicorn servirá en el 8000)
EXPOSE 8000

# Usa el script como punto de entrada
ENTRYPOINT ["/entrypoint.sh"]
