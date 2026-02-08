# Production Deployment Runbook

This guide provides step-by-step instructions for deploying the Personal Platform to your home Ubuntu server using Docker.

## Prerequisites

### Server Requirements
- **OS**: Ubuntu Server 22.04 LTS or 24.04 LTS
- **RAM**: Minimum 2GB (4GB+ recommended)
- **Storage**: 20GB+ available
- **Network**: Static IP or DDNS configured
- **Domain**: Optional but recommended (for HTTPS via Let's Encrypt or Cloudflare)

### Required Software
- Docker Engine 24.0+
- Docker Compose V2
- Git
- UFW firewall (or iptables)

---

## Step 1: Initial Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Create Deploy User
```bash
# Create non-root user for deployment
sudo adduser deploy
sudo usermod -aG sudo deploy
sudo usermod -aG docker deploy

# Switch to deploy user
su - deploy
```

### 1.3 Install Docker
```bash
# Install Docker using official script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Enable and start Docker
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
docker compose version
```

### 1.4 Configure Firewall
```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT: do this first!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS (if using Nginx Proxy Manager)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Optional: Allow direct access to services (for testing)
# sudo ufw allow 3000/tcp  # Next.js
# sudo ufw allow 9001/tcp  # MinIO Console

# Check status
sudo ufw status
```

---

## Step 2: Prepare Deployment Directories

### 2.1 Create Directory Structure
```bash
# Create application directory
sudo mkdir -p /opt/mysite
sudo chown deploy:deploy /opt/mysite

# Create data directories for persistent volumes
sudo mkdir -p /opt/mysite/data/{postgres,minio,backups/{postgres,minio}}
sudo chown -R deploy:deploy /opt/mysite

# Optional: Use external drive
# sudo mkdir -p /mnt/data/mysite/{postgres,minio,backups}
# sudo chown -R deploy:deploy /mnt/data/mysite
```

### 2.2 Mount External Drive (Optional)
If using an external drive for data:
```bash
# Find drive UUID
sudo blkid

# Add to /etc/fstab
sudo nano /etc/fstab
# Add line: UUID=your-uuid /mnt/data ext4 defaults,nofail 0 2

# Mount and verify
sudo mount -a
df -h /mnt/data
```

---

## Step 3: Clone and Configure Application

### 3.1 Clone Repository
```bash
cd /opt/mysite
git clone <your-repo-url> .

# Or upload via SCP/rsync if not using Git
```

### 3.2 Create Production Environment File
```bash
cp .env.example .env.production
nano .env.production
```

**Edit `.env.production` with production values:**
```dotenv
# Database
POSTGRES_USER=<POSTGRES_USER>
POSTGRES_PASSWORD=<POSTGRES_PASSWORD>
POSTGRES_DB=personal_platform
DATABASE_URL="postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@postgres:5432/personal_platform"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<GENERATE_WITH_openssl_rand_-base64_32>"

# Admin Users
ADMIN_EMAILS="<ADMIN_EMAILS_COMMA_SEPARATED>"

# MinIO
MINIO_ROOT_USER=<MINIO_ROOT_USER>
MINIO_ROOT_PASSWORD=<MINIO_ROOT_PASSWORD>
MINIO_ENDPOINT="minio"
MINIO_PORT="9000"
MINIO_ACCESS_KEY=<MINIO_ACCESS_KEY>
MINIO_SECRET_KEY=<MINIO_SECRET_KEY>
MINIO_BUCKET="personal-platform"
MINIO_USE_SSL="false"

# Public URLs
APP_BASE_URL="https://yourdomain.com"
PUBLIC_MEDIA_BASE_URL="https://yourdomain.com/api/media"

# Node Environment
NODE_ENV="production"
```

**Generate secure secrets:**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate strong passwords
openssl rand -base64 24
```

### 3.3 Set Proper Permissions
```bash
chmod 600 .env.production
```

---

## Step 4: Deploy with Docker Compose

### 4.1 Build and Start Services
```bash
cd /opt/mysite

# Use production compose file with environment
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### 4.2 Verify Services
```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml logs minio

# Check health status
docker ps
```

### 4.3 Run Database Migrations
```bash
# Enter web container
docker exec -it personal-platform-web sh

# Run migrations
npx prisma migrate deploy

# Optional: Seed database
npx prisma db seed

# Exit container
exit
```

### 4.4 Create MinIO Bucket
```bash
# Access MinIO Console at http://YOUR_SERVER_IP:9001
# Login with MINIO_ROOT_USER/MINIO_ROOT_PASSWORD
# Create bucket named "personal-platform"

# Or use mc (MinIO Client):
docker exec -it personal-platform-minio-prod sh
mc alias set local http://localhost:9000 minioadmin <YOUR_PASSWORD>
mc mb local/personal-platform
mc anonymous set download local/personal-platform
exit
```

### 4.5 Verify Application
```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## Step 5: Configure Reverse Proxy & HTTPS

### Option A: Nginx Proxy Manager (Recommended for Beginners)

#### 5.1 Install Nginx Proxy Manager
```bash
cd /opt
sudo mkdir nginx-proxy-manager
cd nginx-proxy-manager

# Create docker-compose.yml
sudo nano docker-compose.yml
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
```

#### 5.2 Start Nginx Proxy Manager
```bash
docker compose up -d

# Access admin panel at http://YOUR_SERVER_IP:81
# Default: admin@example.com / changeme
```

#### 5.3 Configure Proxy Host
1. Login to Nginx Proxy Manager (port 81)
2. Add Proxy Host:
   - **Domain**: yourdomain.com
   - **Scheme**: http
   - **Forward Hostname**: localhost (or personal-platform-web)
   - **Forward Port**: 3000
3. SSL Tab:
   - Enable "Force SSL"
   - Request Let's Encrypt Certificate
   - Enable "HTTP/2 Support"

---

### Option B: Cloudflare Tunnel (Recommended for CGNAT/No Port Forwarding)

#### 5.1 Install cloudflared
```bash
# Add cloudflare repository
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-archive-keyring.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-archive-keyring.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list

sudo apt update
sudo apt install cloudflared
```

#### 5.2 Authenticate and Create Tunnel
```bash
# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create personal-platform

# Note the tunnel ID from output

# Create config
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

**config.yml:**
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

#### 5.3 Route DNS and Start Tunnel
```bash
# Route DNS to tunnel
cloudflared tunnel route dns personal-platform yourdomain.com

# Install as service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

---

## Step 6: Configure Automated Backups

### 6.1 Make Backup Scripts Executable
```bash
cd /opt/mysite
chmod +x scripts/backup-postgres.sh
chmod +x scripts/backup-minio.sh
chmod +x scripts/restore-postgres.sh
```

### 6.2 Test Backups Manually
```bash
# Set environment variables
export POSTGRES_PASSWORD="<YOUR_PASSWORD>"
export POSTGRES_USER="postgres"
export POSTGRES_DB="personal_platform"

# Test PostgreSQL backup
./scripts/backup-postgres.sh

# Test MinIO backup
./scripts/backup-minio.sh

# Verify backups created
ls -lh /opt/mysite/backups/postgres/
ls -lh /opt/mysite/backups/minio/
```

### 6.3 Configure Cron Jobs
```bash
crontab -e
```

**Add these lines:**
```cron
# Backup PostgreSQL daily at 2 AM
0 2 * * * export POSTGRES_PASSWORD="<YOUR_PASSWORD>" && /opt/mysite/scripts/backup-postgres.sh >> /var/log/postgres-backup.log 2>&1

# Backup MinIO daily at 3 AM
0 3 * * * /opt/mysite/scripts/backup-minio.sh >> /var/log/minio-backup.log 2>&1
```

### 6.4 Configure Offsite Backups (Optional)
```bash
# Using rsync to external server
rsync -avz /opt/mysite/backups/ user@backup-server:/backups/personal-platform/

# Or using rclone to cloud storage
rclone sync /opt/mysite/backups/ remote:personal-platform-backups/
```

---

## Step 7: Monitoring & Maintenance

### 7.1 Install Uptime Kuma (Optional)
```bash
cd /opt
sudo mkdir uptime-kuma
cd uptime-kuma

# Create docker-compose.yml
sudo nano docker-compose.yml
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    restart: always
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
```

```bash
docker compose up -d

# Access at http://YOUR_SERVER_IP:3001
```

### 7.2 Set Up Log Rotation
```bash
sudo nano /etc/logrotate.d/personal-platform
```

**Add:**
```
/var/log/postgres-backup.log
/var/log/minio-backup.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}
```

### 7.3 Enable Automatic Updates (Optional)
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## Step 8: Application Updates

### 8.1 Pull Latest Changes
```bash
cd /opt/mysite
git pull origin main
```

### 8.2 Rebuild and Restart
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### 8.3 Run New Migrations (if any)
```bash
docker exec -it personal-platform-web sh
npx prisma migrate deploy
exit
```

---

## Step 9: Disaster Recovery

### 9.1 Restore PostgreSQL Backup
```bash
cd /opt/mysite

