# --- ETAPA DE BUILD ---
FROM node:20-alpine as builder

WORKDIR /app

# Copiamos dependencias
COPY package.json package-lock.json ./

# Instalamos dependencias
RUN npm ci

# --- AQUÍ ESTÁ LA MAGIA ---
# 1. Declaramos que esperamos este argumento desde el docker-compose
ARG EXPO_PUBLIC_KEY_B64 

# 2. Lo establecemos como variable de entorno persistente para el build
ENV EXPO_PUBLIC_KEY_B64=$EXPO_PUBLIC_KEY_B64
# --------------------------

# Copiamos el código fuente
COPY . .

# IMPORTANTE: Instalamos las dependencias web de Expo por si faltan
RUN npx expo install react-dom react-native-web @expo/metro-runtime

# Construimos la versión web estática
# Esto generará una carpeta "dist"
RUN npx expo export --platform web

# --- ETAPA DE SERVIDOR ---
FROM nginx:alpine

# Configuración para SPA (Single Page App)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos generados en la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
