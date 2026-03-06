# CS-ERP System Architecture

## Overview

CS-ERP is an AI-First Container Shipping ERP system designed for shipping lines operating in Qatar, UAE, KSA, and India. The platform covers the full spectrum of container shipping operations across 61 modules with 528+ database tables and 100 AI agents.

**Production URL:** https://cs-erp.codilla.ai

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| ORM | Drizzle ORM with postgres-js driver |
| Database | PostgreSQL (with PgBouncer connection pooling) |
| Cache | Redis |
| Job Queue | BullMQ (background jobs for PDF, email, exports) |
| Auth | Custom RS256 JWT (asymmetric key pair) |
| Validation | Zod v4 |
| UI Components | Radix UI primitives + Tailwind CSS |
| Icons | Lucide React |
| Container | Docker (multi-stage build, Node.js 22 Alpine) |
| Reverse Proxy | Caddy (automatic HTTPS) |
| Connection Pool | PgBouncer |

---

## Architecture Layers

### 1. Presentation Layer
- **Server Components** by default for optimal performance
- **Client Components** (`'use client'`) only when interactivity is required
- React Suspense with `loading.tsx` on every route segment
- Dark mode support via `next-themes`
- RTL (Arabic) layout support with logical CSS properties
- Mobile responsive design (tested at 375px)

### 2. API Layer
- RESTful API routes under `/api/v1/{module-slug}/`
- All inputs validated with Zod schemas before processing
- Cursor-based pagination on all list endpoints (max 50 rows/page)
- CSRF token validation on all mutations
- Rate limiting on auth and mutation endpoints

**Standard Response Format:**
```json
// Success
{ "data": {}, "meta": { "total": 100, "cursor": "abc123" } }

// Error
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }
```

### 3. Business Logic Layer
- Server actions in `src/app/(modules)/{module-slug}/actions.ts`
- Utility functions in `src/lib/{module-slug}/`
- Type definitions in `src/types/{module-slug}.ts`
- 100 AI agents for automated decision-making and process optimization

### 4. Data Layer
- 528+ tables across 61 modules
- Multi-tenant architecture with Row-Level Security (RLS)
- Every table has: `id` (UUID), `tenant_id` (FK), `created_at`, `updated_at`
- Soft deletes via `deleted_at` column (never hard delete)
- All timestamps use `timestamptz` (with timezone)
- Migrations managed by `drizzle-kit`

---

## Authentication & Authorization

### JWT Architecture
- **Algorithm:** RS256 (asymmetric)
- **Access tokens:** 15-minute expiry
- **Refresh tokens:** 30-day expiry with rotation
- **Key storage:** `.keys/` directory (private/public PEM files)
- **Library:** `jose` for JWT sign/verify

### Cookie Configuration
- `cs_access_token` and `cs_refresh_token`
- `httpOnly=true`, `secure=true`, `sameSite='strict'`

### RBAC Permissions
- Permission format: `{module}:{action}` (e.g., `booking:create`, `vessel:manage`)
- Auth check: `requireAuth()` throws 401 if not authenticated
- Permission check: `requirePermission(user, 'booking:create')` throws 403 if unauthorized
- Middleware-based route protection (public paths: `/login`, `/register`, `/api/auth/*`, `/api/health`)

---

## Multi-Tenant Design

Every table enforces tenant isolation through PostgreSQL Row-Level Security:

```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON {table}
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

All queries are scoped to the authenticated user's tenant. Cross-tenant data access is architecturally impossible at the database level.

---

## Infrastructure

### Docker Deployment
- **Multi-stage build:** deps -> builder -> runner
- **Base image:** `node:22-alpine`
- **Standalone output** for minimal production image
- **Non-root user** (`nextjs:nodejs`, UID/GID 1001)
- **Port:** 3100
- **Health check:** `GET /api/health` every 10 seconds

### Connection Pooling
- PgBouncer at `06-build-pgbouncer-1:5432`
- Manages connection pool to PostgreSQL backend
- Prevents connection exhaustion under load

### Services Architecture
```
[Caddy] -> [cs-erp-web:3100] -> [PgBouncer:5432] -> [PostgreSQL]
                              -> [Redis]
                              -> [BullMQ Workers]
```

---

## Performance Guidelines

- Server Components by default (no unnecessary `'use client'`)
- Cursor-based pagination on all list views (never offset pagination)
- Indexed queries only (every DB query uses WHERE on indexed columns)
- N+1 queries forbidden (use JOIN or batch fetch)
- Heavy operations (PDF generation, email, exports) deferred to BullMQ background jobs
- Direct imports from libraries (e.g., `lodash/get` not `lodash`)
- Next.js `Image` component only (never raw `<img>`)

---

## Security Measures

- Zod validation on every API route before processing
- Drizzle ORM parameterized queries (never string interpolation)
- CSRF token check on all mutations
- Rate limiting on auth and mutation endpoints
- No secrets in logs (passwords, tokens, PII)
- Error responses never leak stack traces
- `npm audit --audit-level=high` enforced (zero high/critical vulnerabilities)