# Set environment variables
export POSTGRES_PASSWORD="<YOUR_PASSWORD>"
export POSTGRES_USER="postgres"
export POSTGRES_DB="personal_platform"
export POSTGRES_HOST="localhost"

# Run restore script
./scripts/restore-postgres.sh /opt/mysite/backups/postgres/postgres_backup_YYYYMMDD_HHMMSS.sql.gz
```

### 9.2 Restore MinIO Data
```bash
# Stop MinIO service
docker compose -f docker-compose.prod.yml stop minio

# Extract backup
tar -xzf /opt/mysite/backups/minio/minio_backup_YYYYMMDD_HHMMSS.tar.gz -C /opt/mysite/data/

# Restart MinIO
docker compose -f docker-compose.prod.yml start minio
```

---

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs web

# Check disk space
df -h

# Check permissions
ls -la /opt/mysite/data/
```

### Database Connection Issues
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec -it personal-platform-postgres-prod psql -U postgres -d personal_platform
```

### Application Returns 502
```bash
# Check if web service is healthy
docker ps
curl http://localhost:3000/api/health

# Restart services
docker compose -f docker-compose.prod.yml restart web
```

### Out of Disk Space
```bash
# Clean Docker resources
docker system prune -a --volumes

# Check database size
docker exec -it personal-platform-postgres-prod psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('personal_platform'));"

