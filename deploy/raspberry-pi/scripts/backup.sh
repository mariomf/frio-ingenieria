#!/usr/bin/env bash
# Backup diario de la base de datos hacia el SSD (y opcional copia externa).
# Programar con cron:  0 3 * * *  /ruta/deploy/raspberry-pi/scripts/backup.sh
set -euo pipefail

cd "$(dirname "$0")/.."
set -a; source ./.env; set +a

DB="${POSTGRES_DB:-postgres}"
DEST="${BACKUP_DIR:-./backups}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$DEST"
FILE="$DEST/frio_${STAMP}.sql.gz"

echo ">> Respaldando $DB -> $FILE"
docker exec -i frio-db pg_dump -U postgres -d "$DB" | gzip > "$FILE"

echo ">> Limpiando backups de mas de ${KEEP_DAYS} dias"
find "$DEST" -name 'frio_*.sql.gz' -mtime +"$KEEP_DAYS" -delete

# Copia externa opcional (rsync/rclone). Descomenta y configura:
# rclone copy "$FILE" remoto:frio-backups/

echo "OK: backup completado ($FILE)"
