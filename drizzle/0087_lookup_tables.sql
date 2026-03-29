-- ERP-032: Reference lookup tables (currencies, countries, regions, trade lanes, vessel classes)

-- ISO 4217 currencies
CREATE TABLE IF NOT EXISTS mdm_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code VARCHAR(3) NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10),
  decimal_places INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mdm_currencies_tenant_code ON mdm_currencies(tenant_id, code) WHERE deleted_at IS NULL;
ALTER TABLE mdm_currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON mdm_currencies USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- ISO 3166-1 countries
CREATE TABLE IF NOT EXISTS mdm_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code VARCHAR(2) NOT NULL,
  code3 VARCHAR(3),
  name VARCHAR(100) NOT NULL,
  numeric_code VARCHAR(3),
  region_id UUID,
  phone_code VARCHAR(10),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mdm_countries_tenant_code ON mdm_countries(tenant_id, code) WHERE deleted_at IS NULL;
ALTER TABLE mdm_countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON mdm_countries USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Geographic regions
CREATE TABLE IF NOT EXISTS mdm_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  parent_region_id UUID REFERENCES mdm_regions(id),
  region_type VARCHAR(30) NOT NULL DEFAULT 'geographic',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mdm_regions_tenant_code ON mdm_regions(tenant_id, code) WHERE deleted_at IS NULL;
ALTER TABLE mdm_regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON mdm_regions USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Add region_id FK to countries
ALTER TABLE mdm_countries ADD CONSTRAINT fk_countries_region FOREIGN KEY (region_id) REFERENCES mdm_regions(id);

-- Trade lanes (origin region → destination region)
CREATE TABLE IF NOT EXISTS mdm_trade_lanes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code VARCHAR(30) NOT NULL,
  name VARCHAR(150) NOT NULL,
  origin_region_id UUID REFERENCES mdm_regions(id),
  destination_region_id UUID REFERENCES mdm_regions(id),
  direction VARCHAR(20) DEFAULT 'both',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mdm_trade_lanes_tenant_code ON mdm_trade_lanes(tenant_id, code) WHERE deleted_at IS NULL;
ALTER TABLE mdm_trade_lanes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON mdm_trade_lanes USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Vessel classes
CREATE TABLE IF NOT EXISTS mdm_vessel_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  min_teu INTEGER,
  max_teu INTEGER,
  min_dwt NUMERIC(12,2),
  max_dwt NUMERIC(12,2),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mdm_vessel_classes_tenant_code ON mdm_vessel_classes(tenant_id, code) WHERE deleted_at IS NULL;
ALTER TABLE mdm_vessel_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON mdm_vessel_classes USING (tenant_id = current_setting('app.tenant_id')::uuid);
