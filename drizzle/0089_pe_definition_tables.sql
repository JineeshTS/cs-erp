-- Migration 0089: Task-Process-Flow Definition Layer
-- Creates definition tables for the task/process/flow hierarchy
-- and instance tables for runtime task tracking.

-- ══════════════════════════════════════════════════════════════
-- 1. TASK DEFINITIONS
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pe_task_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  task_code VARCHAR(30) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  domain VARCHAR(50),

  -- Execution config
  executor_type VARCHAR(20),
  executor_mode VARCHAR(20),
  entity_table VARCHAR(100),
  entity_action VARCHAR(10),
  executor_config JSONB,

  -- Human/gate config
  gate_type VARCHAR(20),
  assigned_role VARCHAR(100),
  sla_hours NUMERIC(6,2),
  ai_assistable BOOLEAN NOT NULL DEFAULT true,

  -- Approval workflow bridge
  approval_workflow_id UUID REFERENCES wne_workflows(id) ON DELETE SET NULL,
  approval_trigger VARCHAR(20),

  -- Template metadata
  source VARCHAR(10) NOT NULL DEFAULT 'custom',
  cloned_from_id UUID REFERENCES pe_task_definitions(id) ON DELETE SET NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT true,

  -- Input/output spec
  input_fields JSONB,
  output_fields JSONB,
  validations JSONB,

  -- Standard columns
  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pe_task_def_tenant_idx ON pe_task_definitions(tenant_id);
CREATE INDEX IF NOT EXISTS pe_task_def_code_idx ON pe_task_definitions(task_code);
CREATE INDEX IF NOT EXISTS pe_task_def_domain_idx ON pe_task_definitions(domain);
CREATE INDEX IF NOT EXISTS pe_task_def_source_idx ON pe_task_definitions(source);
CREATE INDEX IF NOT EXISTS pe_task_def_executor_idx ON pe_task_definitions(executor_type);

