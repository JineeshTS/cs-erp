-- Migration: 0081_add_customer_id_fk.sql
-- ERP-016: Add customer_id UUID FK to tables with customer_name varchar.

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'abi_customer_revenue_analytics','arcc_bad_debt_provisions','arcc_cash_applications',
    'arcc_collection_workflows','arcc_credit_limits','arcc_customer_accounts','arcc_payment_predictions',
    'cfm_revenue_recognitions','ddm_demurrage_calculations','ddm_detention_trackings','ddm_disputes',
    'ddm_free_time_rules','ddm_invoices','ddm_notifications','ddm_predictions','ddm_waivers',
    'dgm_booking_screenings','ecr_return_incentives','firm_debit_credit_notes','firm_dunning_actions',
    'firm_freight_invoices','firm_invoice_disputes','firm_proforma_invoices','icd_last_mile_deliveries',
    'loc_revenue_integrity_audits','loc_rolling_upgrades','lrm_leakage_detections','lrm_rate_integrities',
    'lrm_revenue_accruals','oog_cargo_acceptances','oog_heavy_lifts','rcm_claim_analytics',
    'rcm_cold_chain_docs','rcm_reefer_bookings'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = tbl AND column_name = 'customer_id' AND table_schema = 'public'
    ) THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN customer_id UUID REFERENCES mdm_customers(id)', tbl);
      EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_customer_id ON %I(customer_id)', tbl, tbl);
      RAISE NOTICE 'Added customer_id to %', tbl;
    END IF;
  END LOOP;
END $$;
