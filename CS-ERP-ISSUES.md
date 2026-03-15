# CS ERP — Complete Issue Registry
# Generated: 2026-03-15 by full codebase audit (154K lines, 4,487 files)
# Purpose: Survives context compaction — authoritative issue list for fix session

---

## STATUS TRACKER

| # | Severity | Issue | File(s) | Status |
|---|----------|-------|---------|--------|
| 1 | CRITICAL | Date object in sql template — crashes human-gates stats | human-gate-manager.ts:439 | FIXED |
| 2 | CRITICAL | Date object in sql template — crashes e2e step update | e2e-flow-service.ts:219 | FIXED (was uncommitted) |
| 3 | CRITICAL | Login JSON parse SyntaxError — returns 500 not 400 | api/auth/login/route.ts | FIXED |
| 4 | CRITICAL | AI JSON parse failures — bad escaped chars from Claude | ai-step-executor.ts, ai-gate-preparer.ts, ai-tool-executor.ts | FIXED |
| 5 | CRITICAL | Dockerfile --ignore-scripts prevents bcrypt native build | Dockerfile:5 | FIXED |
| 6 | CRITICAL | Tenant isolation broken — set_config session-level under PgBouncer | lib/tenant/context.ts:21 | FIXED |
| 7 | CRITICAL | Cross-tenant login — email query without tenant_id | api/auth/login/route.ts:78 | OPEN (design decision needed) |
| 8 | HIGH | Auth bypass — isStaticAsset matches any URL with dot | middleware.ts:32 | FIXED |
| 9 | HIGH | CSRF dead code in admin users/roles PATCH/DELETE | admin/users/[userId]/route.ts, admin/roles/[roleId]/route.ts | FIXED |
| 10 | HIGH | checkGateSlas() no tenant isolation — cross-tenant SLA | human-gate-manager.ts:229-232 | DEFERRED (by-design cron) |
| 11 | HIGH | Roles PATCH/DELETE no tenant check — cross-tenant modification | admin/roles/[roleId]/route.ts | OPEN |
| 12 | HIGH | JWT key divergence — middleware uses PEM env, jwt.ts uses file path | middleware.ts + lib/jwt.ts | OPEN |
| 13 | HIGH | Roles hard delete instead of soft delete | admin/roles/[roleId]/route.ts:120-121 | OPEN |
| 14 | HIGH | Webhook CSRF misplaced — blocks webhooks, skips on user requests | tracking/gps-ingest/route.ts, tracking/container-event/route.ts | OPEN |
| 15 | HIGH | Hardcoded CSRF "1" in 2 components | run-process-button.tsx:94, run-e2e-flow-button.tsx:41 | FIXED |
| 16 | HIGH | No try/catch on 4 admin routes — unhandled errors | admin/users/route.ts, admin/users/[userId], admin/roles/route.ts, admin/roles/[roleId] | OPEN |
| 17 | HIGH | as unknown as AccessTokenPayload bypasses type safety | lib/jwt.ts:58 | OPEN |
| 18 | MEDIUM | new Date(cursor) unvalidated in 226 routes | All paginated routes | OPEN |
| 19 | MEDIUM | Dead links on dashboard — 4 KPI cards link to nonexistent routes | (dashboard)/page.tsx lines 434,441,449,465 | OPEN |
| 20 | MEDIUM | Missing dark mode ThemeProvider — dark: classes never activate | app/layout.tsx | OPEN |
| 21 | MEDIUM | Missing RTL dir attribute | app/layout.tsx | OPEN |
| 22 | MEDIUM | N+1 query in admin roles GET | admin/roles/route.ts:27-40 | OPEN |
| 23 | MEDIUM | N+1 query in risk-alert-service detectBottlenecks | risk-alert-service.ts:144-162 | OPEN |
| 24 | MEDIUM | Dashboard KPI trends always "No change" — identical queries | (dashboard)/page.tsx queries 0-7 | OPEN |
| 25 | MEDIUM | AI chat silently fails — empty catch blocks | chat-panel.tsx | OPEN |
| 26 | MEDIUM | Missing indexes on FK columns across core tables | users, sessions, roles schema files | OPEN |
| 27 | MEDIUM | Missing deleted_at on core tables | users, tenants, roles, sessions, permissions | OPEN |
| 28 | MEDIUM | roleAssignments.userId no FK reference | roles.ts:34 | OPEN |
| 29 | MEDIUM | In-memory rate limiting won't work with replicas | lib/rate-limit.ts | OPEN |
| 30 | MEDIUM | Onboarding wizard calls potentially unsupported API field | onboarding-wizard.tsx:84 | OPEN |
| 31 | LOW | Unused dependencies: next-auth, @auth/drizzle-adapter, @types/pg | package.json | OPEN |
| 32 | LOW | Stale .env.example — references NEXTAUTH vars | .env.example | OPEN |
| 33 | LOW | CLAUDE.md documents wrong import paths | CLAUDE.md | OPEN |
| 34 | LOW | Sentry not configured — silent no-op | next.config.ts + sentry configs | OPEN |
| 35 | LOW | Duplicate migrations 0068/0071/0072 | drizzle/ | OPEN |
| 36 | LOW | Unused Search icon import in topbar | topbar.tsx | OPEN |
| 37 | LOW | Login does not reject pending_verification users | api/auth/login/route.ts | OPEN |
| 38 | LOW | No root page.tsx — / shows 404 for edge cases | app/ | OPEN |