-- ══════════════════════════════════════════════════════════════
-- 2. TASK STEP DEFINITIONS
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pe_task_step_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  task_definition_id UUID NOT NULL REFERENCES pe_task_definitions(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(10),
  role VARCHAR(100),
  is_optional BOOLEAN NOT NULL DEFAULT false,
  estimated_duration_minutes INTEGER,
  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pe_task_step_def_tenant_idx ON pe_task_step_definitions(tenant_id);
CREATE INDEX IF NOT EXISTS pe_task_step_def_task_idx ON pe_task_step_definitions(task_definition_id);
CREATE UNIQUE INDEX IF NOT EXISTS pe_task_step_def_order_uniq ON pe_task_step_definitions(task_definition_id, step_order);

-- ══════════════════════════════════════════════════════════════
-- 3. PROCESS DEFINITIONS
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pe_process_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  process_code VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  domain VARCHAR(50),

  -- Agent metadata
  agent_name VARCHAR(200),
  agent_type VARCHAR(30),
  automation_level VARCHAR(20),
  trigger_type VARCHAR(20),

  -- Input/output
  input_description TEXT,
  output_description TEXT,
  sla VARCHAR(50),

  -- Modules + dependencies
  connected_modules JSONB,
  cross_dependencies JSONB,

  -- Template metadata
  source VARCHAR(10) NOT NULL DEFAULT 'custom',
  cloned_from_id UUID REFERENCES pe_process_definitions(id) ON DELETE SET NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT true,

  -- Visual layout
  visual_layout JSONB,

  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pe_proc_def_tenant_idx ON pe_process_definitions(tenant_id);
CREATE INDEX IF NOT EXISTS pe_proc_def_code_idx ON pe_process_definitions(process_code);
CREATE INDEX IF NOT EXISTS pe_proc_def_domain_idx ON pe_process_definitions(domain);
CREATE INDEX IF NOT EXISTS pe_proc_def_source_idx ON pe_process_definitions(source);
CREATE INDEX IF NOT EXISTS pe_proc_def_automation_idx ON pe_process_definitions(automation_level);

-- ══════════════════════════════════════════════════════════════
-- 4. PROCESS-TASK LINKS
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pe_process_task_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  process_definition_id UUID NOT NULL REFERENCES pe_process_definitions(id) ON DELETE CASCADE,
  task_definition_id UUID NOT NULL REFERENCES pe_task_definitions(id) ON DELETE CASCADE,
  task_order INTEGER NOT NULL,
  phase VARCHAR(100),
  condition TEXT,
  is_parallel BOOLEAN NOT NULL DEFAULT false,
  parallel_group VARCHAR(50),
  dependency_refs JSONB,
  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pe_proc_task_link_tenant_idx ON pe_process_task_links(tenant_id);
CREATE INDEX IF NOT EXISTS pe_proc_task_link_proc_idx ON pe_process_task_links(process_definition_id);
CREATE INDEX IF NOT EXISTS pe_proc_task_link_task_idx ON pe_process_task_links(task_definition_id);
CREATE UNIQUE INDEX IF NOT EXISTS pe_proc_task_link_order_uniq ON pe_process_task_links(process_definition_id, task_order);

-- ══════════════════════════════════════════════════════════════
-- 5. E2E FLOW DEFINITIONS
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pe_flow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  flow_code VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(30),

  -- Trigger config
  trigger_event VARCHAR(100),
  entity_type VARCHAR(100),

  -- Metadata arrays
  participating_modules JSONB,
  ai_agents JSONB,
  handoff_points JSONB,
  typical_timeline VARCHAR(200),
  kpis JSONB,
  human_gates JSONB,
  conditional_branches JSONB,
  child_flows JSONB,

  -- Template metadata
  source VARCHAR(10) NOT NULL DEFAULT 'custom',
  cloned_from_id UUID REFERENCES pe_flow_definitions(id) ON DELETE SET NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT true,

  -- Visual layout
  visual_layout JSONB,

  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pe_flow_def_tenant_idx ON pe_flow_definitions(tenant_id);
CREATE INDEX IF NOT EXISTS pe_flow_def_code_idx ON pe_flow_definitions(flow_code);
CREATE INDEX IF NOT EXISTS pe_flow_def_category_idx ON pe_flow_definitions(category);
CREATE INDEX IF NOT EXISTS pe_flow_def_source_idx ON pe_flow_definitions(source);
CREATE INDEX IF NOT EXISTS pe_flow_def_trigger_idx ON pe_flow_definitions(trigger_event);

-- ══════════════════════════════════════════════════════════════
-- 6. FLOW-PROCESS LINKS
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pe_flow_process_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  flow_definition_id UUID NOT NULL REFERENCES pe_flow_definitions(id) ON DELETE CASCADE,
  process_definition_id UUID REFERENCES pe_process_definitions(id) ON DELETE CASCADE,
  task_definition_id UUID REFERENCES pe_task_definitions(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_name VARCHAR(200),
  phase VARCHAR(100),
  module VARCHAR(100),
  module_url VARCHAR(200),
  condition TEXT,
  is_parallel BOOLEAN NOT NULL DEFAULT false,
  parallel_group VARCHAR(50),
  dependency_refs JSONB,
  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT flow_proc_link_exactly_one CHECK (
    (process_definition_id IS NOT NULL AND task_definition_id IS NULL) OR
    (process_definition_id IS NULL AND task_definition_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS pe_flow_proc_link_tenant_idx ON pe_flow_process_links(tenant_id);
CREATE INDEX IF NOT EXISTS pe_flow_proc_link_flow_idx ON pe_flow_process_links(flow_definition_id);
CREATE INDEX IF NOT EXISTS pe_flow_proc_link_proc_idx ON pe_flow_process_links(process_definition_id);
CREATE INDEX IF NOT EXISTS pe_flow_proc_link_task_idx ON pe_flow_process_links(task_definition_id);
CREATE UNIQUE INDEX IF NOT EXISTS pe_flow_proc_link_order_uniq ON pe_flow_process_links(flow_definition_id, step_order);

-- ══════════════════════════════════════════════════════════════
-- 7. TASK INSTANCES (runtime)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pe_task_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_definition_id UUID REFERENCES pe_task_definitions(id) ON DELETE SET NULL,
  process_instance_id UUID REFERENCES pe_process_instances(id) ON DELETE SET NULL,
  flow_step_instance_id UUID REFERENCES pe_e2e_step_instances(id) ON DELETE SET NULL,
  task_code VARCHAR(30),
  name VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority VARCHAR(10) NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_role VARCHAR(100),
  due_at TIMESTAMPTZ,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pe_task_inst_tenant_idx ON pe_task_instances(tenant_id);
CREATE INDEX IF NOT EXISTS pe_task_inst_def_idx ON pe_task_instances(task_definition_id);
CREATE INDEX IF NOT EXISTS pe_task_inst_status_idx ON pe_task_instances(status);
CREATE INDEX IF NOT EXISTS pe_task_inst_assigned_idx ON pe_task_instances(assigned_to);
CREATE INDEX IF NOT EXISTS pe_task_inst_process_idx ON pe_task_instances(process_instance_id);
CREATE INDEX IF NOT EXISTS pe_task_inst_flow_step_idx ON pe_task_instances(flow_step_instance_id);
CREATE INDEX IF NOT EXISTS pe_task_inst_due_idx ON pe_task_instances(due_at);
CREATE INDEX IF NOT EXISTS pe_task_inst_created_at_idx ON pe_task_instances(created_at);

-- ══════════════════════════════════════════════════════════════
-- 8. TASK STEP INSTANCES (runtime)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pe_task_step_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_instance_id UUID NOT NULL REFERENCES pe_task_instances(id) ON DELETE CASCADE,
  task_step_definition_id UUID REFERENCES pe_task_step_definitions(id) ON DELETE SET NULL,
  step_order INTEGER NOT NULL,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(10),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  output_data JSONB,
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pe_task_step_inst_tenant_idx ON pe_task_step_instances(tenant_id);
CREATE INDEX IF NOT EXISTS pe_task_step_inst_task_idx ON pe_task_step_instances(task_instance_id);
CREATE INDEX IF NOT EXISTS pe_task_step_inst_status_idx ON pe_task_step_instances(status);
CREATE UNIQUE INDEX IF NOT EXISTS pe_task_step_inst_order_uniq ON pe_task_step_instances(task_instance_id, step_order);
