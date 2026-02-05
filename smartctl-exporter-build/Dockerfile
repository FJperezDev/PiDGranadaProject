# ETAPA 1: El Constructor (Compila el código)
FROM golang:1.23-alpine AS builder

# Descargamos y compilamos la versión oficial más reciente
RUN go install github.com/prometheus-community/smartctl_exporter@latest

# ETAPA 2: La Imagen Final (Ligera)
FROM alpine:latest

# Instalamos la herramienta smartctl (necesaria para leer el disco)
RUN apk add --no-cache smartmontools

# Copiamos solo el ejecutable que creamos en la etapa 1
COPY --from=builder /go/bin/smartctl_exporter /bin/smartctl_exporter

# Exponemos el puerto y ejecutamos
EXPOSE 9633
ENTRYPOINT ["/bin/smartctl_exporter"]
