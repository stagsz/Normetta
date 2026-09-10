# Deployment Guide

## Deployment Architecture

```
Internet
    ↓
CDN / Load Balancer
    ↓
├─→ Frontend (Next.js/Nginx)
│   ├─ Static assets (S3/CDN)
│   └─ Vercel or self-hosted
│
└─→ Backend API (Express/Node)
    ├─ Port 5000
    └─ Health checks: /health
         ↓
    PostgreSQL Database
         ↓
    Backup/Restore
```

## Pre-Deployment Checklist

- [ ] All tests passing (npm test)
- [ ] No console errors or warnings
- [ ] Database migrations tested locally
- [ ] Environment variables configured
- [ ] Security review completed
- [ ] Performance tested
- [ ] Backup strategy in place
- [ ] Monitoring setup
- [ ] Documentation updated

---

## Option 1: Vercel Deployment (Recommended for Frontend)

### Frontend on Vercel

Vercel automatically detects Next.js and deploys.

#### Connect Repository

1. Go to https://vercel.com
2. Click "New Project"
3. Select GitHub repository
4. Import project
5. Configure build settings:
   - Framework: Next.js (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Environment Variables

Add in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://audit-flow.org/_/backend/api
NEXT_PUBLIC_ENV=production
```

#### Deploy

```bash
# Automatic on git push to main
git add .
git commit -m "Ready for deployment"
git push origin main
```

Or manual:
```bash
npm i -g vercel
cd frontend
vercel deploy --prod
```

Result: App available at `https://audit-flow.org`

---

## Option 2: Docker + Cloud Deployment

### Build Docker Images

#### Backend Image

Create `docker/Dockerfile.backend`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy source
COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r)=>{if (r.statusCode!==200) throw new Error()})"

EXPOSE 5000
CMD ["node", "dist/index.js"]
```

#### Frontend Image

Create `docker/Dockerfile.frontend`:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend . 
RUN npm run build

# Production stage
FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/.next /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

#### Build Images

```bash
docker build -f docker/Dockerfile.backend -t iso9001-backend:latest .
docker build -f docker/Dockerfile.frontend -t iso9001-frontend:latest .
```

### Tag for Registry

```bash
# For Docker Hub
docker tag iso9001-backend:latest yourusername/iso9001-backend:1.0
docker push yourusername/iso9001-backend:1.0

# For AWS ECR
docker tag iso9001-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/iso9001:backend
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/iso9001:backend
```

---

## Option 3: AWS Deployment

### Setup RDS Database

1. Go to AWS RDS console
2. Create PostgreSQL instance:
   - Engine: PostgreSQL 12+
   - Instance class: db.t3.micro (free tier) or t3.small (production)
   - Storage: 20GB initial
   - Enable automated backups
   - Multi-AZ: Yes (production)

3. Get connection string:
```
postgresql://admin:password@iso9001-db.c9akciq32.us-east-1.rds.amazonaws.com:5432/iso9001
```

### Setup Elastic Beanstalk

#### Prepare Application

```bash
# Create .ebextensions config
mkdir backend/.ebextensions

# Create backend/.ebextensions/01_node.config
cat > backend/.ebextensions/01_node.config << 'EOF'
option_settings:
  nodejs:
    environment: production
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    ProxyServer: nginx
EOF
```

#### Deploy

```bash
cd backend
pip install awsebcli
eb init -p node.js-20 iso9001-api --region us-east-1
eb create iso9001-prod
eb deploy
```

### Setup CloudFront (CDN)

1. Go to CloudFront console
2. Create distribution:
   - Origin: Your Vercel/frontend domain or ELB
   - Cache behavior: Compress, TTL 3600
   - SSL: Yes (use ACM certificate)
   - Custom domain: cdn.yourdomain.com

---

## Option 4: DigitalOcean App Platform

### Connect Repository

1. Go to DigitalOcean
2. Click "Apps" → "Create App"
3. Select GitHub repository
4. Configure:

```yaml
name: iso9001-app
services:
  - name: api
    github:
      repo: yourusername/selfassessment-app
      branch: main
    source_dir: backend
    build_command: npm ci && npm run db:push && npm run build
    run_command: npm start
    http_port: 5000
    envs:
      - key: DATABASE_URL
        scope: API
        value: ${{ db.DATABASE_URL }}
      - key: NODE_ENV
        value: production

  - name: frontend
    github:
      repo: yourusername/selfassessment-app
      branch: main
    source_dir: frontend
    build_command: npm ci && npm run build
    run_command: npm start
    http_port: 3000
    envs:
      - key: NEXT_PUBLIC_API_URL
        value: https://api.yourdomain.com

databases:
  - name: db
    engine: PG
    version: "12"
```

Deploy:
```bash
doctl apps create --spec app.yaml
```

---

## Production Environment Variables

### Backend (.env)

```
# Database
DATABASE_URL=postgresql://user:password@db.example.com:5432/iso9001

# Environment
NODE_ENV=production
PORT=5000

