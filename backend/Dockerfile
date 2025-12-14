# Imagen base oficial de Python
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 1. Instalamos cron Y gosu (gosu nos ayuda a bajar de root a django)
RUN apt-get update && apt-get install -y build-essential libpq-dev netcat-openbsd cron gosu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY entrypoint.sh /entrypoint.sh
COPY cron_jobs.sh /cron_jobs.sh
RUN chmod +x /entrypoint.sh /cron_jobs.sh

# Crea el usuario no root
RUN adduser --disabled-password django

# Configurar logs de cron
RUN touch /var/log/cron.log && chown django:django /var/log/cron.log

# Configurar Crontab para el usuario django
RUN (crontab -l 2>/dev/null; echo "0 0 * * * /cron_jobs.sh >> /var/log/cron.log 2>&1") | crontab -u django -

# --- CAMBIO IMPORTANTE ---
# ELIMINAMOS o COMENTAMOS 'USER django'.
# Necesitamos ser root al inicio para que el entrypoint arranque el servicio cron.
# USER django 

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]