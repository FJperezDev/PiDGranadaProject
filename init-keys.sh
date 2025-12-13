#!/bin/bash

echo "🔐 Generando par de claves RSA..."

# 1. Generar claves temporales
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private.pem -out public.pem

# 2. Convertir a Base64 para evitar problemas con saltos de línea en Docker
# La flag -w0 evita saltos de línea en el output base64
PRIVATE_KEY_B64=$(base64 -w0 private.pem) # En Mac usa: base64 -i private.pem
PUBLIC_KEY_B64=$(base64 -w0 public.pem)   # En Mac usa: base64 -i public.pem

# 3. Guardar en un archivo .env
# Si ya existe .env, hacemos un backup, si no, lo creamos
if [ -f .env ]; then
    # Actualizamos solo las llaves o las añadimos si no existen
    # (Esto es un método simple, sobreescribe el .env para este ejemplo)
    echo "⚠️  Sobreescribiendo claves en .env existente..."
fi

# Creamos el contenido del .env
cat <<EOF > .env
POSTGRES_DB=django_db
POSTGRES_USER=django
POSTGRES_PASSWORD=django123
RSA_PRIVATE_KEY_B64=$PRIVATE_KEY_B64
RSA_PUBLIC_KEY_B64=$PUBLIC_KEY_B64
EOF

# 4. Limpieza
rm private.pem public.pem

echo "✅ Claves generadas e inyectadas en .env"
echo "🚀 Levantando Docker Compose..."

# 5. Levantar Docker Compose
docker compose up -d --build