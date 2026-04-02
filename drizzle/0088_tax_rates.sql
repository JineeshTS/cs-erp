-- ERP-107: Configurable tax rates table (replaces hardcoded VAT rates)

CREATE TABLE IF NOT EXISTS mdm_tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  jurisdiction VARCHAR(10) NOT NULL,
  tax_type VARCHAR(20) NOT NULL DEFAULT 'VAT',
  rate_percent NUMERIC(5,2) NOT NULL,
  description VARCHAR(200),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mdm_tax_rates_tenant_juris_type
  ON mdm_tax_rates(tenant_id, jurisdiction, tax_type) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_mdm_tax_rates_tenant ON mdm_tax_rates(tenant_id);
ALTER TABLE mdm_tax_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON mdm_tax_rates USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Seed default rates for common jurisdictions
-- (will be inserted per-tenant when tenant is created, or manually)
