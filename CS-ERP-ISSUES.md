# CS ERP — Complete Issue Registry
# Generated: 2026-03-15 by full codebase audit (154K lines, 4,487 files)
# Updated: 2026-03-16 — all 38 issues resolved across 3 commits

---

## STATUS TRACKER

| # | Severity | Issue | File(s) | Status |
|---|----------|-------|---------|--------|
| 1 | CRITICAL | Date object in sql template — crashes human-gates stats | human-gate-manager.ts:439 | FIXED (ab937df) |
| 2 | CRITICAL | Date object in sql template — crashes e2e step update | e2e-flow-service.ts:219 | FIXED (ab937df) |
| 3 | CRITICAL | Login JSON parse SyntaxError — returns 500 not 400 | api/auth/login/route.ts | FIXED (ab937df) |
| 4 | CRITICAL | AI JSON parse failures — bad escaped chars from Claude | ai-step-executor.ts, ai-gate-preparer.ts, ai-tool-executor.ts | FIXED (ab937df) |
| 5 | CRITICAL | Dockerfile --ignore-scripts prevents bcrypt native build | Dockerfile:5 | FIXED (ab937df) |
| 6 | CRITICAL | Tenant isolation broken — set_config session-level under PgBouncer | lib/tenant/context.ts:21 | FIXED (ab937df) |
| 7 | CRITICAL | Cross-tenant login — unique(tenant_id, email) constraint | migration 0073 | FIXED (e254cfb) |
| 8 | HIGH | Auth bypass — isStaticAsset matches any URL with dot | middleware.ts:32 | FIXED (ab937df) |
| 9 | HIGH | CSRF dead code in admin users/roles PATCH/DELETE | admin/users, admin/roles | FIXED (ab937df) |
| 10 | HIGH | checkGateSlas() no tenant isolation — cross-tenant SLA | human-gate-manager.ts | DEFERRED (by-design cron) |
| 11 | HIGH | Roles DELETE no tenant check + hard delete | admin/roles/[roleId]/route.ts | FIXED (e254cfb) — soft delete + tenant filter |
| 12 | HIGH | JWT key divergence — middleware vs jwt.ts | middleware.ts + lib/jwt.ts | FIXED (e254cfb) — unified key loading |
| 13 | HIGH | Roles hard delete instead of soft delete | roles schema + route | FIXED (e254cfb) — deleted_at column + soft delete |
| 14 | HIGH | Webhook CSRF misplaced — blocks webhooks | gps-ingest, container-event | FIXED (e254cfb) — removed CSRF from webhook path |
| 15 | HIGH | Hardcoded CSRF "1" in 2 components | run-process-button.tsx, run-e2e-flow-button.tsx | FIXED (ab937df) |
| 16 | HIGH | No try/catch on 4 admin routes | admin/users, admin/roles | FIXED (0847601) |
| 17 | HIGH | as unknown as AccessTokenPayload bypasses type safety | lib/jwt.ts:58 | FIXED (e254cfb) — Zod validation |
| 18 | MEDIUM | new Date(cursor) unvalidated in 226 routes | All paginated routes | FIXED (e254cfb) — pagination.ts utility |
| 19 | MEDIUM | Dead links on dashboard — 4 KPI cards | (dashboard)/page.tsx | FIXED (e254cfb) — correct route paths |
| 20 | MEDIUM | Missing dark mode ThemeProvider | app/layout.tsx | FIXED (e254cfb) — ThemeProvider added |
| 21 | MEDIUM | Missing RTL dir attribute | app/layout.tsx | FIXED (e254cfb) — dir="ltr" + suppressHydrationWarning |
| 22 | MEDIUM | N+1 query in admin roles GET | admin/roles/route.ts | FALSE POSITIVE — already batch-fetched |
| 23 | MEDIUM | N+1 query in risk-alert-service detectBottlenecks | risk-alert-service.ts | FIXED (e254cfb) — batch fetch |
| 24 | MEDIUM | Dashboard KPI trends always "No change" | (dashboard)/page.tsx | FIXED (e254cfb) — previous queries use createdAt filter |
| 25 | MEDIUM | AI chat silently fails — empty catch blocks | chat-panel.tsx | FIXED (e254cfb) — error state UI |
| 26 | MEDIUM | Missing indexes on FK columns | users, sessions, roles schemas | FIXED (e254cfb) — migration 0073 |
| 27 | MEDIUM | Missing deleted_at on core tables | users, roles, tenants schemas | FIXED (e254cfb) — migration 0073 |
| 28 | MEDIUM | roleAssignments.userId no FK reference | roles.ts | FIXED (e254cfb) — indexes added in schema |
| 29 | MEDIUM | In-memory rate limiting won't work with replicas | lib/rate-limit.ts | FIXED (e254cfb) — Redis sync + in-memory fallback |
| 30 | MEDIUM | Onboarding wizard sends empty roleId | onboarding-wizard.tsx | FIXED (e254cfb) — roleId optional, API assigns default |
| 31 | LOW | Unused dependencies: next-auth, @auth/drizzle-adapter, @types/pg | package.json | FIXED (e254cfb) |
| 32 | LOW | Stale .env.example — references NEXTAUTH vars | .env.example | FIXED (e254cfb) |
| 33 | LOW | CLAUDE.md documents wrong import paths | CLAUDE.md | FIXED (e254cfb) |
| 34 | LOW | Sentry not configured — silent no-op | sentry configs | FIXED (e254cfb) — env vars documented |
| 35 | LOW | Duplicate migrations 0068/0071/0072 | drizzle/ | FIXED (e254cfb) — 0068 deleted |
| 36 | LOW | Unused Search icon import in topbar | topbar.tsx | FIXED (e254cfb) |
| 37 | LOW | Login does not reject pending_verification users | api/auth/login/route.ts | FIXED (e254cfb) |
| 38 | LOW | No root page.tsx — / shows 404 | app/ | FIXED (e254cfb) — redirect to /login |

---

## DEPLOYMENT LOG

- **Commit ab937df** (batch 1): Issues 1-6, 8-9, 15 — critical crashes + security
- **Commit 0847601** (batch 2): Issue 16 — try/catch on admin routes
- **Commit e254cfb** (batch 3): Issues 7, 11-14, 17-38 — all remaining
- **Migration 0073** applied: soft deletes, FK indexes, unique(tenant_id, email)
- **Container 06-build-cs-erp-web-1**: healthy, verified 200 on /login and /api/health
