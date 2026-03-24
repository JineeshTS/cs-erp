-- Migration 0078: Enforce globally unique emails + performance indexes
--
-- Context: Same email existed across multiple tenants, causing login
-- to pick an arbitrary tenant via LIMIT 1. Decision: enforce globally
-- unique emails (one account per email, period).

-- Step 1: Soft-delete duplicate users (keep most recently active per email)
WITH duplicates AS (
  SELECT id, email, ROW_NUMBER() OVER (
    PARTITION BY email ORDER BY last_login_at DESC NULLS LAST, created_at DESC
  ) as rn
  FROM users WHERE deleted_at IS NULL
)
UPDATE users SET deleted_at = NOW(), status = 'inactive'
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- Step 2: Drop old tenant-scoped unique index, add global unique on email
DROP INDEX IF EXISTS users_tenant_email_active_idx;
CREATE UNIQUE INDEX users_email_unique_active_idx ON users (email) WHERE deleted_at IS NULL;

-- Step 3: Performance indexes for auth queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS sessions_refresh_token_hash_idx
  ON sessions (refresh_token_hash);

CREATE INDEX CONCURRENTLY IF NOT EXISTS users_password_reset_token_idx
  ON users (password_reset_token) WHERE password_reset_token IS NOT NULL;
