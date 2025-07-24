# Deployment Guide - Jordan eLearning API Platform

This guide covers deploying the Jordan eLearning API Platform to production environments.

## 🚀 Production Deployment Options

### Option 1: Traditional VPS/Server Deployment

#### Prerequisites
- Ubuntu 20.04+ or CentOS 8+
- Node.js 16+
- PostgreSQL 12+
- Redis 6+
- Nginx
- SSL Certificate
- Domain name

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2
```

#### Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE jordan_elearning;
CREATE USER elearning_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE jordan_elearning TO elearning_user;
\q
```

#### Step 3: Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/elearning-api
cd /var/www/elearning-api

# Clone repository
git clone <your-repo-url> .

# Install dependencies
npm ci --production

# Create environment file
sudo nano .env
```

**Environment Configuration:**
```env
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jordan_elearning
DB_USER=elearning_user
DB_PASSWORD=your_secure_password
DB_DIALECT=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRE=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=jordan-elearning-files

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@jordan-elearning.com
FROM_NAME=Jordan eLearning Platform

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

#### Step 4: Database Migration

```bash
# Run database migrations
NODE_ENV=production npm run migrate

# Optional: Seed initial data
NODE_ENV=production npm run seed
```

#### Step 5: PM2 Process Management

```bash
# Start application with PM2
pm2 start src/app.js --name "elearning-api" --env production

# Configure PM2 to start on boot
pm2 startup
pm2 save

# Monitor application
pm2 status
pm2 logs elearning-api
```

#### Step 6: Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/elearning-api
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.jordan-elearning.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.jordan-elearning.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Proxy Configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File upload size
    client_max_body_size 10M;

    # Logging
    access_log /var/log/nginx/elearning-api.access.log;
    error_log /var/log/nginx/elearning-api.error.log;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/elearning-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Option 2: Docker Deployment

#### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: jordan_elearning
      POSTGRES_USER: elearning_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs and uploads directories
RUN mkdir -p logs uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Option 3: Cloud Deployment (AWS)

#### AWS ECS with Fargate

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name jordan-elearning-api
```

2. **Build and Push Docker Image**
```bash
# Build image
docker build -t jordan-elearning-api .

# Tag for ECR
docker tag jordan-elearning-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/jordan-elearning-api:latest

# Push to ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/jordan-elearning-api:latest
```

3. **Create ECS Task Definition**
```json
{
  "family": "jordan-elearning-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "elearning-api",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/jordan-elearning-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:elearning-db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/jordan-elearning-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 🔧 Environment-Specific Configurations

### Production Environment Variables

```env
# Production-specific settings
NODE_ENV=production
PORT=3000

# Database - Use connection pooling
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_ACQUIRE=60000
DB_POOL_IDLE=10000

# Logging
LOG_LEVEL=info

# Security
HELMET_ENABLED=true
CORS_ORIGIN=https://your-domain.com

# Performance
COMPRESSION_ENABLED=true
CACHE_TTL=3600

# Monitoring
ENABLE_METRICS=true
HEALTH_CHECK_INTERVAL=30000
```

### Staging Environment

```env
NODE_ENV=staging
PORT=3000

# Use staging database
DB_NAME=jordan_elearning_staging

# Relaxed security for testing
CORS_ORIGIN=*
LOG_LEVEL=debug

# Enable additional debugging
DEBUG_MODE=true
```

## 📊 Monitoring & Logging

### Application Monitoring

```bash
# Install monitoring tools
npm install -g clinic
npm install --save @newrelic/koa

# Performance monitoring
clinic doctor -- node src/app.js
clinic bubbleprof -- node src/app.js
```

### Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/elearning-api
```

```
/var/www/elearning-api/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload elearning-api
    endscript
}
```

### Health Monitoring

```bash
# Create health check script
cat > /usr/local/bin/elearning-health-check.sh << 'EOF'
#!/bin/bash
HEALTH_URL="https://api.jordan-elearning.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ API is healthy"
    exit 0
else
    echo "❌ API health check failed with status: $RESPONSE"
    # Restart application
    pm2 restart elearning-api
    exit 1
fi
EOF

chmod +x /usr/local/bin/elearning-health-check.sh

# Add to crontab
echo "*/5 * * * * /usr/local/bin/elearning-health-check.sh" | crontab -
```

## 🔒 Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] File upload restrictions
- [ ] Input validation enabled
- [ ] Logging configured
- [ ] Backup strategy implemented

## 🔄 Backup Strategy

### Database Backup

```bash
# Create backup script
cat > /usr/local/bin/backup-elearning-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/elearning"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="jordan_elearning"

mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U elearning_user $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
EOF

chmod +x /usr/local/bin/backup-elearning-db.sh

# Schedule daily backups
echo "0 2 * * * /usr/local/bin/backup-elearning-db.sh" | crontab -
```

### File Backup (if using local storage)

```bash
# Backup uploaded files
rsync -av --delete /var/www/elearning-api/uploads/ /backups/elearning/uploads/
```

## 🚨 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs elearning-api
   
   # Check environment variables
   pm2 env elearning-api
   
   # Restart application
   pm2 restart elearning-api
   ```

2. **Database connection issues**
   ```bash
   # Test database connection
   psql -h localhost -U elearning_user -d jordan_elearning
   
   # Check PostgreSQL status
   sudo systemctl status postgresql
   ```

3. **High memory usage**
   ```bash
   # Monitor memory usage
   pm2 monit
   
   # Restart application
   pm2 restart elearning-api --update-env
   ```

4. **SSL certificate issues**
   ```bash
   # Check certificate validity
   openssl x509 -in /path/to/certificate.crt -text -noout
   
   # Test SSL configuration
   nginx -t
   ```

### Performance Optimization

1. **Enable caching**
   - Implement Redis caching for frequently accessed data
   - Use CDN for static assets
   - Enable browser caching

2. **Database optimization**
   - Add appropriate indexes
   - Optimize queries
   - Use connection pooling

3. **Load balancing**
   - Use multiple application instances
   - Configure Nginx load balancing
   - Implement health checks

---

For additional support, contact: support@jordan-elearning.com