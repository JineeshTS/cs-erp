# CS ERP — Complete Issue Registry
# Generated: 2026-03-15 by full codebase audit (154K lines, 4,487 files)
# Updated: 2026-03-16 — 38 original + 21 deep audit fixes (ALL RESOLVED)

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

## BATCH 5 — DEEP AUDIT FIXES (1e80788)

| # | Severity | Issue | File(s) | Status |
|---|----------|-------|---------|--------|
| C1 | CRITICAL | advanceFlowStep tx.execute returns untyped rows — flow advancement broken | e2e-flow-service.ts:207 | FIXED — typed select + .for("update") |
| C2 | CRITICAL | Gate auto-approve reads recommendation.amount (undefined) — gates auto-approve when they shouldn't | human-gate-manager.ts:324 | FIXED — reads estimatedAmount, default 0 |
| C3 | CRITICAL | checkGateSlas no tenant isolation — cross-tenant SLA leak | human-gate-manager.ts:229 | FIXED — requires tenantId param |
| C5 | CRITICAL | 3 tenant routes missing try/catch — stack trace leakage | tenants/[id]/ + members/ | FIXED |
| H5 | HIGH | SLA notifications fire repeatedly (no idempotency) | human-gate-manager.ts:234 | FIXED — tracks _warningNotifiedAt/_breachNotifiedAt |
| H6 | HIGH | Gate auto-approve doesn't resume execution | human-gate-manager.ts:329 | FIXED — calls resumeAfterGate |
| H8 | HIGH | CRM tools overwrite metadata instead of merging (5 functions) | crm-tools.ts | FIXED — spread existing metadata |
| M1 | MEDIUM | detectBottlenecks uses createdAt instead of startedAt | risk-alert-service.ts:185 | FIXED |
| M7 | MEDIUM | escalateGate lacks tenant isolation in update | human-gate-manager.ts:395 | FIXED |
| M8 | MEDIUM | reserve_equipment UPDATE lacks tenant isolation | operations-tools.ts:263 | FIXED |
| C4 | CRITICAL | check_credit queries wrong ID (accountId vs customerId) | operations-tools.ts:78 | FIXED (c49f1dc) — customerCode lookup chain |
| C6 | CRITICAL | Step conditions never evaluated (218 steps) | step-executor.ts | FIXED (9aa66b3) — evaluateSimpleCondition() |
| H4 | HIGH | mapFieldsToColumns mass-assignment vulnerability | entity-step-executor.ts:365 | FIXED (9849c7c) — removed catch-all pass-through |
| M2 | MEDIUM | createApproval sets requestedById = approverId | service.ts:295 | FIXED (9849c7c) — separate requestedById param |
| M3 | MEDIUM | Legacy advanceProcessStep has no transaction locking | service.ts:151 | FIXED (9849c7c) — FOR UPDATE transaction |
| M4 | MEDIUM | Auth routes use inconsistent error format | login, refresh | FIXED (9849c7c) — standardized to { error: { code, message } } |
| M5 | MEDIUM | No rate limiting on /api/auth/refresh | refresh/route.ts | FIXED (9849c7c) — 30/15min per IP |
| M6 | MEDIUM | AI JSON repair regex corrupts valid unicode | 3 files | FIXED (9849c7c) — regex removed |
| M9 | MEDIUM | 11 tables missing deleted_at, 6 missing updated_at | Various schema files | FIXED (c49f1dc) — migration 0075 |
| M10 | MEDIUM | role_permissions missing standard columns | permissions.ts | FIXED (c49f1dc) — migration 0075, 1499 rows backfilled |
| M11 | MEDIUM | auth_audit_log zero indexes, nullable tenant_id | audit-log.ts | FIXED (c49f1dc) — 4 indexes + sessions/roles indexes |

---

## DEPLOYMENT LOG

- **Commit ab937df** (batch 1): Issues 1-6, 8-9, 15 — critical crashes + security
- **Commit 0847601** (batch 2): Issue 16 — try/catch on admin routes
- **Commit e254cfb** (batch 3): Issues 7, 11-14, 17-38 — all remaining
- **Commit dfc3238** (batch 4): 485 files — async rate limiter, auth hardening, pagination cursor fix
- **Commit 1e80788** (batch 5): 9 files — critical process engine fixes from deep audit
- **Commit 9849c7c** (batch 6): 7 files — auth, process engine, security fixes
- **Commit 9aa66b3** (C6): step condition evaluation (218 steps)
- **Commit c49f1dc** (C4+M9-M11): credit check ID resolution + schema completeness
- **Migration 0073** applied: soft deletes, FK indexes, unique(tenant_id, email)
- **Migration 0074** applied: partial unique index, role_assignments tenant_id
- **Migration 0075** applied: schema completeness (columns, indexes, role_permissions backfill)
- **Container 06-build-cs-erp-web-1**: healthy, verified 200 on /login and /api/health
