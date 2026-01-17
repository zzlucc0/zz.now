#!/bin/bash

# MinIO Backup Script
# Usage: ./backup-minio.sh

set -e

# Configuration
BACKUP_DIR="/opt/mysite/backups/minio"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="minio_backup_${TIMESTAMP}"

# MinIO data directory
MINIO_DATA_DIR="/opt/mysite/data/minio"
# Alternative: use external mount
# MINIO_DATA_DIR="/mnt/data/mysite/minio"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting MinIO backup..."
echo "Source: $MINIO_DATA_DIR"
echo "Destination: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# Create tar backup with compression
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" -C "$(dirname $MINIO_DATA_DIR)" "$(basename $MINIO_DATA_DIR)"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "✓ Backup created successfully: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
  
  # Calculate backup size
  SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)
  echo "✓ Backup size: $SIZE"
  
  # Remove old backups
  echo "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
  find "$BACKUP_DIR" -name "minio_backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete
  
  echo "✓ Backup completed successfully"
else
  echo "✗ Backup failed"
  exit 1
fi

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR" | tail -n 5
