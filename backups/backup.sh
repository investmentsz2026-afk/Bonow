#!/bin/sh

# Directorio de backups
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/wynni_db_${TIMESTAMP}.sql"

echo "Iniciando respaldo de base de datos..."

# Crear directorio si no existe
mkdir -p ${BACKUP_DIR}

# Ejecutar pg_dump desde el contenedor de postgres
docker exec wynni-postgres pg_dump -U postgres -d WYNNI > ${BACKUP_FILE}

# Comprimir archivo
tar -czf ${BACKUP_FILE}.tar.gz -C ${BACKUP_DIR} "wynni_db_${TIMESTAMP}.sql"

# Eliminar archivo SQL sin comprimir
rm ${BACKUP_FILE}

# Mantener solo los últimos 7 días de respaldos (limpieza)
find ${BACKUP_DIR} -type f -name "*.tar.gz" -mtime +7 -delete

echo "Respaldo completado con éxito: ${BACKUP_FILE}.tar.gz"
