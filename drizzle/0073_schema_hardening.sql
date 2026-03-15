-- Migration 0073: Schema hardening (soft deletes, indexes, constraints)
-- Fixes: Issues #7, #13, #26, #27, #28 from full codebase audit

-- ── Soft delete columns ──
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- ── FK indexes (missing per CLAUDE.md mandate) ──
CREATE INDEX IF NOT EXISTS users_tenant_id_idx ON users(tenant_id);
CREATE INDEX IF NOT EXISTS users_role_id_idx ON users(role_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_tenant_id_idx ON sessions(tenant_id);
CREATE INDEX IF NOT EXISTS roles_tenant_id_idx ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS role_assignments_user_id_idx ON role_assignments(user_id);
CREATE INDEX IF NOT EXISTS role_assignments_role_id_idx ON role_assignments(role_id);

-- ── Unique constraint: one email per tenant (Issue #7) ──
CREATE UNIQUE INDEX IF NOT EXISTS users_tenant_email_idx ON users(tenant_id, email);

-- ── Soft delete indexes for fast filtered queries ──
CREATE INDEX IF NOT EXISTS users_deleted_at_idx ON users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS roles_deleted_at_idx ON roles(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS tenants_deleted_at_idx ON tenants(deleted_at) WHERE deleted_at IS NOT NULL;
