# CS-ERP Deployment Guide

## Architecture Overview

CS-ERP runs as a containerized Next.js application with the following services:

```
[Internet] -> [Caddy (HTTPS)] -> [cs-erp-web:3100] -> [PgBouncer:5432] -> [PostgreSQL]
                                                    -> [Redis]
                                                    -> [BullMQ Workers]
```

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

The following environment variables must be configured (values not shown for security):

### Application
| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | Application port (3100) |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application |
| `NEXT_TELEMETRY_DISABLED` | Set to `1` to disable telemetry |

### Database
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (via PgBouncer) |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL connection (for migrations) |

### Authentication
| Variable | Description |
|----------|-------------|
| `JWT_PRIVATE_KEY_PATH` | Path to RS256 private key PEM file |
| `JWT_PUBLIC_KEY_PATH` | Path to RS256 public key PEM file |
| `CSRF_SECRET` | Secret for CSRF token generation |

### Redis
| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection string |

### AI Providers
| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |

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

The application is deployed via Docker Compose as part of the infrastructure stack:

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
      - 06-build-postgres-1
      - 06-build-redis-1
      - 06-build-pgbouncer-1
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
- Database: `cs_erp`
- User: `codilla`
- Host: `06-build-postgres-1` (Docker network) or `172.20.0.3` (host access)
- Connection pooling via PgBouncer at `06-build-pgbouncer-1:5432`

### Running Migrations
Migrations are managed by `drizzle-kit`:

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate

# Push schema directly (development only)
npx drizzle-kit push
```

Migrations are stored in the `/drizzle/` directory with snapshot metadata in `/drizzle/meta/`.

### Row-Level Security
After creating tables, RLS must be enabled:
```sql
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON {table_name}
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

---

## Reverse Proxy (Caddy)

Caddy handles HTTPS termination with automatic certificate management:

```
cs-erp.codilla.ai {
    reverse_proxy cs-erp-web:3100
}
```

Caddy configuration is in the main infrastructure Caddyfile.

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

## Deployment Checklist

1. Build Docker image: `docker build -t cs-erp-web .`
2. Verify environment variables in `.env.cs-erp.prod`
3. Ensure JWT keys exist in `.keys/` directory
4. Run database migrations: `npx drizzle-kit migrate`
5. Start services: `docker compose up -d`
6. Verify health check: `curl https://cs-erp.codilla.ai/api/health`
7. Run security audit: `npm audit --audit-level=high`
8. Verify TypeScript: `npx tsc --noEmit`
9. Check application logs: `docker logs cs-erp-web`

---

## Backup Procedures

### Database Backup
```bash
docker exec 06-build-postgres-1 pg_dump -U codilla cs_erp > backup_$(date +%Y%m%d).sql
```

### Database Restore
```bash
docker exec -i 06-build-postgres-1 psql -U codilla cs_erp < backup_20260301.sql
```

### Recommended Schedule
- **Full backup:** Daily at 02:00 UTC
- **WAL archiving:** Continuous for point-in-time recovery
- **Retention:** 30 days for daily backups, 1 year for monthly
- **Test restore:** Quarterly

---

## Scaling Considerations

- **Horizontal scaling:** Run multiple `cs-erp-web` containers behind Caddy load balancer
- **Connection pooling:** PgBouncer manages database connections across instances
- **Background jobs:** BullMQ workers can be scaled independently
- **Redis:** Used for caching and job queue; can be clustered for HA
- **Memory:** Node.js configured with `--max-old-space-size=1536` (1.5GB)
