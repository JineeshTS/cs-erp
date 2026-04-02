-- Migration: 0080_add_port_id_fk.sql
-- ERP-015: Add port_id UUID FK column to tables with port_name/port_code varchar.
-- Phase 1: ADD column (nullable). Backfill and drop later (ERP-021/022).

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'bfm_fuel_rob_records','cap_port_rotations','cap_schedule_performances',
    'cpm_detention_demurrage','csp_tracking_events','cvm_delivery_reports','cvm_laytime_calculations',
    'ddm_demurrage_calculations','ddm_free_time_rules','ddm_predictions',
    'icd_dry_ports','icm_survey_appointments','iel_customs_filings','iel_port_connect_messages',
    'iot_port_equipments','loc_cargo_cutoffs','loc_overbooking_rollovers','ltr_port_stay_analyses',
    'mec_ballast_waters','mec_waste_managements','oog_port_approvals',
    'pam_cash_to_masters','pam_crew_change_coordinations','pam_disbursement_accounts',
    'pam_husbandry_services','pam_port_authority_communications','pam_port_call_plans',
    'pam_pre_arrival_checklists','pam_vessel_clearances',
    'pda_agent_statements','pda_cost_benchmarks','pda_expense_allocations','pda_final_das',
    'pda_port_costs','pda_proforma_estimates','pda_variance_analyses',
    'ptt_budget_plannings','ptt_cost_optimizations','ptt_invoice_validations',
    'ptt_pilotage_towage_charges','ptt_port_dues_wharfages','ptt_storage_demurrage_tariffs',
    'ptt_terminal_handling_charges',
    'sim_cargo_surveys','sim_draft_surveys','sim_hatch_inspections','sim_hire_surveys',
    'svp_eta_managements','svp_port_sequences'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = tbl AND column_name = 'port_id' AND table_schema = 'public'
    ) THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN port_id UUID REFERENCES mdm_ports(id)', tbl);
      EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_port_id ON %I(port_id)', tbl, tbl);
      RAISE NOTICE 'Added port_id to %', tbl;
    END IF;
  END LOOP;
END $$;
