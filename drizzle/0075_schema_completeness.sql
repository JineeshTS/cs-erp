-- Migration 0075: Schema completeness — missing columns and indexes
-- Fixes M9 (missing deleted_at/updated_at), M10 (role_permissions), M11 (audit_log indexes)

-- ── M9: Add missing updated_at and deleted_at columns ──

-- auth_audit_log: add updated_at, deleted_at
ALTER TABLE auth_audit_log ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
ALTER TABLE auth_audit_log ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- permissions: add updated_at, deleted_at
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- ai_chat_messages: add updated_at, deleted_at
ALTER TABLE ai_chat_messages ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
ALTER TABLE ai_chat_messages ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- ai_usage_logs: add updated_at, deleted_at
ALTER TABLE ai_usage_logs ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
ALTER TABLE ai_usage_logs ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- pe_event_log: add updated_at, deleted_at
ALTER TABLE pe_event_log ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
ALTER TABLE pe_event_log ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- pe_flow_events: add updated_at, deleted_at
ALTER TABLE pe_flow_events ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
ALTER TABLE pe_flow_events ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- pe_step_entity_bindings: add updated_at, deleted_at
ALTER TABLE pe_step_entity_bindings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
ALTER TABLE pe_step_entity_bindings ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- pe_event_triggers: add deleted_at (has updated_at already)
ALTER TABLE pe_event_triggers ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- pe_e2e_step_instances: add deleted_at
ALTER TABLE pe_e2e_step_instances ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- pe_human_gates: add deleted_at
ALTER TABLE pe_human_gates ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- ── M10: role_permissions — add missing standard columns ──

ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT NOW();
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Backfill tenant_id from roles table
UPDATE role_permissions rp
SET tenant_id = r.tenant_id
FROM roles r
WHERE rp.role_id = r.id AND rp.tenant_id IS NULL;

-- Index on tenant_id
CREATE INDEX IF NOT EXISTS role_permissions_tenant_id_idx ON role_permissions(tenant_id);

-- ── M11: auth_audit_log — add indexes ──

CREATE INDEX IF NOT EXISTS auth_audit_log_tenant_id_idx ON auth_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS auth_audit_log_user_id_idx ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS auth_audit_log_event_type_idx ON auth_audit_log(event_type);
CREATE INDEX IF NOT EXISTS auth_audit_log_created_at_idx ON auth_audit_log(created_at);

-- M11: Make tenant_id NOT NULL where possible (after backfill)
-- ALTER TABLE auth_audit_log ALTER COLUMN tenant_id SET NOT NULL;
-- ^ Uncomment after verifying no NULL tenant_id rows exist

-- ── Additional missing FK indexes ──

CREATE INDEX IF NOT EXISTS permissions_module_idx ON permissions(module);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS role_assignments_assigned_by_idx ON role_assignments(assigned_by);
