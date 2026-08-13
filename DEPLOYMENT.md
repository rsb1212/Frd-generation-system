# FRD Generation System - Deployment Guide

## Production Deployment

This guide covers deploying the FRD Generation System to production environments.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Docker Deployment](#docker-deployment)
3. [Traditional Server Deployment](#traditional-server-deployment)
4. [Cloud Platform Deployment](#cloud-platform-deployment)
5. [Security Hardening](#security-hardening)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Recovery](#backup--recovery)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Code reviewed
- [ ] Dependencies audited
- [ ] Security vulnerabilities fixed

### Configuration
- [ ] Environment variables set
- [ ] API keys configured
- [ ] Database connections tested
- [ ] CORS origins configured
- [ ] File paths writable

### Performance
- [ ] Frontend optimized (minified, bundled)
- [ ] Backend tested under load
- [ ] Database queries optimized
- [ ] Caching configured

### Documentation
- [ ] API documentation up to date
- [ ] Deployment procedure documented
- [ ] Runbooks created
- [ ] Troubleshooting guide available

---

## Docker Deployment

### Create Dockerfile for Backend

**backend/Dockerfile**:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY ../requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create directories
RUN mkdir -p uploads generated chromadb_data

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Run application
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Create Dockerfile for Frontend

**frontend/Dockerfile**:
```dockerfile
# Build stage
FROM node:16-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose Configuration

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: frd-backend
    ports:
      - "5000:5000"
    environment:
      FLASK_ENV: production
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      SECRET_KEY: ${SECRET_KEY}
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/generated:/app/generated
      - ./backend/chromadb_data:/app/chromadb_data
    depends_on:
      - chromadb
    restart: unless-stopped
    networks:
      - frd-network

  frontend:
    build: ./frontend
    container_name: frd-frontend
    ports:
      - "80:80"
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
    restart: unless-stopped
    networks:
      - frd-network
    depends_on:
      - backend

  chromadb:
    image: chromadb/chroma:latest
    container_name: frd-chromadb
    ports:
      - "8000:8000"
    volumes:
      - ./backend/chromadb_data:/chroma/data
    restart: unless-stopped
    networks:
      - frd-network

networks:
  frd-network:
    driver: bridge
```

### Deploy with Docker Compose

```bash
# Set environment variables
export OPENAI_API_KEY=sk-xxx...
export SECRET_KEY=your-secret-key-here

# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Traditional Server Deployment

### AWS EC2 Deployment

#### 1. Launch EC2 Instance
```bash
# Ubuntu 20.04 LTS
# t3.medium (2 vCPU, 4GB RAM minimum)
# Security Group: Allow 80, 443, 5000
```

#### 2. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3.9 python3-pip python3-venv -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install LibreOffice
sudo apt install libreoffice -y

# Install Nginx
sudo apt install nginx -y
```

#### 3. Clone Repository
```bash
cd /var/www
sudo git clone <repository-url> frd-system
sudo chown -R $USER:$USER frd-system
cd frd-system
```

#### 4. Setup Backend
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Create necessary directories
mkdir -p uploads generated chromadb_data
chmod 755 uploads generated chromadb_data

# Configure environment
cp .env.example .env
# Edit .env with production values

# Create systemd service
sudo tee /etc/systemd/system/frd-backend.service > /dev/null <<EOF
[Unit]
Description=FRD Backend Service
After=network.target

[Service]
Type=notify
User=$USER
WorkingDirectory=/var/www/frd-system/backend
Environment="PATH=/var/www/frd-system/backend/venv/bin"
ExecStart=/var/www/frd-system/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable frd-backend
sudo systemctl start frd-backend
```

#### 5. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Backend is handled by Nginx (see below)
```

#### 6. Configure Nginx
```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/frd-system > /dev/null <<EOF
upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        root /var/www/frd-system/frontend/build;
        try_files \$uri /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts for large file uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File uploads
    client_max_body_size 10M;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/frd-system /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 7. Setup SSL (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is automatic
```

#### 8. Check Status
```bash
# Backend
sudo systemctl status frd-backend

# Nginx
sudo systemctl status nginx

# Logs
sudo journalctl -u frd-backend -f
sudo tail -f /var/log/nginx/error.log
```

---

## Cloud Platform Deployment

### Heroku Deployment

#### 1. Prepare for Heroku

**Procfile**:
```
web: gunicorn -w 4 -b 0.0.0.0:$PORT app:app
```

#### 2. Deploy Backend
```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create frd-system-backend

# Set environment variables
heroku config:set OPENAI_API_KEY=sk-xxx...
heroku config:set FLASK_ENV=production

# Deploy
git push heroku main
```

#### 3. Deploy Frontend

Use Netlify or Vercel for frontend hosting.

**Netlify Deploy**:
```bash
cd frontend

# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=build
```

### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p python-3.9 frd-system

# Create environment
eb create production

# Deploy
eb deploy

# Check status
eb status
```

---

## Security Hardening

### Backend Security

1. **Update Dependencies**
```bash
pip install --upgrade pip
pip list --outdated
pip install -r requirements.txt --upgrade
```

2. **Environment Variables**
```bash
# Never commit .env files
echo ".env" >> .gitignore
export SECRET_KEY=$(openssl rand -hex 32)
```

3. **CORS Configuration**
```python
CORS_ORIGINS = [
    'https://your-domain.com',
    'https://www.your-domain.com'
]
```

4. **Rate Limiting**
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

@app.route('/api/frd/generate')
@limiter.limit("10 per hour")
def generate_frd():
    pass
```

5. **Request Validation**
```python
from pydantic import BaseModel, validator

class GenerateFRDRequest(BaseModel):
    requirement: str
    
    @validator('requirement')
    def requirement_min_length(cls, v):
        if len(v) < 50:
            raise ValueError('Requirement too short')
        return v
```

### Frontend Security

1. **Content Security Policy**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

2. **Environment Variables**
```bash
# Never expose API keys in frontend
REACT_APP_API_URL=https://api.your-domain.com
```

### Infrastructure Security

1. **Firewall Configuration**
```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

2. **SSH Security**
```bash
# Disable password auth
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

---

## Monitoring & Logging

### Backend Monitoring

**Install Monitoring Tools**:
```bash
pip install prometheus-flask-exporter
pip install python-json-logger
```

**Prometheus Integration**:
```python
from prometheus_flask_exporter import PrometheusMetrics

metrics = PrometheusMetrics(app)
```

### Frontend Monitoring

**Sentry Integration**:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://key@sentry.io/project",
  tracesSampleRate: 1.0,
});
```

### Log Aggregation

**Using CloudWatch (AWS)**:
```bash
# Install CloudWatch agent
sudo wget https://s3.amazonaws.com/aws-cloudwatch/downloads/latest/awslog-agent-setup.py

# Configure logs
sudo python3 ./awslog-agent-setup.py -n -r us-east-1 -c configuration.json
```

---

## Backup & Recovery

### Database Backup

**ChromaDB Backup**:
```bash
# Backup
tar -czf chromadb_backup_$(date +%Y%m%d).tar.gz chromadb_data/

# Restore
tar -xzf chromadb_backup_*.tar.gz

# Upload to S3
aws s3 cp chromadb_backup_*.tar.gz s3://your-bucket/backups/
```

### Document Backup

```bash
# Backup generated documents
aws s3 sync generated/ s3://your-bucket/generated/

# Backup uploads
aws s3 sync uploads/ s3://your-bucket/uploads/
```

### Database Snapshots

```bash
# EBS Snapshot (AWS)
aws ec2 create-snapshot --volume-id vol-xxx --description "Daily backup"

# Enable automated snapshots
aws ec2 create-snapshot-schedule --volume-id vol-xxx --schedule-expression "cron(0 2 * * ? *)"
```

---

## Troubleshooting Production

### Common Issues

1. **High Memory Usage**
```bash
# Check memory
free -h
ps aux | sort -k4 -rn | head -10

# Restart services
sudo systemctl restart frd-backend
```

2. **Slow Response Times**
```bash
# Check system load
uptime
top -n1 | head -15

# Check database
python3 -c "from backend.rag_agent import RAGAgent; RAGAgent.test()"
```

3. **Disk Space Issues**
```bash
# Check disk
df -h

# Clean old files
find generated/ -type f -mtime +30 -delete
find uploads/ -type f -mtime +7 -delete
```

---

## Performance Tuning

### Backend Optimization

1. **Gunicorn Workers**
```bash
# Recommended: 2-4 per CPU
gunicorn -w 8 -b 0.0.0.0:5000 app:app
```

2. **Database Optimization**
```python
# Batch operations
documents = [...]
for chunk in chunks(documents, 100):
    db.add_batch(chunk)
```

3. **Caching**
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/api/templates/list')
@cache.cached(timeout=3600)
def list_templates():
    pass
```

---

**Last Updated**: 2024
**Version**: 1.0.0
