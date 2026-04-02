-- Migration 0074: Fix unique email constraint to allow re-registration after soft delete
-- The unique(tenant_id, email) constraint from 0073 prevents a new user from registering
-- with the same email in the same tenant after the old user was soft-deleted.
-- Fix: replace with a partial unique index that only applies to non-deleted records.

DROP INDEX IF EXISTS users_tenant_email_idx;
CREATE UNIQUE INDEX users_tenant_email_active_idx ON users(tenant_id, email) WHERE deleted_at IS NULL;

-- Also add tenant_id to role_assignments (was missing entirely — CRITICAL security gap)
ALTER TABLE role_assignments ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);
ALTER TABLE role_assignments ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE role_assignments ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
CREATE INDEX IF NOT EXISTS role_assignments_tenant_id_idx ON role_assignments(tenant_id);

-- Backfill tenant_id from users table for existing role_assignments
UPDATE role_assignments ra SET tenant_id = u.tenant_id FROM users u WHERE ra.user_id = u.id AND ra.tenant_id IS NULL;

-- Now make it NOT NULL (after backfill)
-- ALTER TABLE role_assignments ALTER COLUMN tenant_id SET NOT NULL;
-- ^ Uncomment after verifying backfill succeeded

-- Add tenant_id to role_permissions (for RLS)
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS role_permissions_tenant_id_idx ON role_permissions(tenant_id);
