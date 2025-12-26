#!/bin/bash

# Detectar el sistema operativo para usar el comando base64 correcto
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OS
    B64_CMD="base64 -i -"
else
    # Linux / Windows Git Bash
    B64_CMD="base64 -w0"
fi

echo "🔐 Generando par de claves RSA..."

# 1. Generar claves RSA (Archivos temporales necesarios)
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private.pem -out public.pem

# 2. Convertir a Base64 (Para manejar los saltos de línea en el .env)
# Usamos 'cat' y tubería (|) para que funcione con la detección de OS de arriba
PRIVATE_KEY_B64=$(cat private.pem | $B64_CMD)
PUBLIC_KEY_B64=$(cat public.pem | $B64_CMD)

# 3. Generar DJANGO_SECRET_KEY directa (Sin archivo temporal)
# Usamos -hex para evitar caracteres raros (+, /, =) que rompen .env a veces
DJANGO_SECRET_KEY=$(openssl rand -hex 50)

# 4. Guardar en .env
echo "📝 Escribiendo archivo .env..."

cat <<EOF > .env
POSTGRES_DB=django_db
POSTGRES_USER=django
POSTGRES_PASSWORD=django123
RSA_PRIVATE_KEY_B64=$PRIVATE_KEY_B64
RSA_PUBLIC_KEY_B64=$PUBLIC_KEY_B64
DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY
DJANGO_DEBUG=False
DOMAIN_NAME=franjpg.com
EMAIL_USER=asdasdasd
EMAIL_PASS=asdasdasd
EOF

# 5. Limpieza
rm private.pem public.pem
# No hace falta borrar secret.pem porque no lo creamos :)

echo "📱 Configuración de Expo (Para generar APKs)"
echo "   Necesitas una cuenta en expo.dev y generar un Access Token en tus ajustes."
echo "   Si no tienes cuenta, deja esto vacío (no se generarán APKs)."
read -p "Introduce tu EXPO_TOKEN: " EXPO_TOKEN_INPUT

if [ ! -z "$EXPO_TOKEN_INPUT" ]; then
    # Añadimos el token al .env
    echo "EXPO_TOKEN=$EXPO_TOKEN_INPUT" >> .env
    
    # Preparamos la carpeta de destino
    mkdir -p ./backend/media/apks
    # Creamos archivos vacíos para que Docker pueda montar los volúmenes (truco de docker)
    touch ./backend/media/apks/teacher.apk
    touch ./backend/media/apks/student.apk
    chmod -R 777 ./backend/media/apks

    echo "🏗️  Construyendo imágenes secuencialmente (Optimizado para Pi)..."
    
    # Construir builders APK primero
    echo "   - Building APK Builders..."
    docker compose build --build-arg EXPO_TOKEN=$EXPO_TOKEN_INPUT teacher_apk_builder
    docker compose build --build-arg EXPO_TOKEN=$EXPO_TOKEN_INPUT student_apk_builder

    echo "🚀 Generando APKs (Profile 'apks')..."
    # Ejecutamos SOLO los builders y esperamos a que terminen (sin -d)
    # Al no poner -d, el script esperará a que terminen su tarea y salgan.
    docker compose --profile apks up
    
    echo "✅ Generación de APKs finalizada."
else
    echo "⚠️  Sin EXPO_TOKEN. Se levantará el sistema SIN generar nuevos APKs."
fi

echo "🏗️  Construyendo imágenes de infraestructura..."
docker compose build backend
docker compose build frontend_teacher
docker compose build frontend_student

echo "🚀 Levantando infraestructura final (Profile 'build')..."
# Levantamos el resto de servicios en segundo plano
docker compose --profile build up -d

echo "🎉 ¡Todo listo! Tu sistema está corriendo."
