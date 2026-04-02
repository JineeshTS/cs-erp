-- Migration: 0086_proforma_templates_and_voyages.sql
-- CS Team Requirement: Proforma service templates + generated voyage instances
-- Supports the Indo-Gulf Express (IGX) use case

-- ═══════════════════════════════════════════════════════════════
-- Proforma Service Templates (the "blueprint" for a service route)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS proforma_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_loop_id UUID REFERENCES ltr_service_loops(id),
  service_name VARCHAR(100) NOT NULL,
  service_code VARCHAR(20) NOT NULL,
  frequency_days INTEGER NOT NULL DEFAULT 7,
  total_rotation_days INTEGER NOT NULL DEFAULT 14,
  direction VARCHAR(20) NOT NULL DEFAULT 'outbound',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, service_code)
);

CREATE INDEX idx_proforma_templates_tenant ON proforma_templates(tenant_id);
CREATE INDEX idx_proforma_templates_status ON proforma_templates(status);

-- ═══════════════════════════════════════════════════════════════
-- Proforma Port Calls (the port rotation within a template)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS proforma_port_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES proforma_templates(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  port_id UUID REFERENCES mdm_ports(id),
  port_code VARCHAR(10) NOT NULL,
  port_name VARCHAR(100) NOT NULL,
  distance_nm NUMERIC(10,1),
  planned_speed_knots NUMERIC(5,1),
  steaming_hours NUMERIC(8,2),
  port_stay_hours NUMERIC(8,2) NOT NULL DEFAULT 24,
  day_offset NUMERIC(8,2) NOT NULL DEFAULT 0,
  cargo_cutoff_hours INTEGER DEFAULT 48,
  vgm_cutoff_hours INTEGER DEFAULT 24,
  doc_cutoff_hours INTEGER DEFAULT 24,
  call_purpose VARCHAR(30) DEFAULT 'both',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(template_id, sequence)
);

CREATE INDEX idx_proforma_port_calls_template ON proforma_port_calls(template_id);
CREATE INDEX idx_proforma_port_calls_tenant ON proforma_port_calls(tenant_id);

-- ═══════════════════════════════════════════════════════════════
-- Generated Voyages (concrete voyage instances from a template)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS generated_voyages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES proforma_templates(id),
  vessel_id UUID REFERENCES mdm_vessels(id),
  voyage_number VARCHAR(20) NOT NULL,
  cycle_number INTEGER,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'planned',
  is_extra_loader BOOLEAN DEFAULT false,
  is_blank_sailing BOOLEAN DEFAULT false,
  delay_remarks TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, voyage_number)
);

CREATE INDEX idx_generated_voyages_tenant ON generated_voyages(tenant_id);
CREATE INDEX idx_generated_voyages_template ON generated_voyages(template_id);
CREATE INDEX idx_generated_voyages_vessel ON generated_voyages(vessel_id);
CREATE INDEX idx_generated_voyages_status ON generated_voyages(status);
CREATE INDEX idx_generated_voyages_start ON generated_voyages(start_date);

-- ═══════════════════════════════════════════════════════════════
-- Voyage Port Calls (concrete port calls within a generated voyage)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS voyage_port_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  voyage_id UUID NOT NULL REFERENCES generated_voyages(id) ON DELETE CASCADE,
  proforma_port_call_id UUID REFERENCES proforma_port_calls(id),
  sequence INTEGER NOT NULL,
  port_id UUID REFERENCES mdm_ports(id),
  port_code VARCHAR(10) NOT NULL,
  port_name VARCHAR(100) NOT NULL,
  -- Planned (from template calculation)
  planned_arrival TIMESTAMPTZ NOT NULL,
  planned_departure TIMESTAMPTZ NOT NULL,
  -- Actual (filled during execution)
  actual_arrival TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,
  -- Cutoffs (calculated from planned_departure)
  cargo_cutoff TIMESTAMPTZ,
  vgm_cutoff TIMESTAMPTZ,
  doc_cutoff TIMESTAMPTZ,
  -- Performance
  delay_hours NUMERIC(8,2) DEFAULT 0,
  delay_reason VARCHAR(100),
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  call_purpose VARCHAR(30) DEFAULT 'both',
  terminal_name VARCHAR(100),
  berth_name VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(voyage_id, sequence)
);

CREATE INDEX idx_voyage_port_calls_voyage ON voyage_port_calls(voyage_id);
CREATE INDEX idx_voyage_port_calls_tenant ON voyage_port_calls(tenant_id);
CREATE INDEX idx_voyage_port_calls_status ON voyage_port_calls(status);
CREATE INDEX idx_voyage_port_calls_planned_arr ON voyage_port_calls(planned_arrival);
CREATE INDEX idx_voyage_port_calls_port ON voyage_port_calls(port_id);

-- RLS on all 4 new tables
ALTER TABLE proforma_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_pt ON proforma_templates USING ((safe_tenant_id() IS NULL) OR (tenant_id = safe_tenant_id()));
ALTER TABLE proforma_templates FORCE ROW LEVEL SECURITY;

ALTER TABLE proforma_port_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ppc ON proforma_port_calls USING ((safe_tenant_id() IS NULL) OR (tenant_id = safe_tenant_id()));
ALTER TABLE proforma_port_calls FORCE ROW LEVEL SECURITY;

ALTER TABLE generated_voyages ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_gv ON generated_voyages USING ((safe_tenant_id() IS NULL) OR (tenant_id = safe_tenant_id()));
ALTER TABLE generated_voyages FORCE ROW LEVEL SECURITY;

ALTER TABLE voyage_port_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_vpc ON voyage_port_calls USING ((safe_tenant_id() IS NULL) OR (tenant_id = safe_tenant_id()));
ALTER TABLE voyage_port_calls FORCE ROW LEVEL SECURITY;