---

## DETAILED ROOT CAUSES

### Issue 1: Date in sql template — human-gate-manager.ts

**File**: `/root/cs-erp/src/lib/process-engine/human-gate-manager.ts`
**Line**: 439
**Code**: `breached: sql<number>\`count(*) filter (where ... < ${now})::int\``
**Root cause**: `now` is `new Date()` (line 430). Drizzle's `sql` template passes it as a query parameter. The pg driver expects string/Buffer, gets Date object.
**Fix**: Change `${now}` to `${now.toISOString()}`

### Issue 2: Date in sql template — e2e step update

**From logs**: `EXTRACT(EPOCH FROM ($4::timestamptz - "started_at")) * 1000`
**Root cause**: The step update query uses a raw `sql` expression for duration_ms calculation, passing `new Date()` directly.
**Fix**: Find the exact location in e2e-flow-service.ts or step-complete route, change Date to .toISOString()

### Issue 3: Login JSON parse

**File**: `/root/cs-erp/src/app/api/auth/login/route.ts`
**Line**: ~28
**Root cause**: `request.json()` throws SyntaxError on malformed JSON, caught by outer catch which returns 500. Should be separate try/catch returning 400.
**Fix**: Wrap `request.json()` in its own try/catch returning 400 "Invalid JSON body"

### Issue 4: AI JSON parse failures

**Files**: `ai-step-executor.ts:219`, `ai-gate-preparer.ts:231`, `ai-tool-executor.ts:253`
**Root cause**: Claude AI output may contain invalid JSON escape sequences (\a, \x, etc). The code strips markdown fences but doesn't sanitize escape chars before JSON.parse().
**Fix**: Add `jsonStr.replace(/\\(?!["\\/bfnrtu])/g, '\\\\')` before JSON.parse()

### Issue 5: Dockerfile bcrypt

**File**: `/root/cs-erp/Dockerfile`
**Line**: 5
**Root cause**: `npm ci --ignore-scripts` skips bcrypt's native compilation. The binary is never built.
**Fix**: Add `RUN npm rebuild bcrypt` after COPY node_modules in builder stage, OR remove --ignore-scripts

### Issue 6: Tenant isolation under PgBouncer

**File**: `/root/cs-erp/src/lib/tenant/context.ts`
**Line**: 21
**Root cause**: `set_config('app.tenant_id', ..., false)` sets session-level (not transaction-level). PgBouncer in transaction mode reuses sessions across requests, leaking tenant context.
**Fix**: Change `false` to `true` (transaction-local) and ensure queries run within transactions

### Issue 7: Cross-tenant login

**File**: `/root/cs-erp/src/app/api/auth/login/route.ts`
**Line**: 78
**Root cause**: `eq(users.email, email)` without `eq(users.tenantId, ...)`. Same email in multiple tenants returns arbitrary one.
**Fix**: Either require tenant slug in login (common for multi-tenant), or add unique constraint on email globally

### Issue 8: Auth bypass via dot in URL

**File**: `/root/cs-erp/src/middleware.ts`
**Line**: ~32
**Root cause**: `pathname.includes(".")` classifies any URL with a dot as a static asset, bypassing auth
**Fix**: Use extension-based check: `pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff2?)$/)`

### Issues 9-17: See status tracker above — root causes documented in agent reports

### Issue 15: Hardcoded CSRF "1"

**Files**: `run-process-button.tsx:94`, `run-e2e-flow-button.tsx:41`
**Root cause**: Instead of reading CSRF token from cookie, these components hardcode `"x-csrf-token": "1"`
**Fix**: Read from `document.cookie` like other components do

### Issue 18: Cursor validation

**Pattern**: 226 routes use `new Date(cursor)` without validation
**Fix**: Add utility function that validates cursor before creating Date, return 400 on invalid
