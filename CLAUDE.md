# CS ERP — Claude Code Standards

Every session MUST read this file first. These rules are non-negotiable.

---

## Identity
This is an AI-First Container Shipping ERP for Qatar, UAE, KSA, and India.
- URL: https://cs-erp.codilla.ai
- Repo: /root/cs-erp
- DB: cs_erp (PostgreSQL via 06-build-postgres-1)
- Cache: Redis via 06-build-redis-1
- Container: cs-erp-web:3100

---

## Architecture Principles

### Performance (NON-NEGOTIABLE — this is a large ERP)
- ALL pages use Next.js Server Components by default — only add 'use client' when needed
- Every list/table page MUST use cursor-based pagination (not offset) — max 50 rows/page
- Every DB query MUST use indexes — never query without a WHERE on an indexed column
- N+1 queries are FORBIDDEN — use JOIN or batch fetch
- Heavy operations (PDF, email, exports) go to BullMQ background jobs — never in request/response
- Use PgBouncer connection pooling (host: 06-build-pgbouncer-1:5432) for all production queries
- Database URL for app: postgresql://codilla:lBpBckhQr0XyD8VRLg1PMOPRelvZhkXx@06-build-pgbouncer-1:5432/cs_erp
- React Suspense + loading.tsx on every route segment
- Images: Next.js Image component only, never <img>
- Bundle size: no barrel imports from large libs — import directly (e.g., lodash/get not lodash)

### Security (MANDATORY on every route)
- Every API route handler MUST validate input with Zod before any processing
- Never trust client input — validate server-side always
- Drizzle ORM parameterized queries only — never string interpolation in SQL
- Every mutation requires CSRF token check (X-CSRF-Token header)
- Auth check on every protected route via middleware — never inline checks
- Rate limiting on ALL auth endpoints and mutation endpoints
- Sensitive data (passwords, tokens) never in logs
- Error responses never leak stack traces or internal details
- All cookies: httpOnly=true, secure=true, sameSite='strict'
- Run `npm audit --audit-level=high` before any deploy — 0 high/critical vulnerabilities

### Consistency — Follow these EXACTLY
- File structure: src/app/(dashboard)/{module-slug}/
- Auth routes: src/app/api/auth/{action}/route.ts (login, register, logout, refresh, me)
- API routes: src/app/api/v1/{module-slug}/route.ts
- DB schema: src/db/schema/{module-slug}.ts
- Server actions: src/app/(modules)/{module-slug}/actions.ts
- Types: src/types/{module-slug}.ts
- Utilities: src/lib/{module-slug}/

### API Response Format (ALL routes must follow this)
```typescript
// Success
{ data: T, meta?: { total: number, cursor?: string } }

// Error
{ error: { code: string, message: string, details?: z.ZodError } }

// HTTP status codes:
// 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized
// 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Too Many Requests, 500 Internal Server Error
```

### Error Handling
- All API routes wrapped in try/catch — 500s return generic message, full error logged server-side
- All server actions use typed error returns — never throw to client
- UI shows user-friendly error messages — never raw error strings
- Use Sentry-compatible error structure (even if not using Sentry yet)

---

## Database Rules
- Every table MUST have: id (uuid default gen_random_uuid()), tenant_id (FK), created_at, updated_at
- All timestamps: timestamptz (with timezone) — never timestamp
- Soft deletes: deleted_at timestamptz nullable — never hard delete production data
- All FK columns must have explicit indexes
- Migrations via drizzle-kit — never manual SQL in production
- RLS: Enable RLS on all tables — policy: users can only see their tenant's data
  ```sql
  ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation ON {table}
    USING (tenant_id = current_setting('app.tenant_id')::uuid);
  ```

---

## UI / Design System Rules
- Component library: Radix UI primitives + Tailwind CSS only
- Colors: Use CSS variables from globals.css — never hardcode hex/rgb
- Typography: Use the defined text-* scale — never arbitrary font sizes
- Spacing: Tailwind scale only — no arbitrary values unless truly necessary
- Dark mode: All components MUST support dark mode via next-themes
- Arabic RTL: All layouts must support dir="rtl" — use logical CSS properties (ms/me not l/r)
- Icons: Lucide React only — no other icon library
- Loading states: Every async action shows a loading indicator — no silent waits
- Empty states: Every list/table has a proper empty state component
- Error states: Every async component has an error boundary

### Component Patterns
```typescript
// Server Component (default)
export default async function Page({ params }: { params: { id: string } }) { ... }

// Client Component (only when needed for interactivity)
'use client';
export function InteractiveComponent({ ... }: Props) { ... }

// Loading skeleton
export default function Loading() {
  return <Skeleton className="h-8 w-full" />;
}
```

---

## Authentication & Authorization
- Auth check: import { requireAuth } from '@/lib/auth/require-auth'
- Permission check: import { requirePermission } from '@/lib/auth/permissions'
- Usage in server components:
  ```typescript
  const user = await requireAuth(); // throws 401 if not authed
  await requirePermission(user, 'booking:create'); // throws 403 if no permission
  ```
- Available permissions follow format: `{module}:{action}`
  - Examples: booking:read, booking:create, booking:approve, vessel:manage, customs:submit

---

## Module Build Checklist
Before marking any module DONE:
- [ ] All DB migrations run successfully
- [ ] TypeScript strict mode: `npx tsc --noEmit` → 0 errors
- [ ] All API routes have Zod validation
- [ ] All API routes have auth + permission checks
- [ ] All list endpoints have pagination
- [ ] Loading states on all async UI
- [ ] Empty states on all tables
- [ ] Mobile responsive (test at 375px width)
- [ ] RTL layout works (add dir="rtl" to root and check)
- [ ] `npm run build` succeeds
- [ ] cs_erp_build_progress updated in DB

---

## DB Progress Tracking
After EVERY session, update:
```sql
INSERT INTO cs_erp_build_progress
  (module_id, phase, status, output, started_at, completed_at)
VALUES
  ('{module_id}', '{phase}', 'completed', '{json output}'::jsonb, NOW(), NOW())
ON CONFLICT (module_id, phase)
DO UPDATE SET status='completed', output=EXCLUDED.output, completed_at=NOW();
```

Phases: infra | codegen-p1 | codegen-p2 | codegen-p3 | deploy | verified

---

## What NEVER to do
- Never use `any` in TypeScript
- Never commit .env files, .keys/, or secrets
- Never use Math.random() for security tokens (use crypto.randomBytes)
- Never log passwords, tokens, or PII
- Never use eval() or Function()
- Never use dangerouslySetInnerHTML without sanitization
- Never bypass Zod validation
- Never write raw SQL strings
- Never use `as unknown as X` type casting
- Never skip loading states
- Never leave TODO comments in committed code — either implement or open an issue
