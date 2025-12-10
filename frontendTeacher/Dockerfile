# ETAPA 1: Construcción (Build)
# Usamos una imagen de Node para compilar los archivos
FROM node:18-alpine as builder

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias primero (para aprovechar el caché de Docker)
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm ci

# Copiamos el resto del código fuente
COPY . .

# Construimos la aplicación para producción
RUN npm run build


# ETAPA 2: Servidor Web (Producción)
# Usamos Nginx para servir los archivos estáticos (muy ligero)
FROM nginx:alpine

# Copiamos la configuración de Nginx (crearemos este archivo en el paso 2)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos construidos (dist) de la etapa anterior a la carpeta de Nginx
# NOTA: Si usas Create React App, cambia --from=builder /app/dist a /app/build
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]