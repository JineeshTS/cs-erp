-- Migration: 0085_custom_fields_and_number_sequences.sql
-- ERP-035: Custom field definitions + values tables
-- ERP-046: Number sequence configuration table

-- ═══════════════════════════════════════════════════════════════
-- ERP-035: Custom Fields System
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  field_label VARCHAR(200) NOT NULL,
  field_type VARCHAR(30) NOT NULL DEFAULT 'text',
  is_required BOOLEAN NOT NULL DEFAULT false,
  validation_rules JSONB DEFAULT '{}',
  options JSONB DEFAULT '[]',
  default_value TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  section_name VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMPTZ,
  effective_to TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, entity_type, field_name)
);

CREATE INDEX IF NOT EXISTS idx_cfd_tenant_entity ON custom_field_definitions(tenant_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_cfd_active ON custom_field_definitions(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  field_definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  value_text TEXT,
  value_json JSONB,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, entity_id, field_definition_id)
);

CREATE INDEX IF NOT EXISTS idx_cfv_entity ON custom_field_values(tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_cfv_definition ON custom_field_values(field_definition_id);

-- RLS
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_cfd ON custom_field_definitions
  USING ((safe_tenant_id() IS NULL) OR (tenant_id = safe_tenant_id()));
ALTER TABLE custom_field_definitions FORCE ROW LEVEL SECURITY;

ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_cfv ON custom_field_values
  USING ((safe_tenant_id() IS NULL) OR (tenant_id = safe_tenant_id()));
ALTER TABLE custom_field_values FORCE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- ERP-038: Business Rules Engine
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS business_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_name VARCHAR(200) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  trigger_event VARCHAR(50) NOT NULL DEFAULT 'on_create',
  rule_type VARCHAR(30) NOT NULL DEFAULT 'validation',
  conditions JSONB NOT NULL DEFAULT '[]',
  actions JSONB NOT NULL DEFAULT '[]',
  priority INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMPTZ,
  effective_to TIMESTAMPTZ,
  description TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_br_tenant_entity ON business_rules(tenant_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_br_active ON business_rules(is_active, entity_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_br_priority ON business_rules(priority);

ALTER TABLE business_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_br ON business_rules
  USING ((safe_tenant_id() IS NULL) OR (tenant_id = safe_tenant_id()));
ALTER TABLE business_rules FORCE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- ERP-046: Number Sequences
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS number_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL,
  prefix VARCHAR(20) NOT NULL DEFAULT '',
  date_format VARCHAR(20) DEFAULT 'YYMM',
  separator VARCHAR(5) DEFAULT '-',
  current_value BIGINT NOT NULL DEFAULT 0,
  pad_length INTEGER NOT NULL DEFAULT 5,
  reset_rule VARCHAR(20) NOT NULL DEFAULT 'never',
  last_reset_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_ns_tenant_entity ON number_sequences(tenant_id, entity_type);

ALTER TABLE number_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ns ON number_sequences
  USING ((safe_tenant_id() IS NULL) OR (tenant_id = safe_tenant_id()));
ALTER TABLE number_sequences FORCE ROW LEVEL SECURITY;
