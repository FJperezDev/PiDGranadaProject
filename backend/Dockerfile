FROM python:3.11-slim

# Configuración de Python
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Dependencias del sistema
RUN apt-get update && \
    apt-get install -y build-essential libpq-dev --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copiar y instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el proyecto
COPY . .

# Configuración de Django
ENV DJANGO_SETTINGS_MODULE=backend.settings

# Crear usuario de la aplicación y cambiar a él
RUN addgroup --system app && adduser --system --ingroup app app

RUN mkdir -p /app/backend/staticfiles \
    && chown -R app:app /app/backend/staticfiles

USER app
