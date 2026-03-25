-- Migration: 0082_add_commodity_container_terminal_fks.sql
-- ERP-017: Add commodity_id, container_type_id, terminal_id FKs where needed.

-- Add commodity_id to tables with hs_code/commodity_type varchar
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'dgm_booking_screenings','dgm_manifests','oog_cargo_acceptances','oog_heavy_lifts',
    'loc_cargo_cutoffs','loc_cargo_mix_optimizations','ccm_claim_registrations',
    'firm_freight_invoices','firm_proforma_invoices','cpm_rate_sheets','cpm_spot_rates'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'commodity_id' AND table_schema = 'public')
    THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN commodity_id UUID REFERENCES mdm_commodities(id)', tbl);
      EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_commodity_id ON %I(commodity_id)', tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- Add container_type_id to tables with container_type/iso_code varchar
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'cap_space_controls','cap_stowage_plans','cap_loading_lists',
    'eqy_container_fleet','eqy_gate_movements','eqy_equipment_interchanges',
    'rcm_reefer_bookings','ecr_repositioning_plans','ddm_free_time_rules',
    'firm_freight_invoices','firm_proforma_invoices'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'container_type_id' AND table_schema = 'public')
    THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN container_type_id UUID REFERENCES mdm_container_types(id)', tbl);
      EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_container_type_id ON %I(container_type_id)', tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- Add terminal_id to tables with terminal_name varchar
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'cap_port_rotations','pam_port_call_plans','ptt_terminal_handling_charges',
    'eqy_gate_movements','icd_dry_ports'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'terminal_id' AND table_schema = 'public')
    THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN terminal_id UUID REFERENCES mdm_terminals(id)', tbl);
      EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_terminal_id ON %I(terminal_id)', tbl, tbl);
    END IF;
  END LOOP;
END $$;
