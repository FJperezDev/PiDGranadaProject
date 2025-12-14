#!/bin/bash

# Este script debe ser copiado dentro del contenedor Docker

# Ruta base de los backups dentro del contenedor
BACKUP_DIR="/app/media/backups"

# Comando para ejecutar la generación del backup (usando la función is_auto=True)
GENERATE_CMD="/usr/local/bin/python /app/manage.py shell -c 'from apps.audit.utils import generate_excel_backup; generate_excel_backup(is_auto=True)'"

# Lógica de Crontab:
# Se ejecuta el día 1 de cada mes (0 0 1 * *)

echo "Iniciando script de tareas programadas..."

# --- TAREA 1: GENERACIÓN MENSUAL (Día 1 del mes a las 00:00) ---
#if [[ "$(date +%d)" == "01" ]]; then
    echo "Ejecutando generación de backup mensual..."
    $GENERATE_CMD
    echo "Generación de backup completada."
#fi

# --- TAREA 2: LIMPIEZA DE ARCHIVOS ANTIGUOS (Más de 4 meses) ---
# Borra archivos .xlsx con fecha de modificación (mtime) mayor a 120 días (aprox. 4 meses)
# Usamos "find" para buscar y borrar de forma segura.
echo "Buscando backups más antiguos de 4 meses (120 días) para limpiar..."

# Creamos la carpeta si no existe (importante para find)
mkdir -p "$BACKUP_DIR"

# El comando 'find' busca archivos *.xlsx en $BACKUP_DIR modificados hace +120 días y los borra
find "$BACKUP_DIR" -type f -name "*.xlsx" -mtime +120 -exec rm {} \;

echo "Limpieza de backups completada."

# Nota: Este script se ejecutará cada vez que se inicie el contenedor, 
# pero las tareas mensuales/diarias se gestionarán externamente con cron.
