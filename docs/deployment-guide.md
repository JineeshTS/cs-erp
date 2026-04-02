# CS-ERP Deployment Guide

This guide covers deploying CS-ERP in production using Docker, with PostgreSQL, Redis, PgBouncer, and Caddy reverse proxy.

---

## Architecture Overview

```
Internet
  |
Caddy (HTTPS, automatic Let's Encrypt)
  |
CS-ERP Container (Next.js, port 3100)
  |
  +-- PgBouncer (connection pooling, port 5432)
  |     |
  |     +-- PostgreSQL (database: cs_erp)
  |
  +-- Redis (cache, job queue)
  +-- BullMQ Workers (background jobs)
```

---

## Prerequisites

- Docker Engine 24+ and Docker Compose v2
- 4+ CPU cores, 8+ GB RAM (production)
- Domain name with DNS pointing to server
- SSL certificate (auto-provisioned by Caddy)

---

## Docker Build

### Multi-Stage Dockerfile

The application uses a three-stage Docker build:

1. **deps** -- Install Node.js dependencies (`npm ci`)
2. **builder** -- Build the Next.js application (`npm run build`)
3. **runner** -- Minimal production image with standalone output

**Base image:** `node:22-alpine`
**Output:** Next.js standalone mode (minimal footprint)
**Port:** 3100
**User:** Non-root (`nextjs:nodejs`, UID/GID 1001)

### Build Command

```bash
docker build -t cs-erp-web .
```

### Health Check

The container includes an automatic health check:

```
GET http://127.0.0.1:3100/api/health
Interval: 10s, Timeout: 5s, Retries: 5, Start period: 30s
```

---

## Environment Variables

All environment variables required for production (values omitted for security):

### Application

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to `production` |
| `PORT` | Application port (3100) |
| `NEXT_PUBLIC_APP_URL` | Public URL (e.g., `https://erp.yourdomain.com`) |
| `NEXT_TELEMETRY_DISABLED` | Set to `1` to disable telemetry |
| `LOG_LEVEL` | Logging level (`info`, `warn`, `error`) |

### Database

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection via PgBouncer |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL connection (for migrations only) |

### Authentication

| Variable | Description |
|----------|-------------|
| `JWT_PRIVATE_KEY_PATH` | Path to RS256 private key PEM file |
| `JWT_PUBLIC_KEY_PATH` | Path to RS256 public key PEM file |
| `CSRF_SECRET` | Secret for CSRF token generation |
| `COOKIE_DOMAIN` | Domain for auth cookies |

### Redis

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection string |

### AI Providers

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (if using) |
| `ANTHROPIC_API_KEY` | Anthropic API key (if using) |

### Email

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP authentication user |
| `SMTP_PASS` | SMTP authentication password |
| `EMAIL_FROM` | Default sender email address |

---

## Docker Compose

```yaml
# docker-compose.cs-erp.yml
services:
  cs-erp-web:
    image: cs-erp-web
    container_name: cs-erp-web
    restart: unless-stopped
    ports:
      - "3100:3100"
    env_file:
      - .env.cs-erp.prod
    volumes:
      - ./.keys:/app/.keys:ro
    depends_on:
      - postgres
      - redis
      - pgbouncer
```

### Starting the Stack

```bash
docker compose -f docker-compose.cs-erp.yml up -d
```

### Viewing Logs

```bash
docker logs -f cs-erp-web
```

---

## Database Setup

### PostgreSQL

- **Database:** `cs_erp`
- **User:** `cs_erp_user`
- **Host:** `postgres` (Docker network)
- **Connection pooling:** PgBouncer at `pgbouncer:5432`

### Running Migrations

Migrations are managed by `drizzle-kit` and must use the direct PostgreSQL connection (not PgBouncer):

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate

# Check migration status
npx drizzle-kit status
```

Migration files are stored in `drizzle/` with metadata in `drizzle/meta/`.

**Important:** Always run migrations before deploying a new application version. Always back up the database before running migrations in production.

### Row-Level Security

After creating tables, RLS must be enabled:

```sql
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON {table_name}
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

---

## JWT Key Generation

Generate RS256 key pair for JWT signing:

```bash
mkdir -p .keys
openssl genrsa -out .keys/private.pem 2048
openssl rsa -in .keys/private.pem -pubout -out .keys/public.pem
chmod 600 .keys/private.pem
chmod 644 .keys/public.pem
```

In Docker, mount keys as read-only volume: `./.keys:/app/.keys:ro`

---

## Reverse Proxy (Caddy)

Caddy handles HTTPS termination with automatic Let's Encrypt certificate management:

```
erp.yourdomain.com {
    reverse_proxy cs-erp-web:3100
    encode gzip
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
    }
}
```

### SSL / TLS

- Caddy auto-provisions and renews Let's Encrypt certificates
- TLS 1.2+ enforced (TLS 1.0/1.1 disabled)
- HSTS header set with 1-year max-age
- Certificate renewal happens automatically 30 days before expiry

---

## Backup Procedures

### Database Backup

```bash
# Full backup (run daily at 02:00 UTC via cron)
docker exec postgres pg_dump -U cs_erp_user -Fc cs_erp > backup_$(date +%Y%m%d).dump
```

### Database Restore

```bash
docker exec -i postgres pg_restore -U cs_erp_user -d cs_erp --clean backup_20260301.dump
```

### Backup Schedule

| Type | Frequency | Retention |
|------|-----------|-----------|
| Full database dump | Daily 02:00 UTC | 30 days |
| WAL archives | Continuous | 7 days |
| Application config | On change | 90 days |
| Redis snapshot | Hourly | 24 hours |
| Monthly archive | 1st of month | 1 year |

### WAL Archiving

Configure in `postgresql.conf` for point-in-time recovery:

```
archive_mode = on
archive_command = 'cp %p /backups/wal/%f'
```

---

## Scaling Considerations

### Horizontal Scaling

- CS-ERP is stateless (JWT auth, no server sessions) -- add replicas behind load balancer
- PgBouncer handles connection pooling across multiple app instances
- Redis is shared across instances for cache consistency
- BullMQ workers can be scaled independently as separate containers

### Vertical Scaling Guidelines

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| App container | 2 CPU, 2 GB | 4 CPU, 4 GB |
| PostgreSQL | 2 CPU, 4 GB | 8 CPU, 16 GB |
| PgBouncer | 1 CPU, 512 MB | 2 CPU, 1 GB |
| Redis | 1 CPU, 512 MB | 2 CPU, 2 GB |

Node.js configured with `--max-old-space-size=1536` (1.5GB).

---

## Deployment Checklist

- [ ] Environment variables configured in `.env.cs-erp.prod`
- [ ] JWT keys generated and mounted at `.keys/`
- [ ] Docker image built: `docker build -t cs-erp-web .`
- [ ] Database migrations applied: `npx drizzle-kit migrate`
- [ ] PgBouncer connection pool tested
- [ ] Redis connectivity verified
- [ ] Services started: `docker compose up -d`
- [ ] Health endpoint responding: `curl https://erp.yourdomain.com/api/health`
- [ ] Caddy SSL certificate provisioned
- [ ] Backup cron job configured
- [ ] Log aggregation configured
- [ ] `npm audit --audit-level=high` shows 0 vulnerabilities
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm run build` succeeds
- [ ] Application logs checked: `docker logs cs-erp-web`
