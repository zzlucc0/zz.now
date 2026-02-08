# Production Deployment Guide

Complete guide for deploying the Personal Platform on your Ubuntu home server.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Deployment Steps](#deployment-steps)
4. [Reverse Proxy Configuration](#reverse-proxy-configuration)
5. [SSL/HTTPS Setup](#ssl-https-setup)
6. [Backup & Restore](#backup--restore)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements

- Ubuntu Server 22.04 or 24.04 LTS
- Minimum 2GB RAM (4GB recommended)
- 20GB+ free disk space
- Static IP or DDNS configured
- Domain name (optional but recommended)

### Software Requirements

- Docker Engine
- Docker Compose plugin
- Git
- UFW (firewall)

---

## Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker

```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
sudo docker --version
sudo docker compose version
```

### 3. Create Deploy User

```bash
# Create user
sudo adduser deploy

# Add to docker group
sudo usermod -aG docker deploy

# Switch to deploy user
su - deploy
```

### 4. Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS (for reverse proxy)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## Deployment Steps

### 1. Create Directory Structure

```bash
# Create deployment directory
sudo mkdir -p /opt/mysite
sudo chown -R deploy:deploy /opt/mysite

# Create data directories
sudo mkdir -p /opt/mysite/data/{postgres,minio}
# OR use external drive
# sudo mkdir -p /mnt/data/mysite/{postgres,minio}

# Create backup directory
sudo mkdir -p /opt/mysite/backups/{postgres,minio}
```

### 2. Clone Repository

```bash
cd /opt/mysite
git clone <your-repo-url> repo
cd repo
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env.production

# Edit production environment
nano .env.production
```

**Required Environment Variables:**

```env
# Database
POSTGRES_USER=<POSTGRES_USER>
POSTGRES_PASSWORD=<POSTGRES_PASSWORD>
POSTGRES_DB=personal_platform

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Admin Users
ADMIN_EMAILS=<ADMIN_EMAILS_COMMA_SEPARATED>

# MinIO
MINIO_ROOT_USER=<MINIO_ROOT_USER>
MINIO_ROOT_PASSWORD=<MINIO_ROOT_PASSWORD>
MINIO_BUCKET=personal-platform

# Public URLs
APP_BASE_URL=https://yourdomain.com
PUBLIC_MEDIA_BASE_URL=https://yourdomain.com/api/media
```

**Generate secure secrets:**

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate strong passwords
openssl rand -base64 24
```

### 4. Build and Start Services

```bash
# Build and start containers
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Verify containers are running
docker compose -f docker-compose.prod.yml ps
```

### 5. Run Database Migrations

```bash
# Run migrations inside web container
docker compose -f docker-compose.prod.yml exec web npx prisma migrate deploy

# Seed database (creates admin user)
docker compose -f docker-compose.prod.yml exec web npx prisma db seed
```

### 6. Verify Deployment

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","database":"connected"}
```

---

## Reverse Proxy Configuration

Choose one of the following options:

### Option A: Nginx Proxy Manager (Recommended)

**Best for:** Easy SSL management with Let's Encrypt GUI

#### 1. Install Nginx Proxy Manager

```bash
cd /opt/mysite
mkdir nginx-proxy-manager
cd nginx-proxy-manager

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
      - '81:81'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
EOF

# Start NPM
docker compose up -d
```

#### 2. Configure Proxy

1. Access NPM admin panel: `http://your-server-ip:81`
2. Default login:
  - Email: `<ADMIN_EMAILS_COMMA_SEPARATED>`
  - Password: `<ADMIN_PASSWORD>`
3. Change password immediately
4. Add Proxy Host:
   - Domain Names: `yourdomain.com`
   - Scheme: `http`
   - Forward Hostname/IP: `172.17.0.1` (Docker host)
   - Forward Port: `3000`
5. Enable SSL tab:
   - Force SSL: Yes
   - HTTP/2 Support: Yes
   - Request Let's Encrypt Certificate
   - Agree to Let's Encrypt Terms

### Option B: Cloudflare Tunnel

**Best for:** Behind CGNAT or no port forwarding

#### 1. Install Cloudflared

```bash
# Add Cloudflare GPG key
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

# Add Cloudflare repository
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared focal main' | sudo tee /etc/apt/sources.list.d/cloudflared.list

# Install
sudo apt update
sudo apt install cloudflared
```

#### 2. Authenticate

```bash
cloudflared tunnel login
```

#### 3. Create Tunnel

```bash
# Create tunnel
cloudflared tunnel create personal-platform

# Note the tunnel ID from output

# Create config
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

**Config content:**

```yaml
tunnel: <tunnel-id>
credentials-file: /home/deploy/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

#### 4. Configure DNS

```bash
cloudflared tunnel route dns personal-platform yourdomain.com
```

#### 5. Run as Service

```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

## Media Serving Strategy

The platform serves media through `/api/media/[...key]` proxy route for security:

**Advantages:**
- No public MinIO bucket exposure
- Server-side validation
- Easy to add authentication later

**Configuration:**
- MinIO runs internally on Docker network
- Only port 3000 is exposed publicly
- Media URLs: `https://yourdomain.com/api/media/<objectKey>`

---

## Backup & Restore

### Automated Backups

#### 1. Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

#### 2. Set Up Cron Jobs

```bash
crontab -e
```

**Add these lines:**

```cron
# Backup PostgreSQL daily at 2 AM
0 2 * * * /opt/mysite/repo/scripts/backup-postgres.sh >> /opt/mysite/backups/backup.log 2>&1

# Backup MinIO daily at 3 AM
0 3 * * * /opt/mysite/repo/scripts/backup-minio.sh >> /opt/mysite/backups/backup.log 2>&1
```

### Manual Backup

```bash
# PostgreSQL
./scripts/backup-postgres.sh

# MinIO
./scripts/backup-minio.sh
```

### Restore from Backup

```bash
# PostgreSQL
./scripts/restore-postgres.sh /opt/mysite/backups/postgres/postgres_backup_YYYYMMDD_HHMMSS.sql.gz

# MinIO (stop container first)
docker compose -f docker-compose.prod.yml stop minio
sudo rm -rf /opt/mysite/data/minio/*
tar -xzf /opt/mysite/backups/minio/minio_backup_YYYYMMDD_HHMMSS.tar.gz -C /opt/mysite/data/
docker compose -f docker-compose.prod.yml start minio
```

### Offsite Backups

**Option 1: rsync to Remote Server**

```bash
# Sync backups to remote server
rsync -avz --delete /opt/mysite/backups/ user@remote-server:/backups/personal-platform/
```

**Option 2: rclone to Cloud Storage**

```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure (interactive)
rclone config

# Sync to cloud
rclone sync /opt/mysite/backups/ remote:personal-platform-backups/
```

---

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f web

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 web
```

### Check Resource Usage

```bash
# Container stats
docker stats

# Disk usage
df -h
du -sh /opt/mysite/data/*
```

### Update Application

```bash
cd /opt/mysite/repo

# Pull latest changes
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations if needed
docker compose -f docker-compose.prod.yml exec web npx prisma migrate deploy
```

### Database Maintenance

```bash
# Open Prisma Studio (carefully - production!)
docker compose -f docker-compose.prod.yml exec web npx prisma studio

# Vacuum database
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d personal_platform -c "VACUUM ANALYZE;"
```

### Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## Optional: Uptime Monitoring

### Install Uptime Kuma

```bash
cd /opt/mysite
mkdir uptime-kuma
cd uptime-kuma

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    volumes:
      - ./data:/app/data
    ports:
      - "3001:3001"
    restart: unless-stopped
EOF

docker compose up -d
```

Access at: `http://your-server-ip:3001`

---

## Troubleshooting

### Containers Won't Start

```bash
# Check Docker daemon
sudo systemctl status docker

# Check container logs
docker compose -f docker-compose.prod.yml logs

# Remove and recreate
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
docker compose -f docker-compose.prod.yml ps postgres

# Test connection
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "SELECT 1;"

# Check DATABASE_URL in .env.production
```

### Website Not Accessible

```bash
# Check web container
docker compose -f docker-compose.prod.yml logs web

# Test locally
curl http://localhost:3000

# Check firewall
sudo ufw status

# Check reverse proxy logs (if using NPM)
docker logs nginx-proxy-manager-app-1
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker system
docker system prune -a

# Clean old backups
find /opt/mysite/backups -type f -mtime +30 -delete
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R deploy:deploy /opt/mysite

# Fix data directories
sudo chown -R 999:999 /opt/mysite/data/postgres
sudo chown -R 1000:1000 /opt/mysite/data/minio
```

---

## Security Checklist

- [ ] Changed all default passwords
- [ ] `NEXTAUTH_SECRET` is randomly generated
- [ ] ADMIN_EMAILS configured correctly
- [ ] Firewall (UFW) enabled
- [ ] SSL/HTTPS configured
- [ ] Backups automated and tested
- [ ] Docker containers restart on failure
- [ ] Regular system updates scheduled
- [ ] Monitoring configured

---

## Update Policy

### Monthly Tasks

- Update system packages
- Update Docker images
- Review backup logs
- Check disk space

### Security Patches

- Subscribe to security announcements for:
  - Ubuntu
  - Docker
  - PostgreSQL
  - Next.js

### Dependency Updates

```bash
# Check for updates
cd /opt/mysite/repo
npm outdated

# Update dependencies
npm update

# Rebuild
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Support Resources

- Docker: https://docs.docker.com/
- PostgreSQL: https://www.postgresql.org/docs/
- Next.js: https://nextjs.org/docs
- Nginx Proxy Manager: https://nginxproxymanager.com/
- Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

---

## Success Criteria

Your deployment is successful when:

1. ✅ Website accessible via domain name
2. ✅ HTTPS working with valid certificate
3. ✅ Can register and login
4. ✅ Can create and view posts
5. ✅ Images upload and display correctly
6. ✅ Health check returns healthy: `curl https://yourdomain.com/api/health`
7. ✅ Backups running automatically
8. ✅ Containers restart after server reboot

---

**Deployment completed!** 🎉

Your personal platform is now running in production.
