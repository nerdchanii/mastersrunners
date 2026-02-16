# Masters Runners - Deployment Guide

## Overview

This document describes the production deployment setup for Masters Runners.

### Architecture
- **Frontend**: Vite + React Router → Cloudflare Pages (separate deployment)
- **Backend**: NestJS 11 API → Docker container (self-hosted)
- **Database**: PostgreSQL 17 → Docker container
- **Cache**: Redis 7 → Docker container
- **File Storage**: Cloudflare R2 (presigned URLs)

## Prerequisites

- Docker & Docker Compose installed
- Node.js 22+ and pnpm 10.28.2 (for local development)
- PostgreSQL client (for migrations)

## Production Deployment

### 1. Prepare Environment

Copy the production environment template:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` and set:
- `JWT_SECRET`: Strong random secret (use `openssl rand -base64 32`)
- `DATABASE_URL`: Production database connection string
- `FRONTEND_URL`: Your frontend domain (e.g., `https://app.mastersrunners.com`)
- OAuth credentials (Kakao, Google, Naver)
- R2 credentials (if using file uploads)

### 2. Build and Start Services

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f api

# Stop services
docker compose -f docker-compose.prod.yml down
```

### 3. Run Database Migrations

```bash
# Run migrations inside the container
docker compose -f docker-compose.prod.yml exec api pnpm --filter @masters/database run db:migrate
```

Or run migrations from your local machine:

```bash
# Set DATABASE_URL to production database
export DATABASE_URL=postgresql://masters:masters@your-server:5432/masters_runners

# Run migrations
cd packages/database
pnpm run db:migrate
```

### 4. Health Check

Verify the API is running:

```bash
curl http://localhost:4000/health
# Expected: {"status":"ok","timestamp":"2026-02-16T..."}
```

## CI/CD with GitHub Actions

### Automated Testing

The CI pipeline (`.github/workflows/ci.yml`) runs automatically on:
- Pull requests to `main`
- Pushes to `main`

It performs:
1. Install dependencies
2. Build all packages
3. Run API tests (with PostgreSQL service)
4. Build web frontend
5. Build Docker image (test build, no push)

### Manual Deployment

To deploy manually after CI passes:

```bash
# On your server
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

### Future: Automated Deployment

To set up automated deployment, you can:

1. **Add Docker Hub/GHCR push** to CI:
   ```yaml
   - name: Push to registry
     if: github.ref == 'refs/heads/main'
     uses: docker/build-push-action@v5
     with:
       push: true
       tags: ghcr.io/your-org/masters-runners-api:latest
   ```

2. **Add deployment step**:
   ```yaml
   - name: Deploy to server
     if: github.ref == 'refs/heads/main'
     uses: appleboy/ssh-action@master
     with:
       host: ${{ secrets.DEPLOY_HOST }}
       username: ${{ secrets.DEPLOY_USER }}
       key: ${{ secrets.DEPLOY_KEY }}
       script: |
         cd /path/to/app
         docker compose -f docker-compose.prod.yml pull
         docker compose -f docker-compose.prod.yml up -d
   ```

## Docker Image Structure

The production Docker image is built in two stages:

### Stage 1: Builder
- Installs all dependencies (including devDependencies)
- Builds packages in order: types → database → api
- Uses pnpm 10.28.2 workspace features

### Stage 2: Runner
- Installs only production dependencies
- Copies built artifacts from builder stage
- Runs with `NODE_ENV=production`
- Exposes port 4000

## Monitoring

### Health Endpoint

`GET /health` - No authentication required
- Returns `{"status":"ok","timestamp":"..."}`
- Excluded from `/api/v1` prefix for easy monitoring

### Logs

```bash
# View API logs
docker compose -f docker-compose.prod.yml logs -f api

# View database logs
docker compose -f docker-compose.prod.yml logs -f db

# View all logs
docker compose -f docker-compose.prod.yml logs -f
```

### Database Backup

```bash
# Backup
docker compose -f docker-compose.prod.yml exec db pg_dump -U masters masters_runners > backup.sql

# Restore
docker compose -f docker-compose.prod.yml exec -T db psql -U masters masters_runners < backup.sql
```

## Troubleshooting

### API not starting

1. Check logs: `docker compose -f docker-compose.prod.yml logs api`
2. Verify environment variables in `.env.production`
3. Ensure database is healthy: `docker compose -f docker-compose.prod.yml ps`

### Database connection errors

1. Check `DATABASE_URL` format
2. Verify database service is running and healthy
3. Check network connectivity between containers

### Build failures

1. Clear Docker cache: `docker builder prune -a`
2. Rebuild from scratch: `docker compose -f docker-compose.prod.yml build --no-cache`

## Performance Tuning

### Database

1. Add indexes for common queries (already done in schema)
2. Enable connection pooling (Prisma default: 10 connections)
3. Adjust `postgres_data` volume for better I/O

### API

1. Set `NODE_ENV=production` (enables optimizations)
2. Adjust rate limiting in `app.module.ts` (default: 30 req/min)
3. Scale horizontally: run multiple API containers behind load balancer

### Redis

1. Configure persistence if needed (currently using in-memory only)
2. Set maxmemory policy: `maxmemory-policy allkeys-lru`

## Security Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Use HTTPS for frontend and API
- [ ] Set up firewall rules (only expose necessary ports)
- [ ] Enable PostgreSQL SSL connections
- [ ] Rotate OAuth client secrets regularly
- [ ] Set up database backups (daily recommended)
- [ ] Monitor API logs for suspicious activity
- [ ] Keep Docker images updated

## Cloudflare Pages (Frontend)

Frontend deployment is handled separately:

1. Connect GitHub repo to Cloudflare Pages
2. Set build command: `pnpm --filter @masters/web build`
3. Set output directory: `apps/web/dist`
4. Set environment variable: `VITE_API_URL=https://api.mastersrunners.com`

## Next Steps

- [ ] Set up domain DNS records
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring (e.g., Sentry, DataDog)
- [ ] Configure log aggregation
- [ ] Set up automated database backups
- [ ] Implement blue-green deployment
- [ ] Add performance monitoring (APM)
