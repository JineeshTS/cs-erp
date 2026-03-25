-- Migration: 0084_add_audit_columns_and_indexes.sql
-- ERP-026: Add created_by/updated_by to all tables
-- ERP-027: Add missing indexes to SVP module (8 tables with zero indexes)
-- ERP-028: Fix financial precision (integer → numeric(15,2))

-- ═══════════════════════════════════════════════════════════════
-- ERP-026: created_by / updated_by on ALL tables
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('tenants', 'drizzle_migrations')
  LOOP
    -- Add created_by if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = tbl.table_name AND column_name = 'created_by' AND table_schema = 'public'
    ) THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN created_by UUID REFERENCES users(id)', tbl.table_name);
    END IF;
    -- Add updated_by if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = tbl.table_name AND column_name = 'updated_by' AND table_schema = 'public'
    ) THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN updated_by UUID REFERENCES users(id)', tbl.table_name);
    END IF;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- ERP-027: SVP module indexes (8 tables had ZERO indexes)
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_svp_service_schedules_tenant ON svp_service_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_svp_service_schedules_status ON svp_service_schedules(status);
CREATE INDEX IF NOT EXISTS idx_svp_service_schedules_vessel ON svp_service_schedules(vessel_name);

CREATE INDEX IF NOT EXISTS idx_svp_port_sequences_tenant ON svp_port_sequences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_svp_port_sequences_status ON svp_port_sequences(status);

CREATE INDEX IF NOT EXISTS idx_svp_canal_transits_tenant ON svp_canal_transits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_svp_canal_transits_status ON svp_canal_transits(status);

CREATE INDEX IF NOT EXISTS idx_svp_eta_managements_tenant ON svp_eta_managements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_svp_eta_managements_status ON svp_eta_managements(status);

CREATE INDEX IF NOT EXISTS idx_svp_voyage_optimizations_tenant ON svp_voyage_optimizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_svp_voyage_optimizations_status ON svp_voyage_optimizations(status);

CREATE INDEX IF NOT EXISTS idx_svp_speed_fuel_analyses_tenant ON svp_speed_fuel_analyses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_svp_speed_fuel_analyses_status ON svp_speed_fuel_analyses(status);

CREATE INDEX IF NOT EXISTS idx_svp_weather_routings_tenant ON svp_weather_routings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_svp_weather_routings_status ON svp_weather_routings(status);

CREATE INDEX IF NOT EXISTS idx_svp_deployment_plans_tenant ON svp_deployment_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_svp_deployment_plans_status ON svp_deployment_plans(status);

-- ═══════════════════════════════════════════════════════════════
-- ERP-028: Fix financial precision (integer → numeric(15,2))
-- ═══════════════════════════════════════════════════════════════

-- cap_revenue_analytics
ALTER TABLE cap_revenue_analytics
  ALTER COLUMN total_revenue TYPE numeric(15,2) USING total_revenue::numeric(15,2),
  ALTER COLUMN revenue_per_teu TYPE numeric(15,2) USING revenue_per_teu::numeric(15,2);

-- mdm_tariff_codes
ALTER TABLE mdm_tariff_codes
  ALTER COLUMN rate_amount TYPE numeric(15,2) USING rate_amount::numeric(15,2);

-- mdm_customers
ALTER TABLE mdm_customers
  ALTER COLUMN credit_limit_amount TYPE numeric(15,2) USING credit_limit_amount::numeric(15,2);
