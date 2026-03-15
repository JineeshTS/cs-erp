-- Migration 0072: Create pe_step_entity_bindings table (D-006 entity binding)
-- Schema was defined but table migration was never applied

CREATE TABLE IF NOT EXISTS pe_step_entity_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  step_instance_id uuid NOT NULL REFERENCES pe_e2e_step_instances(id) ON DELETE CASCADE,
  flow_instance_id uuid NOT NULL REFERENCES pe_e2e_flow_instances(id) ON DELETE CASCADE,
  entity_table varchar(100) NOT NULL,
  entity_id uuid NOT NULL,
  entity_action varchar(20) NOT NULL,
  entity_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pe_entity_bind_tenant_idx ON pe_step_entity_bindings(tenant_id);
CREATE INDEX IF NOT EXISTS pe_entity_bind_step_idx ON pe_step_entity_bindings(step_instance_id);
CREATE INDEX IF NOT EXISTS pe_entity_bind_flow_idx ON pe_step_entity_bindings(flow_instance_id);
CREATE INDEX IF NOT EXISTS pe_entity_bind_entity_idx ON pe_step_entity_bindings(entity_table, entity_id);
