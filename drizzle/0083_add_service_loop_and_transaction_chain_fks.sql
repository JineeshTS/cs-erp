-- Migration: 0083_add_service_loop_and_transaction_chain_fks.sql
-- ERP-018: Add service_loop_id FK linking schedules/voyages to trade route service loops
-- ERP-019: Add cross-module FKs for transaction chain (booking→voyage→invoice→payment)

-- ERP-018: service_loop_id on schedule/voyage tables
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'cap_vessel_schedules','svp_service_schedules','svp_deployment_plans',
    'fdp_deployment_decisions','fdp_deployment_contracts'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'service_loop_id' AND table_schema = 'public')
    THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN service_loop_id UUID REFERENCES ltr_service_loops(id)', tbl);
      EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_service_loop_id ON %I(service_loop_id)', tbl, tbl);
      RAISE NOTICE 'Added service_loop_id to %', tbl;
    END IF;
  END LOOP;
END $$;

-- ERP-019: Transaction chain FKs

-- Bookings → vessel schedule
ALTER TABLE csp_portal_bookings ADD COLUMN IF NOT EXISTS vessel_schedule_id UUID REFERENCES cap_vessel_schedules(id);
CREATE INDEX IF NOT EXISTS idx_csp_portal_bookings_vessel_schedule_id ON csp_portal_bookings(vessel_schedule_id);

-- Invoices → booking
ALTER TABLE firm_freight_invoices ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES csp_portal_bookings(id);
CREATE INDEX IF NOT EXISTS idx_firm_freight_invoices_booking_id ON firm_freight_invoices(booking_id);

-- Invoices → voyage
ALTER TABLE firm_freight_invoices ADD COLUMN IF NOT EXISTS voyage_id UUID REFERENCES cap_vessel_schedules(id);
CREATE INDEX IF NOT EXISTS idx_firm_freight_invoices_voyage_id ON firm_freight_invoices(voyage_id);

-- BLs → booking
ALTER TABLE odm_bills_of_lading ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES csp_portal_bookings(id);
CREATE INDEX IF NOT EXISTS idx_odm_bills_of_lading_booking_id ON odm_bills_of_lading(booking_id);

-- BLs → voyage
ALTER TABLE odm_bills_of_lading ADD COLUMN IF NOT EXISTS voyage_id UUID REFERENCES cap_vessel_schedules(id);
CREATE INDEX IF NOT EXISTS idx_odm_bills_of_lading_voyage_id ON odm_bills_of_lading(voyage_id);
