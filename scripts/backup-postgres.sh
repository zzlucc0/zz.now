#!/bin/bash

# PostgreSQL Backup Script
# Usage: ./backup-postgres.sh

set -e

# Configuration
BACKUP_DIR="/opt/mysite/backups/postgres"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="postgres_backup_${TIMESTAMP}.sql.gz"

# Database credentials (from environment or defaults)
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-personal_platform}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting PostgreSQL backup..."
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Create backup using pg_dump
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -Fc \
  "$DB_NAME" | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "✓ Backup created successfully: ${BACKUP_DIR}/${BACKUP_FILE}"
  
  # Calculate backup size
  SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
  echo "✓ Backup size: $SIZE"
  
  # Remove old backups
  echo "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
  find "$BACKUP_DIR" -name "postgres_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
  
  echo "✓ Backup completed successfully"
else
  echo "✗ Backup failed"
  exit 1
fi

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR" | tail -n 5
