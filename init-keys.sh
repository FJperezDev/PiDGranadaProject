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
EMAIL_USER=$EMAIL_USER
EMAIL_PASS=$EMAIL_PASS
EOF

# 5. Limpieza
rm private.pem public.pem
# No hace falta borrar secret.pem porque no lo creamos :)

echo "✅ Claves generadas e inyectadas en .env"
echo "🚀 Levantando Docker Compose..."

# 6. Levantar
docker compose up -d --build
