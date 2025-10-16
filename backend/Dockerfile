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
RUN chmod +x /entrypoint.sh

# Crea el usuario no root
RUN adduser --disabled-password django
USER django

# Expone el puerto (gunicorn servirá en el 8000)
EXPOSE 8000

# Usa el script como punto de entrada
ENTRYPOINT ["/entrypoint.sh"]