# Check MinIO usage
du -sh /opt/mysite/data/minio/
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong NEXTAUTH_SECRET (32+ characters)
- [ ] Configure UFW firewall
- [ ] Enable HTTPS with Let's Encrypt or Cloudflare
- [ ] Restrict SSH to key-based authentication only
- [ ] Set up fail2ban for SSH protection
- [ ] Regular security updates (unattended-upgrades)
- [ ] Backup encryption (for offsite backups)
- [ ] Monitor audit logs regularly
- [ ] Use strong database passwords
- [ ] Keep Docker and system packages updated

---

## Performance Optimization

### Enable Connection Pooling
Add to `.env.production`:
```dotenv
DATABASE_URL="postgresql://postgres:password@postgres:5432/personal_platform?pgbouncer=true&connection_limit=10"
```

### Configure PostgreSQL
```bash
docker exec -it personal-platform-postgres-prod sh
vi /var/lib/postgresql/data/postgresql.conf
```

Optimize for your server RAM:
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
```

### Enable Next.js Caching
Add to `next.config.ts`:
```typescript
experimental: {
  staleTimes: {
    dynamic: 30,
    static: 180,
  },
}
```

---

## Support & Maintenance

### Regular Tasks
- **Daily**: Check application logs
- **Weekly**: Review disk usage and performance
- **Monthly**: Update dependencies (`npm update`)
- **Quarterly**: Security audit and password rotation

### Useful Commands
```bash
# View all logs
docker compose -f docker-compose.prod.yml logs -f

# Restart specific service
docker compose -f docker-compose.prod.yml restart web

# Execute commands in container
docker exec -it personal-platform-web sh

# Database shell
docker exec -it personal-platform-postgres-prod psql -U postgres -d personal_platform

# Check resource usage
docker stats
```

---

## Success Checklist

- [ ] All containers running and healthy
- [ ] Database migrations applied
- [ ] MinIO bucket created and accessible
- [ ] Application accessible at https://yourdomain.com
- [ ] Admin user can login
- [ ] Posts, comments, reactions working
- [ ] Media uploads working
- [ ] HTTPS enabled with valid certificate
- [ ] Backups configured and tested
- [ ] Monitoring set up (Uptime Kuma)
- [ ] Firewall configured
- [ ] Documentation reviewed

---

**Congratulations!** Your Personal Platform is now live in production. 🎉

For issues, check logs first, then review the Troubleshooting section. For updates, pull latest changes and rebuild containers.