# Security
JWT_SECRET=your-very-secure-random-secret-min-32-chars
JWT_REFRESH_SECRET=your-very-secure-random-secret-min-32-chars
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Storage (S3 optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=iso9001-evidence

# Email (optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-key

# Session
SESSION_TIMEOUT=1800
```

### Frontend (.env.production)

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ENV=production
```

---

## Database Migration for Production

### Backup Current Database

```bash
# Local backup
pg_dump -U postgres iso9001 > backup_$(date +%Y%m%d).sql

# From RDS
pg_dump \
  --dbname=postgresql://user:password@db.example.com:5432/iso9001 \
  --no-password \
  > backup_$(date +%Y%m%d).sql

# Compress
gzip backup_*.sql
```

### Restore Database

```bash
# From backup file
psql postgresql://user:password@db.example.com:5432/iso9001 < backup.sql

# Or via Prisma
npm run db:push
npm run db:seed
```

### Zero-Downtime Migrations

```bash
# 1. Backup production
pg_dump production_db > backup.sql

# 2. Run migrations in staging
psql staging_db < backup.sql
npm run db:push

# 3. Test in staging
npm test

# 4. Run in production
npm run db:push --workspace=backend

# 5. Verify
npm run db:generate --workspace=backend
```

---

## Performance Optimization

### Frontend (Next.js)

```bash
# Static generation
npm run build

# Incremental Static Regeneration (ISR)
# Set revalidate in pages:
export const revalidate = 3600  // 1 hour
```

### Backend API

```javascript
// Add caching middleware
app.use(cache('5 minutes'));

// Compress responses
app.use(compression());

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

### Database

```sql
-- Add indexes
CREATE INDEX idx_assessment_status ON Assessment(status);
CREATE INDEX idx_response_assessment ON QuestionResponse(assessmentId);
CREATE INDEX idx_ncr_assessment ON NonConformity(assessmentId);
```

---

## Monitoring & Logging

### Logging Setup

#### Backend Logging

```bash
# Configure Winston logger
npm install winston

# Log to file and console
logs/
├── combined.log      # All logs
├── error.log         # Errors only
└── combined.gz       # Archived
```

#### Monitor in Production

```bash
# View logs
tail -f backend/logs/combined.log | grep ERROR

# Log aggregation (optional)
npm install datadog-browser-rum
```

### Health Checks

```bash
# Backend health endpoint
GET /health
Response: { status: "ok", timestamp: "...", database: "connected" }

# Monitor availability
curl https://api.yourdomain.com/health
```

### Uptime Monitoring

Services:
- UptimeRobot
- Pingdom
- AWS CloudWatch
- DataDog

Configure monitoring on:
```
https://yourdomain.com/
https://api.yourdomain.com/health
```

---

## Security Deployment

### SSL/TLS Certificate

#### Using Let's Encrypt (Free)

```bash
# On server
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

#### Using AWS ACM

1. Go to AWS Certificate Manager
2. Request certificate for yourdomain.com
3. Verify domain (DNS or email)
4. Attach to CloudFront/Load Balancer

### Firewall Rules

```bash
# Allow only HTTPS
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp      # For cert renewal
sudo ufw deny 5000/tcp     # Block direct API access
sudo ufw deny 3000/tcp     # Block direct frontend
```

### Environment Secrets

Never commit:
- `.env` files
- Private keys
- API credentials
- JWT secrets

Use secret management:
- AWS Secrets Manager
- HashiCorp Vault
- DigitalOcean App Platform secrets

---

## Backup & Disaster Recovery

### Automated Backups

```bash
# Daily backup script (cron job)
0 2 * * * /home/user/backup.sh

# backup.sh
#!/bin/bash
pg_dump postgresql://url > /backups/db_$(date +\%Y\%m\%d).sql
gzip /backups/db_*.sql
aws s3 sync /backups s3://iso9001-backups/
```

### Restore from Backup

```bash
# Download backup from S3
aws s3 cp s3://iso9001-backups/db_20260324.sql.gz .
gunzip db_20260324.sql.gz

# Restore to database
psql postgresql://url < db_20260324.sql

# Verify data
npm run db:generate
```

---

## Post-Deployment

### Verification

- [ ] Frontend loads
- [ ] Can login
- [ ] API responds
- [ ] Database connected
- [ ] SSL certificate valid
- [ ] Monitoring active
- [ ] Backups scheduled

### Performance Check

```bash
# Frontend Lighthouse score
lighthouse https://yourdomain.com

# Backend response time
curl -w "@curl-format.txt" -o /dev/null -s https://api.yourdomain.com
```

### Smoke Tests

```bash
# Test key workflows
npm run test:smoke

# Test API endpoints
npm run test:api

# Test database
npm run test:db
```

---

## Rollback Plan

If deployment fails:

```bash
# 1. Revert code
git revert HEAD

# 2. Rebuild
npm run build

# 3. Redeploy
git push origin main  # Auto-deploy on Vercel
# or
eb deploy  # AWS Elastic Beanstalk

# 4. Verify
curl https://api.yourdomain.com/health

# 5. Restore database if needed
psql < backup.sql
```

---

## Cost Estimation (Monthly)

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Vercel | Free/$20 |
| API | AWS/DigitalOcean | $20-100 |
| Database | AWS RDS | $20-200 |
| CDN | CloudFront | $5-50 |
| Storage (S3) | AWS | $1-10 |
| SSL | Let's Encrypt | Free |
| **Total** | | **$46-380** |

---

## Maintenance Schedule

| Task | Frequency |
|------|-----------|
| Security updates | Weekly |
| Database backup | Daily |
| Performance review | Weekly |
| Log review | Daily |
| Dependency updates | Monthly |
| Major version upgrade | Quarterly |

---

Last Updated: March 24, 2026
Version: 1.0
