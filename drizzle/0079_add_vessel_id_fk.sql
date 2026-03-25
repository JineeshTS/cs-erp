-- Migration: 0079_add_vessel_id_fk.sql
-- ERP-014: Add vessel_id UUID FK column to all tables that have vessel_name varchar.
-- Phase 1: ADD column (nullable). Phase 2 (ERP-021): backfill from vessel_name → mdm_vessels.name match.
-- Phase 3 (ERP-022): DROP vessel_name after backfill verified.
-- This migration is additive-only — no data loss, no breaking changes.

-- Helper: Add vessel_id column with FK to mdm_vessels if it doesn't exist
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'abi_voyage_analytics','bfm_bunker_orders','bfm_bunker_stems','bfm_cost_allocations',
    'bfm_emissions_records','bfm_fuel_reconciliations','bfm_fuel_rob_records','bfm_optimization_runs',
    'bfm_quality_claims','bfm_quality_tests','bfm_sulphur_records','cap_vessel_schedules',
    'ccm_claim_predictions','ccm_claim_registrations','ccm_claim_settlements','ccm_damage_surveys',
    'ccm_liability_assessments','ccm_subrogation_recoveries','ccm_time_bar_trackings',
    'ccr_export_filings','ccr_import_clearances','ccr_psc_preparations',
    'cfm_port_disbursements','cfm_variance_analyses','cfm_voyage_budgets','cfm_voyage_pnl_reports',
    'crm_crew_rotations','crm_flag_state_compliance','crm_mlc_compliance','crm_payroll_allotments',
    'crm_welfare_medical_records','csp_shipment_tracking',
    'cvm_charter_parties','cvm_delivery_reports','cvm_fixtures','cvm_off_hire_events',
    'cvm_tc_contracts','cvm_utilization_analyses','cvm_vessel_performances','cvm_voyage_estimates','cvm_voyage_pnl',
    'dgm_booking_screenings','dgm_incident_reports','dgm_manifests',
    'ecr_repositioning_plans','fdp_deployment_contracts','fdp_deployment_decisions','fdp_fleet_financials',
    'icd_multimodal_bols','icm_cargo_insurance_policies','icm_claims_predictions','icm_claims_recoveries',
    'icm_claims_registrations','icm_hull_machinery_insurances','icm_loss_prevention_reports',
    'icm_pi_club_policies','icm_survey_appointments',
    'iot_vessel_positions','loc_cargo_cutoffs','loc_cargo_mix_optimizations','loc_load_factor_reports',
    'loc_overbooking_rollovers','loc_schedule_deviations','loc_slot_swap_coordinations',
    'lpr_hsse_records','lpr_incident_investigations','lpr_near_miss_reports','lpr_pi_club_scorings',
    'ltr_port_stay_analyses',
    'mec_annex_compliances','mec_anti_foulings','mec_ballast_waters','mec_cii_ratings',
    'mec_environmental_incidents','mec_sulphur_caps','mec_waste_managements',
    'odm_bills_of_lading','odm_cargo_tracking_events','odm_manifests','odm_regulatory_filings',
    'oog_cargo_acceptances','oog_heavy_lifts','oog_port_approvals','oog_stowage_plans',
    'pam_cash_to_masters','pam_crew_change_coordinations','pam_disbursement_accounts',
    'pam_husbandry_services','pam_port_authority_communications','pam_port_call_plans',
    'pam_pre_arrival_checklists','pam_vessel_clearances',
    'pda_expense_allocations','pda_final_das','pda_proforma_estimates','pda_variance_analyses',
    'ptt_pilotage_towage_charges','ptt_port_dues_wharfages',
    'rcm_breakdown_responses','rcm_reefer_bookings',
    'ser_alt_fuel_trackings','ser_carbon_footprints','ser_poseidon_alignments',
    'sim_cargo_surveys','sim_classification_surveys','sim_draft_surveys','sim_hatch_inspections',
    'sim_hire_surveys','sim_survey_reports',
    'svp_canal_transits','svp_deployment_plans','svp_eta_managements','svp_service_schedules',
    'svp_speed_fuel_analyses','svp_voyage_optimizations','svp_weather_routings',
    'vpe_carbon_emissions','vpe_cii_ratings','vpe_eexi_compliances','vpe_fuel_benchmarks',
    'vpe_noon_reports','vpe_speed_consumptions','vpe_voyage_performances','vpe_weather_routings',
    'vrs_hire_reconciliations','vrs_profit_benchmarks','vrs_tc_settlements','vrs_voyage_closes','vrs_voyage_pnls',
    'vtm_compliance_records','vtm_defect_repairs','vtm_dry_dock_plans','vtm_planned_maintenance_tasks',
    'vtm_predictive_maintenance','vtm_spare_parts','vtm_survey_trackings','vtm_technical_procurements'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Add vessel_id column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = tbl AND column_name = 'vessel_id' AND table_schema = 'public'
    ) THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN vessel_id UUID REFERENCES mdm_vessels(id)', tbl);
      EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_vessel_id ON %I(vessel_id)', tbl, tbl);
      RAISE NOTICE 'Added vessel_id to %', tbl;
    END IF;
  END LOOP;
END $$;
