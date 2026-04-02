-- Migration: 0076_enable_rls.sql
-- Enable Row Level Security on all tenant-scoped tables
-- Tables with nullable tenant_id allow NULL rows (system records) for all tenants
-- Requires: ALTER DATABASE cs_erp SET app.tenant_id = '00000000-0000-0000-0000-000000000000';

ALTER TABLE aaf_agent_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_aaf_agent_runs ON aaf_agent_runs;
CREATE POLICY tenant_isolation_aaf_agent_runs ON aaf_agent_runs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE aaf_agent_runs FORCE ROW LEVEL SECURITY;

ALTER TABLE aaf_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_aaf_agents ON aaf_agents;
CREATE POLICY tenant_isolation_aaf_agents ON aaf_agents
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE aaf_agents FORCE ROW LEVEL SECURITY;

ALTER TABLE aaf_document_processing_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_aaf_document_processing_jobs ON aaf_document_processing_jobs;
CREATE POLICY tenant_isolation_aaf_document_processing_jobs ON aaf_document_processing_jobs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE aaf_document_processing_jobs FORCE ROW LEVEL SECURITY;

ALTER TABLE aaf_escalations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_aaf_escalations ON aaf_escalations;
CREATE POLICY tenant_isolation_aaf_escalations ON aaf_escalations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE aaf_escalations FORCE ROW LEVEL SECURITY;

ALTER TABLE aaf_orchestration_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_aaf_orchestration_tasks ON aaf_orchestration_tasks;
CREATE POLICY tenant_isolation_aaf_orchestration_tasks ON aaf_orchestration_tasks
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE aaf_orchestration_tasks FORCE ROW LEVEL SECURITY;

ALTER TABLE aaf_workflow_definitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_aaf_workflow_definitions ON aaf_workflow_definitions;
CREATE POLICY tenant_isolation_aaf_workflow_definitions ON aaf_workflow_definitions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE aaf_workflow_definitions FORCE ROW LEVEL SECURITY;

ALTER TABLE aaf_workflow_instances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_aaf_workflow_instances ON aaf_workflow_instances;
CREATE POLICY tenant_isolation_aaf_workflow_instances ON aaf_workflow_instances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE aaf_workflow_instances FORCE ROW LEVEL SECURITY;

ALTER TABLE abi_bi_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_abi_bi_reports ON abi_bi_reports;
CREATE POLICY tenant_isolation_abi_bi_reports ON abi_bi_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE abi_bi_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE abi_customer_revenue_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_abi_customer_revenue_analytics ON abi_customer_revenue_analytics;
CREATE POLICY tenant_isolation_abi_customer_revenue_analytics ON abi_customer_revenue_analytics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE abi_customer_revenue_analytics FORCE ROW LEVEL SECURITY;

ALTER TABLE abi_executive_kpi_dashboards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_abi_executive_kpi_dashboards ON abi_executive_kpi_dashboards;
CREATE POLICY tenant_isolation_abi_executive_kpi_dashboards ON abi_executive_kpi_dashboards
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE abi_executive_kpi_dashboards FORCE ROW LEVEL SECURITY;

ALTER TABLE abi_market_intelligence_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_abi_market_intelligence_reports ON abi_market_intelligence_reports;
CREATE POLICY tenant_isolation_abi_market_intelligence_reports ON abi_market_intelligence_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE abi_market_intelligence_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE abi_operational_efficiencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_abi_operational_efficiencies ON abi_operational_efficiencies;
CREATE POLICY tenant_isolation_abi_operational_efficiencies ON abi_operational_efficiencies
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE abi_operational_efficiencies FORCE ROW LEVEL SECURITY;

ALTER TABLE abi_predictive_forecasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_abi_predictive_forecasts ON abi_predictive_forecasts;
CREATE POLICY tenant_isolation_abi_predictive_forecasts ON abi_predictive_forecasts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE abi_predictive_forecasts FORCE ROW LEVEL SECURITY;

ALTER TABLE abi_trade_lane_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_abi_trade_lane_analytics ON abi_trade_lane_analytics;
CREATE POLICY tenant_isolation_abi_trade_lane_analytics ON abi_trade_lane_analytics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE abi_trade_lane_analytics FORCE ROW LEVEL SECURITY;

ALTER TABLE abi_voyage_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_abi_voyage_analytics ON abi_voyage_analytics;
CREATE POLICY tenant_isolation_abi_voyage_analytics ON abi_voyage_analytics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE abi_voyage_analytics FORCE ROW LEVEL SECURITY;

ALTER TABLE acm_ai_risk_detections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_acm_ai_risk_detections ON acm_ai_risk_detections;
CREATE POLICY tenant_isolation_acm_ai_risk_detections ON acm_ai_risk_detections
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE acm_ai_risk_detections FORCE ROW LEVEL SECURITY;

ALTER TABLE acm_internal_audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_acm_internal_audits ON acm_internal_audits;
CREATE POLICY tenant_isolation_acm_internal_audits ON acm_internal_audits
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE acm_internal_audits FORCE ROW LEVEL SECURITY;

ALTER TABLE acm_iso_certification_trackings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_acm_iso_certification_trackings ON acm_iso_certification_trackings;
CREATE POLICY tenant_isolation_acm_iso_certification_trackings ON acm_iso_certification_trackings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE acm_iso_certification_trackings FORCE ROW LEVEL SECURITY;

ALTER TABLE acm_policy_procedures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_acm_policy_procedures ON acm_policy_procedures;
CREATE POLICY tenant_isolation_acm_policy_procedures ON acm_policy_procedures
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE acm_policy_procedures FORCE ROW LEVEL SECURITY;

ALTER TABLE acm_regulatory_compliance_calendars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_acm_regulatory_compliance_calendars ON acm_regulatory_compliance_calendars;
CREATE POLICY tenant_isolation_acm_regulatory_compliance_calendars ON acm_regulatory_compliance_calendars
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE acm_regulatory_compliance_calendars FORCE ROW LEVEL SECURITY;

ALTER TABLE acm_regulatory_reporting_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_acm_regulatory_reporting_submissions ON acm_regulatory_reporting_submissions;
CREATE POLICY tenant_isolation_acm_regulatory_reporting_submissions ON acm_regulatory_reporting_submissions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE acm_regulatory_reporting_submissions FORCE ROW LEVEL SECURITY;

ALTER TABLE acm_risk_registers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_acm_risk_registers ON acm_risk_registers;
CREATE POLICY tenant_isolation_acm_risk_registers ON acm_risk_registers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE acm_risk_registers FORCE ROW LEVEL SECURITY;

ALTER TABLE acm_sanctions_screenings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_acm_sanctions_screenings ON acm_sanctions_screenings;
CREATE POLICY tenant_isolation_acm_sanctions_screenings ON acm_sanctions_screenings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE acm_sanctions_screenings FORCE ROW LEVEL SECURITY;

ALTER TABLE acm_sox_financial_controls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_acm_sox_financial_controls ON acm_sox_financial_controls;
CREATE POLICY tenant_isolation_acm_sox_financial_controls ON acm_sox_financial_controls
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE acm_sox_financial_controls FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_ai_agent_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_ai_agent_configs ON admin_ai_agent_configs;
CREATE POLICY tenant_isolation_admin_ai_agent_configs ON admin_ai_agent_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_ai_agent_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_approval_matrices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_approval_matrices ON admin_approval_matrices;
CREATE POLICY tenant_isolation_admin_approval_matrices ON admin_approval_matrices
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_approval_matrices FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_audit_logs ON admin_audit_logs;
CREATE POLICY tenant_isolation_admin_audit_logs ON admin_audit_logs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_audit_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_feature_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_feature_configs ON admin_feature_configs;
CREATE POLICY tenant_isolation_admin_feature_configs ON admin_feature_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_feature_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_feature_flags ON admin_feature_flags;
CREATE POLICY tenant_isolation_admin_feature_flags ON admin_feature_flags
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_feature_flags FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_import_export_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_import_export_jobs ON admin_import_export_jobs;
CREATE POLICY tenant_isolation_admin_import_export_jobs ON admin_import_export_jobs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_import_export_jobs FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_integration_endpoints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_integration_endpoints ON admin_integration_endpoints;
CREATE POLICY tenant_isolation_admin_integration_endpoints ON admin_integration_endpoints
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_integration_endpoints FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_licenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_licenses ON admin_licenses;
CREATE POLICY tenant_isolation_admin_licenses ON admin_licenses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_licenses FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_master_data_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_master_data_configs ON admin_master_data_configs;
CREATE POLICY tenant_isolation_admin_master_data_configs ON admin_master_data_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_master_data_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_module_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_module_configs ON admin_module_configs;
CREATE POLICY tenant_isolation_admin_module_configs ON admin_module_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_module_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_notification_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_notification_configs ON admin_notification_configs;
CREATE POLICY tenant_isolation_admin_notification_configs ON admin_notification_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_notification_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE admin_system_health_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_admin_system_health_metrics ON admin_system_health_metrics;
CREATE POLICY tenant_isolation_admin_system_health_metrics ON admin_system_health_metrics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE admin_system_health_metrics FORCE ROW LEVEL SECURITY;

ALTER TABLE ai_agent_model_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ai_agent_model_assignments ON ai_agent_model_assignments;
CREATE POLICY tenant_isolation_ai_agent_model_assignments ON ai_agent_model_assignments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ai_agent_model_assignments FORCE ROW LEVEL SECURITY;

ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ai_chat_messages ON ai_chat_messages;
CREATE POLICY tenant_isolation_ai_chat_messages ON ai_chat_messages
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ai_chat_messages FORCE ROW LEVEL SECURITY;

ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ai_chat_sessions ON ai_chat_sessions;
CREATE POLICY tenant_isolation_ai_chat_sessions ON ai_chat_sessions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ai_chat_sessions FORCE ROW LEVEL SECURITY;

ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ai_models ON ai_models;
CREATE POLICY tenant_isolation_ai_models ON ai_models
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ai_models FORCE ROW LEVEL SECURITY;

ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ai_providers ON ai_providers;
CREATE POLICY tenant_isolation_ai_providers ON ai_providers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ai_providers FORCE ROW LEVEL SECURITY;

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ai_usage_logs ON ai_usage_logs;
CREATE POLICY tenant_isolation_ai_usage_logs ON ai_usage_logs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ai_usage_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE anm_agency_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_anm_agency_documents ON anm_agency_documents;
CREATE POLICY tenant_isolation_anm_agency_documents ON anm_agency_documents
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE anm_agency_documents FORCE ROW LEVEL SECURITY;

ALTER TABLE anm_agent_commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_anm_agent_commissions ON anm_agent_commissions;
CREATE POLICY tenant_isolation_anm_agent_commissions ON anm_agent_commissions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE anm_agent_commissions FORCE ROW LEVEL SECURITY;

ALTER TABLE anm_agent_incentives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_anm_agent_incentives ON anm_agent_incentives;
CREATE POLICY tenant_isolation_anm_agent_incentives ON anm_agent_incentives
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE anm_agent_incentives FORCE ROW LEVEL SECURITY;

ALTER TABLE anm_booking_authorities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_anm_booking_authorities ON anm_booking_authorities;
CREATE POLICY tenant_isolation_anm_booking_authorities ON anm_booking_authorities
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE anm_booking_authorities FORCE ROW LEVEL SECURITY;

ALTER TABLE anm_ga_agreements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_anm_ga_agreements ON anm_ga_agreements;
CREATE POLICY tenant_isolation_anm_ga_agreements ON anm_ga_agreements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE anm_ga_agreements FORCE ROW LEVEL SECURITY;

ALTER TABLE anm_performance_kpis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_anm_performance_kpis ON anm_performance_kpis;
CREATE POLICY tenant_isolation_anm_performance_kpis ON anm_performance_kpis
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE anm_performance_kpis FORCE ROW LEVEL SECURITY;

ALTER TABLE anm_portal_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_anm_portal_configs ON anm_portal_configs;
CREATE POLICY tenant_isolation_anm_portal_configs ON anm_portal_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE anm_portal_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE anm_sub_agent_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_anm_sub_agent_configs ON anm_sub_agent_configs;
CREATE POLICY tenant_isolation_anm_sub_agent_configs ON anm_sub_agent_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE anm_sub_agent_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE apvm_ocr_extractions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_apvm_ocr_extractions ON apvm_ocr_extractions;
CREATE POLICY tenant_isolation_apvm_ocr_extractions ON apvm_ocr_extractions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE apvm_ocr_extractions FORCE ROW LEVEL SECURITY;

ALTER TABLE apvm_payment_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_apvm_payment_schedules ON apvm_payment_schedules;
CREATE POLICY tenant_isolation_apvm_payment_schedules ON apvm_payment_schedules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE apvm_payment_schedules FORCE ROW LEVEL SECURITY;

ALTER TABLE apvm_purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_apvm_purchase_orders ON apvm_purchase_orders;
CREATE POLICY tenant_isolation_apvm_purchase_orders ON apvm_purchase_orders
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE apvm_purchase_orders FORCE ROW LEVEL SECURITY;

ALTER TABLE apvm_spend_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_apvm_spend_analytics ON apvm_spend_analytics;
CREATE POLICY tenant_isolation_apvm_spend_analytics ON apvm_spend_analytics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE apvm_spend_analytics FORCE ROW LEVEL SECURITY;

ALTER TABLE apvm_three_way_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_apvm_three_way_matches ON apvm_three_way_matches;
CREATE POLICY tenant_isolation_apvm_three_way_matches ON apvm_three_way_matches
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE apvm_three_way_matches FORCE ROW LEVEL SECURITY;

ALTER TABLE apvm_vendor_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_apvm_vendor_invoices ON apvm_vendor_invoices;
CREATE POLICY tenant_isolation_apvm_vendor_invoices ON apvm_vendor_invoices
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE apvm_vendor_invoices FORCE ROW LEVEL SECURITY;

ALTER TABLE apvm_vendor_masters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_apvm_vendor_masters ON apvm_vendor_masters;
CREATE POLICY tenant_isolation_apvm_vendor_masters ON apvm_vendor_masters
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE apvm_vendor_masters FORCE ROW LEVEL SECURITY;

ALTER TABLE apvm_vendor_reconciliations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_apvm_vendor_reconciliations ON apvm_vendor_reconciliations;
CREATE POLICY tenant_isolation_apvm_vendor_reconciliations ON apvm_vendor_reconciliations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE apvm_vendor_reconciliations FORCE ROW LEVEL SECURITY;

ALTER TABLE arcc_aging_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_arcc_aging_reports ON arcc_aging_reports;
CREATE POLICY tenant_isolation_arcc_aging_reports ON arcc_aging_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE arcc_aging_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE arcc_bad_debt_provisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_arcc_bad_debt_provisions ON arcc_bad_debt_provisions;
CREATE POLICY tenant_isolation_arcc_bad_debt_provisions ON arcc_bad_debt_provisions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE arcc_bad_debt_provisions FORCE ROW LEVEL SECURITY;

ALTER TABLE arcc_cash_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_arcc_cash_applications ON arcc_cash_applications;
CREATE POLICY tenant_isolation_arcc_cash_applications ON arcc_cash_applications
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE arcc_cash_applications FORCE ROW LEVEL SECURITY;

ALTER TABLE arcc_cash_flow_forecasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_arcc_cash_flow_forecasts ON arcc_cash_flow_forecasts;
CREATE POLICY tenant_isolation_arcc_cash_flow_forecasts ON arcc_cash_flow_forecasts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE arcc_cash_flow_forecasts FORCE ROW LEVEL SECURITY;

ALTER TABLE arcc_collection_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_arcc_collection_workflows ON arcc_collection_workflows;
CREATE POLICY tenant_isolation_arcc_collection_workflows ON arcc_collection_workflows
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE arcc_collection_workflows FORCE ROW LEVEL SECURITY;

ALTER TABLE arcc_credit_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_arcc_credit_limits ON arcc_credit_limits;
CREATE POLICY tenant_isolation_arcc_credit_limits ON arcc_credit_limits
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE arcc_credit_limits FORCE ROW LEVEL SECURITY;

ALTER TABLE arcc_customer_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_arcc_customer_accounts ON arcc_customer_accounts;
CREATE POLICY tenant_isolation_arcc_customer_accounts ON arcc_customer_accounts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE arcc_customer_accounts FORCE ROW LEVEL SECURITY;

ALTER TABLE arcc_payment_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_arcc_payment_predictions ON arcc_payment_predictions;
CREATE POLICY tenant_isolation_arcc_payment_predictions ON arcc_payment_predictions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE arcc_payment_predictions FORCE ROW LEVEL SECURITY;

ALTER TABLE aws_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_aws_credentials ON aws_credentials;
CREATE POLICY tenant_isolation_aws_credentials ON aws_credentials
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE aws_credentials FORCE ROW LEVEL SECURITY;

ALTER TABLE aws_deployments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_aws_deployments ON aws_deployments;
CREATE POLICY tenant_isolation_aws_deployments ON aws_deployments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE aws_deployments FORCE ROW LEVEL SECURITY;

ALTER TABLE bfm_bunker_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bfm_bunker_orders ON bfm_bunker_orders;
CREATE POLICY tenant_isolation_bfm_bunker_orders ON bfm_bunker_orders
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE bfm_bunker_orders FORCE ROW LEVEL SECURITY;

ALTER TABLE bfm_bunker_stems ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bfm_bunker_stems ON bfm_bunker_stems;
CREATE POLICY tenant_isolation_bfm_bunker_stems ON bfm_bunker_stems
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE bfm_bunker_stems FORCE ROW LEVEL SECURITY;

ALTER TABLE bfm_cost_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bfm_cost_allocations ON bfm_cost_allocations;
CREATE POLICY tenant_isolation_bfm_cost_allocations ON bfm_cost_allocations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE bfm_cost_allocations FORCE ROW LEVEL SECURITY;

ALTER TABLE bfm_emissions_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bfm_emissions_records ON bfm_emissions_records;
CREATE POLICY tenant_isolation_bfm_emissions_records ON bfm_emissions_records
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE bfm_emissions_records FORCE ROW LEVEL SECURITY;

ALTER TABLE bfm_fuel_reconciliations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bfm_fuel_reconciliations ON bfm_fuel_reconciliations;
CREATE POLICY tenant_isolation_bfm_fuel_reconciliations ON bfm_fuel_reconciliations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE bfm_fuel_reconciliations FORCE ROW LEVEL SECURITY;

ALTER TABLE bfm_fuel_rob_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bfm_fuel_rob_records ON bfm_fuel_rob_records;
CREATE POLICY tenant_isolation_bfm_fuel_rob_records ON bfm_fuel_rob_records
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE bfm_fuel_rob_records FORCE ROW LEVEL SECURITY;

ALTER TABLE bfm_optimization_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bfm_optimization_runs ON bfm_optimization_runs;
CREATE POLICY tenant_isolation_bfm_optimization_runs ON bfm_optimization_runs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE bfm_optimization_runs FORCE ROW LEVEL SECURITY;

ALTER TABLE bfm_quality_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bfm_quality_claims ON bfm_quality_claims;
CREATE POLICY tenant_isolation_bfm_quality_claims ON bfm_quality_claims
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE bfm_quality_claims FORCE ROW LEVEL SECURITY;

ALTER TABLE bfm_quality_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bfm_quality_tests ON bfm_quality_tests;
CREATE POLICY tenant_isolation_bfm_quality_tests ON bfm_quality_tests
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE bfm_quality_tests FORCE ROW LEVEL SECURITY;

ALTER TABLE bfm_sulphur_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bfm_sulphur_records ON bfm_sulphur_records;
CREATE POLICY tenant_isolation_bfm_sulphur_records ON bfm_sulphur_records
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE bfm_sulphur_records FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_bay_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_bay_plans ON cap_bay_plans;
CREATE POLICY tenant_isolation_cap_bay_plans ON cap_bay_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_bay_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_demand_forecasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_demand_forecasts ON cap_demand_forecasts;
CREATE POLICY tenant_isolation_cap_demand_forecasts ON cap_demand_forecasts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_demand_forecasts FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_load_optimizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_load_optimizations ON cap_load_optimizations;
CREATE POLICY tenant_isolation_cap_load_optimizations ON cap_load_optimizations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_load_optimizations FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_loading_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_loading_lists ON cap_loading_lists;
CREATE POLICY tenant_isolation_cap_loading_lists ON cap_loading_lists
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_loading_lists FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_port_rotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_port_rotations ON cap_port_rotations;
CREATE POLICY tenant_isolation_cap_port_rotations ON cap_port_rotations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_port_rotations FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_revenue_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_revenue_analytics ON cap_revenue_analytics;
CREATE POLICY tenant_isolation_cap_revenue_analytics ON cap_revenue_analytics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_revenue_analytics FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_schedule_performances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_schedule_performances ON cap_schedule_performances;
CREATE POLICY tenant_isolation_cap_schedule_performances ON cap_schedule_performances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_schedule_performances FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_space_controls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_space_controls ON cap_space_controls;
CREATE POLICY tenant_isolation_cap_space_controls ON cap_space_controls
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_space_controls FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_stowage_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_stowage_plans ON cap_stowage_plans;
CREATE POLICY tenant_isolation_cap_stowage_plans ON cap_stowage_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_stowage_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_trade_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_trade_allocations ON cap_trade_allocations;
CREATE POLICY tenant_isolation_cap_trade_allocations ON cap_trade_allocations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_trade_allocations FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_transshipment_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_transshipment_plans ON cap_transshipment_plans;
CREATE POLICY tenant_isolation_cap_transshipment_plans ON cap_transshipment_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_transshipment_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE cap_vessel_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cap_vessel_schedules ON cap_vessel_schedules;
CREATE POLICY tenant_isolation_cap_vessel_schedules ON cap_vessel_schedules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cap_vessel_schedules FORCE ROW LEVEL SECURITY;

ALTER TABLE ccm_claim_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccm_claim_predictions ON ccm_claim_predictions;
CREATE POLICY tenant_isolation_ccm_claim_predictions ON ccm_claim_predictions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccm_claim_predictions FORCE ROW LEVEL SECURITY;

ALTER TABLE ccm_claim_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccm_claim_registrations ON ccm_claim_registrations;
CREATE POLICY tenant_isolation_ccm_claim_registrations ON ccm_claim_registrations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccm_claim_registrations FORCE ROW LEVEL SECURITY;

ALTER TABLE ccm_claim_settlements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccm_claim_settlements ON ccm_claim_settlements;
CREATE POLICY tenant_isolation_ccm_claim_settlements ON ccm_claim_settlements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccm_claim_settlements FORCE ROW LEVEL SECURITY;

ALTER TABLE ccm_damage_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccm_damage_surveys ON ccm_damage_surveys;
CREATE POLICY tenant_isolation_ccm_damage_surveys ON ccm_damage_surveys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccm_damage_surveys FORCE ROW LEVEL SECURITY;

ALTER TABLE ccm_liability_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccm_liability_assessments ON ccm_liability_assessments;
CREATE POLICY tenant_isolation_ccm_liability_assessments ON ccm_liability_assessments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccm_liability_assessments FORCE ROW LEVEL SECURITY;

ALTER TABLE ccm_portfolio_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccm_portfolio_analytics ON ccm_portfolio_analytics;
CREATE POLICY tenant_isolation_ccm_portfolio_analytics ON ccm_portfolio_analytics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccm_portfolio_analytics FORCE ROW LEVEL SECURITY;

ALTER TABLE ccm_subrogation_recoveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccm_subrogation_recoveries ON ccm_subrogation_recoveries;
CREATE POLICY tenant_isolation_ccm_subrogation_recoveries ON ccm_subrogation_recoveries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccm_subrogation_recoveries FORCE ROW LEVEL SECURITY;

ALTER TABLE ccm_time_bar_trackings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccm_time_bar_trackings ON ccm_time_bar_trackings;
CREATE POLICY tenant_isolation_ccm_time_bar_trackings ON ccm_time_bar_trackings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccm_time_bar_trackings FORCE ROW LEVEL SECURITY;

ALTER TABLE ccr_aeo_compliances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccr_aeo_compliances ON ccr_aeo_compliances;
CREATE POLICY tenant_isolation_ccr_aeo_compliances ON ccr_aeo_compliances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccr_aeo_compliances FORCE ROW LEVEL SECURITY;

ALTER TABLE ccr_duty_calculations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccr_duty_calculations ON ccr_duty_calculations;
CREATE POLICY tenant_isolation_ccr_duty_calculations ON ccr_duty_calculations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccr_duty_calculations FORCE ROW LEVEL SECURITY;

ALTER TABLE ccr_export_filings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccr_export_filings ON ccr_export_filings;
CREATE POLICY tenant_isolation_ccr_export_filings ON ccr_export_filings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccr_export_filings FORCE ROW LEVEL SECURITY;

ALTER TABLE ccr_imo_regulations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccr_imo_regulations ON ccr_imo_regulations;
CREATE POLICY tenant_isolation_ccr_imo_regulations ON ccr_imo_regulations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccr_imo_regulations FORCE ROW LEVEL SECURITY;

ALTER TABLE ccr_import_clearances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccr_import_clearances ON ccr_import_clearances;
CREATE POLICY tenant_isolation_ccr_import_clearances ON ccr_import_clearances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccr_import_clearances FORCE ROW LEVEL SECURITY;

ALTER TABLE ccr_isps_compliances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccr_isps_compliances ON ccr_isps_compliances;
CREATE POLICY tenant_isolation_ccr_isps_compliances ON ccr_isps_compliances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccr_isps_compliances FORCE ROW LEVEL SECURITY;

ALTER TABLE ccr_psc_preparations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccr_psc_preparations ON ccr_psc_preparations;
CREATE POLICY tenant_isolation_ccr_psc_preparations ON ccr_psc_preparations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccr_psc_preparations FORCE ROW LEVEL SECURITY;

ALTER TABLE ccr_transit_procedures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ccr_transit_procedures ON ccr_transit_procedures;
CREATE POLICY tenant_isolation_ccr_transit_procedures ON ccr_transit_procedures
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ccr_transit_procedures FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_agency_commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_agency_commissions ON cfm_agency_commissions;
CREATE POLICY tenant_isolation_cfm_agency_commissions ON cfm_agency_commissions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_agency_commissions FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_anomaly_detections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_anomaly_detections ON cfm_anomaly_detections;
CREATE POLICY tenant_isolation_cfm_anomaly_detections ON cfm_anomaly_detections
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_anomaly_detections FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_capex_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_capex_items ON cfm_capex_items;
CREATE POLICY tenant_isolation_cfm_capex_items ON cfm_capex_items
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_capex_items FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_container_costs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_container_costs ON cfm_container_costs;
CREATE POLICY tenant_isolation_cfm_container_costs ON cfm_container_costs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_container_costs FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_cost_centres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_cost_centres ON cfm_cost_centres;
CREATE POLICY tenant_isolation_cfm_cost_centres ON cfm_cost_centres
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_cost_centres FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_kpi_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_kpi_reports ON cfm_kpi_reports;
CREATE POLICY tenant_isolation_cfm_kpi_reports ON cfm_kpi_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_kpi_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_overhead_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_overhead_allocations ON cfm_overhead_allocations;
CREATE POLICY tenant_isolation_cfm_overhead_allocations ON cfm_overhead_allocations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_overhead_allocations FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_port_disbursements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_port_disbursements ON cfm_port_disbursements;
CREATE POLICY tenant_isolation_cfm_port_disbursements ON cfm_port_disbursements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_port_disbursements FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_revenue_recognitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_revenue_recognitions ON cfm_revenue_recognitions;
CREATE POLICY tenant_isolation_cfm_revenue_recognitions ON cfm_revenue_recognitions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_revenue_recognitions FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_variance_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_variance_analyses ON cfm_variance_analyses;
CREATE POLICY tenant_isolation_cfm_variance_analyses ON cfm_variance_analyses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_variance_analyses FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_voyage_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_voyage_budgets ON cfm_voyage_budgets;
CREATE POLICY tenant_isolation_cfm_voyage_budgets ON cfm_voyage_budgets
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_voyage_budgets FORCE ROW LEVEL SECURITY;

ALTER TABLE cfm_voyage_pnl_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cfm_voyage_pnl_reports ON cfm_voyage_pnl_reports;
CREATE POLICY tenant_isolation_cfm_voyage_pnl_reports ON cfm_voyage_pnl_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cfm_voyage_pnl_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE clm_container_redeliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_clm_container_redeliveries ON clm_container_redeliveries;
CREATE POLICY tenant_isolation_clm_container_redeliveries ON clm_container_redeliveries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE clm_container_redeliveries FORCE ROW LEVEL SECURITY;

ALTER TABLE clm_fleet_optimizers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_clm_fleet_optimizers ON clm_fleet_optimizers;
CREATE POLICY tenant_isolation_clm_fleet_optimizers ON clm_fleet_optimizers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE clm_fleet_optimizers FORCE ROW LEVEL SECURITY;

ALTER TABLE clm_lease_agreements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_clm_lease_agreements ON clm_lease_agreements;
CREATE POLICY tenant_isolation_clm_lease_agreements ON clm_lease_agreements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE clm_lease_agreements FORCE ROW LEVEL SECURITY;

ALTER TABLE clm_lease_cost_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_clm_lease_cost_allocations ON clm_lease_cost_allocations;
CREATE POLICY tenant_isolation_clm_lease_cost_allocations ON clm_lease_cost_allocations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE clm_lease_cost_allocations FORCE ROW LEVEL SECURITY;

ALTER TABLE clm_lease_vs_buy_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_clm_lease_vs_buy_analyses ON clm_lease_vs_buy_analyses;
CREATE POLICY tenant_isolation_clm_lease_vs_buy_analyses ON clm_lease_vs_buy_analyses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE clm_lease_vs_buy_analyses FORCE ROW LEVEL SECURITY;

ALTER TABLE clm_lessor_reconciliations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_clm_lessor_reconciliations ON clm_lessor_reconciliations;
CREATE POLICY tenant_isolation_clm_lessor_reconciliations ON clm_lessor_reconciliations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE clm_lessor_reconciliations FORCE ROW LEVEL SECURITY;

ALTER TABLE clm_mnr_damage_billings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_clm_mnr_damage_billings ON clm_mnr_damage_billings;
CREATE POLICY tenant_isolation_clm_mnr_damage_billings ON clm_mnr_damage_billings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE clm_mnr_damage_billings FORCE ROW LEVEL SECURITY;

ALTER TABLE clm_onhire_offhires ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_clm_onhire_offhires ON clm_onhire_offhires;
CREATE POLICY tenant_isolation_clm_onhire_offhires ON clm_onhire_offhires
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE clm_onhire_offhires FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_ai_pricing_models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_ai_pricing_models ON cpm_ai_pricing_models;
CREATE POLICY tenant_isolation_cpm_ai_pricing_models ON cpm_ai_pricing_models
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_ai_pricing_models FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_dead_freight_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_dead_freight_records ON cpm_dead_freight_records;
CREATE POLICY tenant_isolation_cpm_dead_freight_records ON cpm_dead_freight_records
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_dead_freight_records FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_detention_demurrage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_detention_demurrage ON cpm_detention_demurrage;
CREATE POLICY tenant_isolation_cpm_detention_demurrage ON cpm_detention_demurrage
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_detention_demurrage FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_pricing_approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_pricing_approvals ON cpm_pricing_approvals;
CREATE POLICY tenant_isolation_cpm_pricing_approvals ON cpm_pricing_approvals
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_pricing_approvals FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_profitability_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_profitability_analyses ON cpm_profitability_analyses;
CREATE POLICY tenant_isolation_cpm_profitability_analyses ON cpm_profitability_analyses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_profitability_analyses FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_rate_benchmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_rate_benchmarks ON cpm_rate_benchmarks;
CREATE POLICY tenant_isolation_cpm_rate_benchmarks ON cpm_rate_benchmarks
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_rate_benchmarks FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_revenue_leakages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_revenue_leakages ON cpm_revenue_leakages;
CREATE POLICY tenant_isolation_cpm_revenue_leakages ON cpm_revenue_leakages
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_revenue_leakages FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_special_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_special_rates ON cpm_special_rates;
CREATE POLICY tenant_isolation_cpm_special_rates ON cpm_special_rates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_special_rates FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_surcharges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_surcharges ON cpm_surcharges;
CREATE POLICY tenant_isolation_cpm_surcharges ON cpm_surcharges
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_surcharges FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_tariff_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_tariff_rates ON cpm_tariff_rates;
CREATE POLICY tenant_isolation_cpm_tariff_rates ON cpm_tariff_rates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_tariff_rates FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_tariffs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_tariffs ON cpm_tariffs;
CREATE POLICY tenant_isolation_cpm_tariffs ON cpm_tariffs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_tariffs FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_vsa_slot_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_vsa_slot_rates ON cpm_vsa_slot_rates;
CREATE POLICY tenant_isolation_cpm_vsa_slot_rates ON cpm_vsa_slot_rates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_vsa_slot_rates FORCE ROW LEVEL SECURITY;

ALTER TABLE cpm_yield_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cpm_yield_targets ON cpm_yield_targets;
CREATE POLICY tenant_isolation_cpm_yield_targets ON cpm_yield_targets
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cpm_yield_targets FORCE ROW LEVEL SECURITY;

ALTER TABLE crm_certificate_trackings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_crm_certificate_trackings ON crm_certificate_trackings;
CREATE POLICY tenant_isolation_crm_certificate_trackings ON crm_certificate_trackings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE crm_certificate_trackings FORCE ROW LEVEL SECURITY;

ALTER TABLE crm_crew_rotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_crm_crew_rotations ON crm_crew_rotations;
CREATE POLICY tenant_isolation_crm_crew_rotations ON crm_crew_rotations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE crm_crew_rotations FORCE ROW LEVEL SECURITY;

ALTER TABLE crm_flag_state_compliance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_crm_flag_state_compliance ON crm_flag_state_compliance;
CREATE POLICY tenant_isolation_crm_flag_state_compliance ON crm_flag_state_compliance
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE crm_flag_state_compliance FORCE ROW LEVEL SECURITY;

ALTER TABLE crm_manning_agencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_crm_manning_agencies ON crm_manning_agencies;
CREATE POLICY tenant_isolation_crm_manning_agencies ON crm_manning_agencies
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE crm_manning_agencies FORCE ROW LEVEL SECURITY;

ALTER TABLE crm_mlc_compliance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_crm_mlc_compliance ON crm_mlc_compliance;
CREATE POLICY tenant_isolation_crm_mlc_compliance ON crm_mlc_compliance
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE crm_mlc_compliance FORCE ROW LEVEL SECURITY;

ALTER TABLE crm_payroll_allotments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_crm_payroll_allotments ON crm_payroll_allotments;
CREATE POLICY tenant_isolation_crm_payroll_allotments ON crm_payroll_allotments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE crm_payroll_allotments FORCE ROW LEVEL SECURITY;

ALTER TABLE crm_visa_travel_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_crm_visa_travel_records ON crm_visa_travel_records;
CREATE POLICY tenant_isolation_crm_visa_travel_records ON crm_visa_travel_records
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE crm_visa_travel_records FORCE ROW LEVEL SECURITY;

ALTER TABLE crm_welfare_medical_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_crm_welfare_medical_records ON crm_welfare_medical_records;
CREATE POLICY tenant_isolation_crm_welfare_medical_records ON crm_welfare_medical_records
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE crm_welfare_medical_records FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_agent_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_agent_assignments ON cso_agent_assignments;
CREATE POLICY tenant_isolation_cso_agent_assignments ON cso_agent_assignments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_agent_assignments FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_communication_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_communication_logs ON cso_communication_logs;
CREATE POLICY tenant_isolation_cso_communication_logs ON cso_communication_logs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_communication_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_complaints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_complaints ON cso_complaints;
CREATE POLICY tenant_isolation_cso_complaints ON cso_complaints
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_complaints FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_customer_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_customer_feedback ON cso_customer_feedback;
CREATE POLICY tenant_isolation_cso_customer_feedback ON cso_customer_feedback
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_customer_feedback FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_escalations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_escalations ON cso_escalations;
CREATE POLICY tenant_isolation_cso_escalations ON cso_escalations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_escalations FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_inquiries ON cso_inquiries;
CREATE POLICY tenant_isolation_cso_inquiries ON cso_inquiries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_inquiries FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_knowledge_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_knowledge_articles ON cso_knowledge_articles;
CREATE POLICY tenant_isolation_cso_knowledge_articles ON cso_knowledge_articles
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_knowledge_articles FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_resolution_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_resolution_notes ON cso_resolution_notes;
CREATE POLICY tenant_isolation_cso_resolution_notes ON cso_resolution_notes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_resolution_notes FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_service_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_service_categories ON cso_service_categories;
CREATE POLICY tenant_isolation_cso_service_categories ON cso_service_categories
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_service_categories FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_service_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_service_requests ON cso_service_requests;
CREATE POLICY tenant_isolation_cso_service_requests ON cso_service_requests
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_service_requests FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_sla_breaches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_sla_breaches ON cso_sla_breaches;
CREATE POLICY tenant_isolation_cso_sla_breaches ON cso_sla_breaches
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_sla_breaches FORCE ROW LEVEL SECURITY;

ALTER TABLE cso_sla_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cso_sla_policies ON cso_sla_policies;
CREATE POLICY tenant_isolation_cso_sla_policies ON cso_sla_policies
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cso_sla_policies FORCE ROW LEVEL SECURITY;

ALTER TABLE csp_payment_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_csp_payment_transactions ON csp_payment_transactions;
CREATE POLICY tenant_isolation_csp_payment_transactions ON csp_payment_transactions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE csp_payment_transactions FORCE ROW LEVEL SECURITY;

ALTER TABLE csp_portal_booking_containers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_csp_portal_booking_containers ON csp_portal_booking_containers;
CREATE POLICY tenant_isolation_csp_portal_booking_containers ON csp_portal_booking_containers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE csp_portal_booking_containers FORCE ROW LEVEL SECURITY;

ALTER TABLE csp_portal_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_csp_portal_bookings ON csp_portal_bookings;
CREATE POLICY tenant_isolation_csp_portal_bookings ON csp_portal_bookings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE csp_portal_bookings FORCE ROW LEVEL SECURITY;

ALTER TABLE csp_portal_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_csp_portal_documents ON csp_portal_documents;
CREATE POLICY tenant_isolation_csp_portal_documents ON csp_portal_documents
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE csp_portal_documents FORCE ROW LEVEL SECURITY;

ALTER TABLE csp_portal_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_csp_portal_invoices ON csp_portal_invoices;
CREATE POLICY tenant_isolation_csp_portal_invoices ON csp_portal_invoices
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE csp_portal_invoices FORCE ROW LEVEL SECURITY;

ALTER TABLE csp_portal_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_csp_portal_payments ON csp_portal_payments;
CREATE POLICY tenant_isolation_csp_portal_payments ON csp_portal_payments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE csp_portal_payments FORCE ROW LEVEL SECURITY;

ALTER TABLE csp_shipment_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_csp_shipment_tracking ON csp_shipment_tracking;
CREATE POLICY tenant_isolation_csp_shipment_tracking ON csp_shipment_tracking
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE csp_shipment_tracking FORCE ROW LEVEL SECURITY;

ALTER TABLE csp_tracking_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_csp_tracking_events ON csp_tracking_events;
CREATE POLICY tenant_isolation_csp_tracking_events ON csp_tracking_events
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE csp_tracking_events FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_charter_parties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_charter_parties ON cvm_charter_parties;
CREATE POLICY tenant_isolation_cvm_charter_parties ON cvm_charter_parties
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_charter_parties FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_coa_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_coa_contracts ON cvm_coa_contracts;
CREATE POLICY tenant_isolation_cvm_coa_contracts ON cvm_coa_contracts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_coa_contracts FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_delivery_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_delivery_reports ON cvm_delivery_reports;
CREATE POLICY tenant_isolation_cvm_delivery_reports ON cvm_delivery_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_delivery_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_fixtures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_fixtures ON cvm_fixtures;
CREATE POLICY tenant_isolation_cvm_fixtures ON cvm_fixtures
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_fixtures FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_hire_statements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_hire_statements ON cvm_hire_statements;
CREATE POLICY tenant_isolation_cvm_hire_statements ON cvm_hire_statements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_hire_statements FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_laytime_calculations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_laytime_calculations ON cvm_laytime_calculations;
CREATE POLICY tenant_isolation_cvm_laytime_calculations ON cvm_laytime_calculations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_laytime_calculations FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_off_hire_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_off_hire_events ON cvm_off_hire_events;
CREATE POLICY tenant_isolation_cvm_off_hire_events ON cvm_off_hire_events
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_off_hire_events FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_tc_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_tc_contracts ON cvm_tc_contracts;
CREATE POLICY tenant_isolation_cvm_tc_contracts ON cvm_tc_contracts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_tc_contracts FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_utilization_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_utilization_analyses ON cvm_utilization_analyses;
CREATE POLICY tenant_isolation_cvm_utilization_analyses ON cvm_utilization_analyses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_utilization_analyses FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_vessel_performances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_vessel_performances ON cvm_vessel_performances;
CREATE POLICY tenant_isolation_cvm_vessel_performances ON cvm_vessel_performances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_vessel_performances FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_voyage_estimates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_voyage_estimates ON cvm_voyage_estimates;
CREATE POLICY tenant_isolation_cvm_voyage_estimates ON cvm_voyage_estimates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_voyage_estimates FORCE ROW LEVEL SECURITY;

ALTER TABLE cvm_voyage_pnl ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cvm_voyage_pnl ON cvm_voyage_pnl;
CREATE POLICY tenant_isolation_cvm_voyage_pnl ON cvm_voyage_pnl
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE cvm_voyage_pnl FORCE ROW LEVEL SECURITY;

ALTER TABLE ddm_demurrage_calculations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ddm_demurrage_calculations ON ddm_demurrage_calculations;
CREATE POLICY tenant_isolation_ddm_demurrage_calculations ON ddm_demurrage_calculations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ddm_demurrage_calculations FORCE ROW LEVEL SECURITY;

ALTER TABLE ddm_detention_trackings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ddm_detention_trackings ON ddm_detention_trackings;
CREATE POLICY tenant_isolation_ddm_detention_trackings ON ddm_detention_trackings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ddm_detention_trackings FORCE ROW LEVEL SECURITY;

ALTER TABLE ddm_disputes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ddm_disputes ON ddm_disputes;
CREATE POLICY tenant_isolation_ddm_disputes ON ddm_disputes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ddm_disputes FORCE ROW LEVEL SECURITY;

ALTER TABLE ddm_free_time_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ddm_free_time_rules ON ddm_free_time_rules;
CREATE POLICY tenant_isolation_ddm_free_time_rules ON ddm_free_time_rules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ddm_free_time_rules FORCE ROW LEVEL SECURITY;

ALTER TABLE ddm_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ddm_invoices ON ddm_invoices;
CREATE POLICY tenant_isolation_ddm_invoices ON ddm_invoices
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ddm_invoices FORCE ROW LEVEL SECURITY;

ALTER TABLE ddm_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ddm_notifications ON ddm_notifications;
CREATE POLICY tenant_isolation_ddm_notifications ON ddm_notifications
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ddm_notifications FORCE ROW LEVEL SECURITY;

ALTER TABLE ddm_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ddm_predictions ON ddm_predictions;
CREATE POLICY tenant_isolation_ddm_predictions ON ddm_predictions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ddm_predictions FORCE ROW LEVEL SECURITY;

ALTER TABLE ddm_waivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ddm_waivers ON ddm_waivers;
CREATE POLICY tenant_isolation_ddm_waivers ON ddm_waivers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ddm_waivers FORCE ROW LEVEL SECURITY;

ALTER TABLE dgm_booking_screenings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dgm_booking_screenings ON dgm_booking_screenings;
CREATE POLICY tenant_isolation_dgm_booking_screenings ON dgm_booking_screenings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dgm_booking_screenings FORCE ROW LEVEL SECURITY;

ALTER TABLE dgm_chemical_safety_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dgm_chemical_safety_data ON dgm_chemical_safety_data;
CREATE POLICY tenant_isolation_dgm_chemical_safety_data ON dgm_chemical_safety_data
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dgm_chemical_safety_data FORCE ROW LEVEL SECURITY;

ALTER TABLE dgm_emergency_procedures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dgm_emergency_procedures ON dgm_emergency_procedures;
CREATE POLICY tenant_isolation_dgm_emergency_procedures ON dgm_emergency_procedures
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dgm_emergency_procedures FORCE ROW LEVEL SECURITY;

ALTER TABLE dgm_imdg_compliance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dgm_imdg_compliance ON dgm_imdg_compliance;
CREATE POLICY tenant_isolation_dgm_imdg_compliance ON dgm_imdg_compliance
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dgm_imdg_compliance FORCE ROW LEVEL SECURITY;

ALTER TABLE dgm_incident_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dgm_incident_reports ON dgm_incident_reports;
CREATE POLICY tenant_isolation_dgm_incident_reports ON dgm_incident_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dgm_incident_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE dgm_manifests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dgm_manifests ON dgm_manifests;
CREATE POLICY tenant_isolation_dgm_manifests ON dgm_manifests
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dgm_manifests FORCE ROW LEVEL SECURITY;

ALTER TABLE dgm_placard_requirements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dgm_placard_requirements ON dgm_placard_requirements;
CREATE POLICY tenant_isolation_dgm_placard_requirements ON dgm_placard_requirements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dgm_placard_requirements FORCE ROW LEVEL SECURITY;

ALTER TABLE dgm_segregation_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dgm_segregation_rules ON dgm_segregation_rules;
CREATE POLICY tenant_isolation_dgm_segregation_rules ON dgm_segregation_rules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dgm_segregation_rules FORCE ROW LEVEL SECURITY;

ALTER TABLE dms_document_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dms_document_categories ON dms_document_categories;
CREATE POLICY tenant_isolation_dms_document_categories ON dms_document_categories
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dms_document_categories FORCE ROW LEVEL SECURITY;

ALTER TABLE dms_document_signatures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dms_document_signatures ON dms_document_signatures;
CREATE POLICY tenant_isolation_dms_document_signatures ON dms_document_signatures
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dms_document_signatures FORCE ROW LEVEL SECURITY;

ALTER TABLE dms_document_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dms_document_templates ON dms_document_templates;
CREATE POLICY tenant_isolation_dms_document_templates ON dms_document_templates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dms_document_templates FORCE ROW LEVEL SECURITY;

ALTER TABLE dms_document_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dms_document_versions ON dms_document_versions;
CREATE POLICY tenant_isolation_dms_document_versions ON dms_document_versions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dms_document_versions FORCE ROW LEVEL SECURITY;

ALTER TABLE dms_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dms_documents ON dms_documents;
CREATE POLICY tenant_isolation_dms_documents ON dms_documents
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dms_documents FORCE ROW LEVEL SECURITY;

ALTER TABLE dms_expiry_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dms_expiry_alerts ON dms_expiry_alerts;
CREATE POLICY tenant_isolation_dms_expiry_alerts ON dms_expiry_alerts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dms_expiry_alerts FORCE ROW LEVEL SECURITY;

ALTER TABLE dms_ocr_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dms_ocr_results ON dms_ocr_results;
CREATE POLICY tenant_isolation_dms_ocr_results ON dms_ocr_results
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dms_ocr_results FORCE ROW LEVEL SECURITY;

ALTER TABLE dms_retention_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dms_retention_policies ON dms_retention_policies;
CREATE POLICY tenant_isolation_dms_retention_policies ON dms_retention_policies
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dms_retention_policies FORCE ROW LEVEL SECURITY;

ALTER TABLE dms_search_index ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dms_search_index ON dms_search_index;
CREATE POLICY tenant_isolation_dms_search_index ON dms_search_index
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE dms_search_index FORCE ROW LEVEL SECURITY;

ALTER TABLE ecr_cost_trackings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ecr_cost_trackings ON ecr_cost_trackings;
CREATE POLICY tenant_isolation_ecr_cost_trackings ON ecr_cost_trackings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ecr_cost_trackings FORCE ROW LEVEL SECURITY;

ALTER TABLE ecr_demand_forecasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ecr_demand_forecasts ON ecr_demand_forecasts;
CREATE POLICY tenant_isolation_ecr_demand_forecasts ON ecr_demand_forecasts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ecr_demand_forecasts FORCE ROW LEVEL SECURITY;

ALTER TABLE ecr_inventory_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ecr_inventory_snapshots ON ecr_inventory_snapshots;
CREATE POLICY tenant_isolation_ecr_inventory_snapshots ON ecr_inventory_snapshots
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ecr_inventory_snapshots FORCE ROW LEVEL SECURITY;

ALTER TABLE ecr_leasing_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ecr_leasing_decisions ON ecr_leasing_decisions;
CREATE POLICY tenant_isolation_ecr_leasing_decisions ON ecr_leasing_decisions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ecr_leasing_decisions FORCE ROW LEVEL SECURITY;

ALTER TABLE ecr_pnl_attributions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ecr_pnl_attributions ON ecr_pnl_attributions;
CREATE POLICY tenant_isolation_ecr_pnl_attributions ON ecr_pnl_attributions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ecr_pnl_attributions FORCE ROW LEVEL SECURITY;

ALTER TABLE ecr_repositioning_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ecr_repositioning_plans ON ecr_repositioning_plans;
CREATE POLICY tenant_isolation_ecr_repositioning_plans ON ecr_repositioning_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ecr_repositioning_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE ecr_return_incentives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ecr_return_incentives ON ecr_return_incentives;
CREATE POLICY tenant_isolation_ecr_return_incentives ON ecr_return_incentives
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ecr_return_incentives FORCE ROW LEVEL SECURITY;

ALTER TABLE ecr_route_optimizers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ecr_route_optimizers ON ecr_route_optimizers;
CREATE POLICY tenant_isolation_ecr_route_optimizers ON ecr_route_optimizers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ecr_route_optimizers FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_availability_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_availability_plans ON eqy_availability_plans;
CREATE POLICY tenant_isolation_eqy_availability_plans ON eqy_availability_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_availability_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_container_fleet ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_container_fleet ON eqy_container_fleet;
CREATE POLICY tenant_isolation_eqy_container_fleet ON eqy_container_fleet
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_container_fleet FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_container_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_container_surveys ON eqy_container_surveys;
CREATE POLICY tenant_isolation_eqy_container_surveys ON eqy_container_surveys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_container_surveys FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_equipment_interchanges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_equipment_interchanges ON eqy_equipment_interchanges;
CREATE POLICY tenant_isolation_eqy_equipment_interchanges ON eqy_equipment_interchanges
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_equipment_interchanges FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_gate_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_gate_movements ON eqy_gate_movements;
CREATE POLICY tenant_isolation_eqy_gate_movements ON eqy_gate_movements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_gate_movements FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_leased_containers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_leased_containers ON eqy_leased_containers;
CREATE POLICY tenant_isolation_eqy_leased_containers ON eqy_leased_containers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_leased_containers FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_maintenance_repairs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_maintenance_repairs ON eqy_maintenance_repairs;
CREATE POLICY tenant_isolation_eqy_maintenance_repairs ON eqy_maintenance_repairs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_maintenance_repairs FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_on_hire_off_hire ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_on_hire_off_hire ON eqy_on_hire_off_hire;
CREATE POLICY tenant_isolation_eqy_on_hire_off_hire ON eqy_on_hire_off_hire
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_on_hire_off_hire FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_reefer_containers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_reefer_containers ON eqy_reefer_containers;
CREATE POLICY tenant_isolation_eqy_reefer_containers ON eqy_reefer_containers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_reefer_containers FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_repositioning_optimizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_repositioning_optimizations ON eqy_repositioning_optimizations;
CREATE POLICY tenant_isolation_eqy_repositioning_optimizations ON eqy_repositioning_optimizations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_repositioning_optimizations FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_repositioning_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_repositioning_plans ON eqy_repositioning_plans;
CREATE POLICY tenant_isolation_eqy_repositioning_plans ON eqy_repositioning_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_repositioning_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE eqy_yard_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_eqy_yard_slots ON eqy_yard_slots;
CREATE POLICY tenant_isolation_eqy_yard_slots ON eqy_yard_slots
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE eqy_yard_slots FORCE ROW LEVEL SECURITY;

ALTER TABLE fam_asset_disposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fam_asset_disposals ON fam_asset_disposals;
CREATE POLICY tenant_isolation_fam_asset_disposals ON fam_asset_disposals
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fam_asset_disposals FORCE ROW LEVEL SECURITY;

ALTER TABLE fam_asset_registries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fam_asset_registries ON fam_asset_registries;
CREATE POLICY tenant_isolation_fam_asset_registries ON fam_asset_registries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fam_asset_registries FORCE ROW LEVEL SECURITY;

ALTER TABLE fam_capex_opex_classifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fam_capex_opex_classifications ON fam_capex_opex_classifications;
CREATE POLICY tenant_isolation_fam_capex_opex_classifications ON fam_capex_opex_classifications
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fam_capex_opex_classifications FORCE ROW LEVEL SECURITY;

ALTER TABLE fam_depreciation_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fam_depreciation_schedules ON fam_depreciation_schedules;
CREATE POLICY tenant_isolation_fam_depreciation_schedules ON fam_depreciation_schedules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fam_depreciation_schedules FORCE ROW LEVEL SECURITY;

ALTER TABLE fam_impairment_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fam_impairment_tests ON fam_impairment_tests;
CREATE POLICY tenant_isolation_fam_impairment_tests ON fam_impairment_tests
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fam_impairment_tests FORCE ROW LEVEL SECURITY;

ALTER TABLE fam_insurance_valuations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fam_insurance_valuations ON fam_insurance_valuations;
CREATE POLICY tenant_isolation_fam_insurance_valuations ON fam_insurance_valuations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fam_insurance_valuations FORCE ROW LEVEL SECURITY;

ALTER TABLE fam_lease_accounting ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fam_lease_accounting ON fam_lease_accounting;
CREATE POLICY tenant_isolation_fam_lease_accounting ON fam_lease_accounting
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fam_lease_accounting FORCE ROW LEVEL SECURITY;

ALTER TABLE fam_maintenance_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fam_maintenance_schedules ON fam_maintenance_schedules;
CREATE POLICY tenant_isolation_fam_maintenance_schedules ON fam_maintenance_schedules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fam_maintenance_schedules FORCE ROW LEVEL SECURITY;

ALTER TABLE fdp_deployment_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fdp_deployment_contracts ON fdp_deployment_contracts;
CREATE POLICY tenant_isolation_fdp_deployment_contracts ON fdp_deployment_contracts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fdp_deployment_contracts FORCE ROW LEVEL SECURITY;

ALTER TABLE fdp_deployment_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fdp_deployment_decisions ON fdp_deployment_decisions;
CREATE POLICY tenant_isolation_fdp_deployment_decisions ON fdp_deployment_decisions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fdp_deployment_decisions FORCE ROW LEVEL SECURITY;

ALTER TABLE fdp_deployment_optimizers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fdp_deployment_optimizers ON fdp_deployment_optimizers;
CREATE POLICY tenant_isolation_fdp_deployment_optimizers ON fdp_deployment_optimizers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fdp_deployment_optimizers FORCE ROW LEVEL SECURITY;

ALTER TABLE fdp_fleet_financials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fdp_fleet_financials ON fdp_fleet_financials;
CREATE POLICY tenant_isolation_fdp_fleet_financials ON fdp_fleet_financials
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fdp_fleet_financials FORCE ROW LEVEL SECURITY;

ALTER TABLE fdp_fleet_utilizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fdp_fleet_utilizations ON fdp_fleet_utilizations;
CREATE POLICY tenant_isolation_fdp_fleet_utilizations ON fdp_fleet_utilizations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fdp_fleet_utilizations FORCE ROW LEVEL SECURITY;

ALTER TABLE fdp_market_intelligence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fdp_market_intelligence ON fdp_market_intelligence;
CREATE POLICY tenant_isolation_fdp_market_intelligence ON fdp_market_intelligence
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fdp_market_intelligence FORCE ROW LEVEL SECURITY;

ALTER TABLE fdp_network_designs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fdp_network_designs ON fdp_network_designs;
CREATE POLICY tenant_isolation_fdp_network_designs ON fdp_network_designs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fdp_network_designs FORCE ROW LEVEL SECURITY;

ALTER TABLE fdp_vessel_swaps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_fdp_vessel_swaps ON fdp_vessel_swaps;
CREATE POLICY tenant_isolation_fdp_vessel_swaps ON fdp_vessel_swaps
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE fdp_vessel_swaps FORCE ROW LEVEL SECURITY;

ALTER TABLE firm_debit_credit_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_firm_debit_credit_notes ON firm_debit_credit_notes;
CREATE POLICY tenant_isolation_firm_debit_credit_notes ON firm_debit_credit_notes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE firm_debit_credit_notes FORCE ROW LEVEL SECURITY;

ALTER TABLE firm_dunning_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_firm_dunning_actions ON firm_dunning_actions;
CREATE POLICY tenant_isolation_firm_dunning_actions ON firm_dunning_actions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE firm_dunning_actions FORCE ROW LEVEL SECURITY;

ALTER TABLE firm_dunning_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_firm_dunning_runs ON firm_dunning_runs;
CREATE POLICY tenant_isolation_firm_dunning_runs ON firm_dunning_runs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE firm_dunning_runs FORCE ROW LEVEL SECURITY;

ALTER TABLE firm_freight_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_firm_freight_invoices ON firm_freight_invoices;
CREATE POLICY tenant_isolation_firm_freight_invoices ON firm_freight_invoices
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE firm_freight_invoices FORCE ROW LEVEL SECURITY;

ALTER TABLE firm_invoice_amendments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_firm_invoice_amendments ON firm_invoice_amendments;
CREATE POLICY tenant_isolation_firm_invoice_amendments ON firm_invoice_amendments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE firm_invoice_amendments FORCE ROW LEVEL SECURITY;

ALTER TABLE firm_invoice_disputes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_firm_invoice_disputes ON firm_invoice_disputes;
CREATE POLICY tenant_isolation_firm_invoice_disputes ON firm_invoice_disputes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE firm_invoice_disputes FORCE ROW LEVEL SECURITY;

ALTER TABLE firm_invoice_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_firm_invoice_line_items ON firm_invoice_line_items;
CREATE POLICY tenant_isolation_firm_invoice_line_items ON firm_invoice_line_items
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE firm_invoice_line_items FORCE ROW LEVEL SECURITY;

ALTER TABLE firm_proforma_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_firm_proforma_invoices ON firm_proforma_invoices;
CREATE POLICY tenant_isolation_firm_proforma_invoices ON firm_proforma_invoices
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE firm_proforma_invoices FORCE ROW LEVEL SECURITY;

ALTER TABLE firm_revenue_accruals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_firm_revenue_accruals ON firm_revenue_accruals;
CREATE POLICY tenant_isolation_firm_revenue_accruals ON firm_revenue_accruals
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE firm_revenue_accruals FORCE ROW LEVEL SECURITY;

ALTER TABLE firm_revenue_forecast_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_firm_revenue_forecast_entries ON firm_revenue_forecast_entries;
CREATE POLICY tenant_isolation_firm_revenue_forecast_entries ON firm_revenue_forecast_entries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE firm_revenue_forecast_entries FORCE ROW LEVEL SECURITY;

ALTER TABLE glfr_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_glfr_budgets ON glfr_budgets;
CREATE POLICY tenant_isolation_glfr_budgets ON glfr_budgets
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE glfr_budgets FORCE ROW LEVEL SECURITY;

ALTER TABLE glfr_chart_of_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_glfr_chart_of_accounts ON glfr_chart_of_accounts;
CREATE POLICY tenant_isolation_glfr_chart_of_accounts ON glfr_chart_of_accounts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE glfr_chart_of_accounts FORCE ROW LEVEL SECURITY;

ALTER TABLE glfr_consolidated_statements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_glfr_consolidated_statements ON glfr_consolidated_statements;
CREATE POLICY tenant_isolation_glfr_consolidated_statements ON glfr_consolidated_statements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE glfr_consolidated_statements FORCE ROW LEVEL SECURITY;

ALTER TABLE glfr_financial_statements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_glfr_financial_statements ON glfr_financial_statements;
CREATE POLICY tenant_isolation_glfr_financial_statements ON glfr_financial_statements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE glfr_financial_statements FORCE ROW LEVEL SECURITY;

ALTER TABLE glfr_journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_glfr_journal_entries ON glfr_journal_entries;
CREATE POLICY tenant_isolation_glfr_journal_entries ON glfr_journal_entries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE glfr_journal_entries FORCE ROW LEVEL SECURITY;

ALTER TABLE glfr_period_closures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_glfr_period_closures ON glfr_period_closures;
CREATE POLICY tenant_isolation_glfr_period_closures ON glfr_period_closures
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE glfr_period_closures FORCE ROW LEVEL SECURITY;

ALTER TABLE glfr_segment_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_glfr_segment_reports ON glfr_segment_reports;
CREATE POLICY tenant_isolation_glfr_segment_reports ON glfr_segment_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE glfr_segment_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE glfr_variance_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_glfr_variance_analyses ON glfr_variance_analyses;
CREATE POLICY tenant_isolation_glfr_variance_analyses ON glfr_variance_analyses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE glfr_variance_analyses FORCE ROW LEVEL SECURITY;

ALTER TABLE hps_attendance_time_trackings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_hps_attendance_time_trackings ON hps_attendance_time_trackings;
CREATE POLICY tenant_isolation_hps_attendance_time_trackings ON hps_attendance_time_trackings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE hps_attendance_time_trackings FORCE ROW LEVEL SECURITY;

ALTER TABLE hps_employee_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_hps_employee_profiles ON hps_employee_profiles;
CREATE POLICY tenant_isolation_hps_employee_profiles ON hps_employee_profiles
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE hps_employee_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE hps_gratuity_calculations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_hps_gratuity_calculations ON hps_gratuity_calculations;
CREATE POLICY tenant_isolation_hps_gratuity_calculations ON hps_gratuity_calculations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE hps_gratuity_calculations FORCE ROW LEVEL SECURITY;

ALTER TABLE hps_leave_absences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_hps_leave_absences ON hps_leave_absences;
CREATE POLICY tenant_isolation_hps_leave_absences ON hps_leave_absences
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE hps_leave_absences FORCE ROW LEVEL SECURITY;

ALTER TABLE hps_payroll_processings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_hps_payroll_processings ON hps_payroll_processings;
CREATE POLICY tenant_isolation_hps_payroll_processings ON hps_payroll_processings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE hps_payroll_processings FORCE ROW LEVEL SECURITY;

ALTER TABLE hps_performance_appraisals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_hps_performance_appraisals ON hps_performance_appraisals;
CREATE POLICY tenant_isolation_hps_performance_appraisals ON hps_performance_appraisals
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE hps_performance_appraisals FORCE ROW LEVEL SECURITY;

ALTER TABLE hps_social_insurance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_hps_social_insurance_records ON hps_social_insurance_records;
CREATE POLICY tenant_isolation_hps_social_insurance_records ON hps_social_insurance_records
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE hps_social_insurance_records FORCE ROW LEVEL SECURITY;

ALTER TABLE hps_visa_residency_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_hps_visa_residency_records ON hps_visa_residency_records;
CREATE POLICY tenant_isolation_hps_visa_residency_records ON hps_visa_residency_records
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE hps_visa_residency_records FORCE ROW LEVEL SECURITY;

ALTER TABLE icd_bonded_warehouses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icd_bonded_warehouses ON icd_bonded_warehouses;
CREATE POLICY tenant_isolation_icd_bonded_warehouses ON icd_bonded_warehouses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icd_bonded_warehouses FORCE ROW LEVEL SECURITY;

ALTER TABLE icd_dry_ports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icd_dry_ports ON icd_dry_ports;
CREATE POLICY tenant_isolation_icd_dry_ports ON icd_dry_ports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icd_dry_ports FORCE ROW LEVEL SECURITY;

ALTER TABLE icd_haulage_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icd_haulage_rates ON icd_haulage_rates;
CREATE POLICY tenant_isolation_icd_haulage_rates ON icd_haulage_rates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icd_haulage_rates FORCE ROW LEVEL SECURITY;

ALTER TABLE icd_last_mile_deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icd_last_mile_deliveries ON icd_last_mile_deliveries;
CREATE POLICY tenant_isolation_icd_last_mile_deliveries ON icd_last_mile_deliveries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icd_last_mile_deliveries FORCE ROW LEVEL SECURITY;

ALTER TABLE icd_multimodal_bols ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icd_multimodal_bols ON icd_multimodal_bols;
CREATE POLICY tenant_isolation_icd_multimodal_bols ON icd_multimodal_bols
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icd_multimodal_bols FORCE ROW LEVEL SECURITY;

ALTER TABLE icd_rail_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icd_rail_plans ON icd_rail_plans;
CREATE POLICY tenant_isolation_icd_rail_plans ON icd_rail_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icd_rail_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE icd_route_optimizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icd_route_optimizations ON icd_route_optimizations;
CREATE POLICY tenant_isolation_icd_route_optimizations ON icd_route_optimizations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icd_route_optimizations FORCE ROW LEVEL SECURITY;

ALTER TABLE icd_truck_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icd_truck_bookings ON icd_truck_bookings;
CREATE POLICY tenant_isolation_icd_truck_bookings ON icd_truck_bookings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icd_truck_bookings FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_cargo_insurance_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_cargo_insurance_policies ON icm_cargo_insurance_policies;
CREATE POLICY tenant_isolation_icm_cargo_insurance_policies ON icm_cargo_insurance_policies
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_cargo_insurance_policies FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_change_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_change_requests ON icm_change_requests;
CREATE POLICY tenant_isolation_icm_change_requests ON icm_change_requests
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_change_requests FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_claims_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_claims_predictions ON icm_claims_predictions;
CREATE POLICY tenant_isolation_icm_claims_predictions ON icm_claims_predictions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_claims_predictions FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_claims_recoveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_claims_recoveries ON icm_claims_recoveries;
CREATE POLICY tenant_isolation_icm_claims_recoveries ON icm_claims_recoveries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_claims_recoveries FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_claims_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_claims_registrations ON icm_claims_registrations;
CREATE POLICY tenant_isolation_icm_claims_registrations ON icm_claims_registrations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_claims_registrations FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_data_migrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_data_migrations ON icm_data_migrations;
CREATE POLICY tenant_isolation_icm_data_migrations ON icm_data_migrations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_data_migrations FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_go_live_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_go_live_checklists ON icm_go_live_checklists;
CREATE POLICY tenant_isolation_icm_go_live_checklists ON icm_go_live_checklists
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_go_live_checklists FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_hull_machinery_insurances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_hull_machinery_insurances ON icm_hull_machinery_insurances;
CREATE POLICY tenant_isolation_icm_hull_machinery_insurances ON icm_hull_machinery_insurances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_hull_machinery_insurances FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_hypercare_supports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_hypercare_supports ON icm_hypercare_supports;
CREATE POLICY tenant_isolation_icm_hypercare_supports ON icm_hypercare_supports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_hypercare_supports FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_loss_prevention_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_loss_prevention_reports ON icm_loss_prevention_reports;
CREATE POLICY tenant_isolation_icm_loss_prevention_reports ON icm_loss_prevention_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_loss_prevention_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_pi_club_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_pi_club_policies ON icm_pi_club_policies;
CREATE POLICY tenant_isolation_icm_pi_club_policies ON icm_pi_club_policies
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_pi_club_policies FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_project_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_project_plans ON icm_project_plans;
CREATE POLICY tenant_isolation_icm_project_plans ON icm_project_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_project_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_survey_appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_survey_appointments ON icm_survey_appointments;
CREATE POLICY tenant_isolation_icm_survey_appointments ON icm_survey_appointments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_survey_appointments FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_system_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_system_configs ON icm_system_configs;
CREATE POLICY tenant_isolation_icm_system_configs ON icm_system_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_system_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_training_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_training_completions ON icm_training_completions;
CREATE POLICY tenant_isolation_icm_training_completions ON icm_training_completions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_training_completions FORCE ROW LEVEL SECURITY;

ALTER TABLE icm_uat_managements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_icm_uat_managements ON icm_uat_managements;
CREATE POLICY tenant_isolation_icm_uat_managements ON icm_uat_managements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE icm_uat_managements FORCE ROW LEVEL SECURITY;

ALTER TABLE iel_customs_filings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iel_customs_filings ON iel_customs_filings;
CREATE POLICY tenant_isolation_iel_customs_filings ON iel_customs_filings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iel_customs_filings FORCE ROW LEVEL SECURITY;

ALTER TABLE iel_customs_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iel_customs_responses ON iel_customs_responses;
CREATE POLICY tenant_isolation_iel_customs_responses ON iel_customs_responses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iel_customs_responses FORCE ROW LEVEL SECURITY;

ALTER TABLE iel_edi_message_segments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iel_edi_message_segments ON iel_edi_message_segments;
CREATE POLICY tenant_isolation_iel_edi_message_segments ON iel_edi_message_segments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iel_edi_message_segments FORCE ROW LEVEL SECURITY;

ALTER TABLE iel_edi_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iel_edi_messages ON iel_edi_messages;
CREATE POLICY tenant_isolation_iel_edi_messages ON iel_edi_messages
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iel_edi_messages FORCE ROW LEVEL SECURITY;

ALTER TABLE iel_edi_processing_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iel_edi_processing_logs ON iel_edi_processing_logs;
CREATE POLICY tenant_isolation_iel_edi_processing_logs ON iel_edi_processing_logs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iel_edi_processing_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE iel_integration_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iel_integration_connections ON iel_integration_connections;
CREATE POLICY tenant_isolation_iel_integration_connections ON iel_integration_connections
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iel_integration_connections FORCE ROW LEVEL SECURITY;

ALTER TABLE iel_integration_endpoints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iel_integration_endpoints ON iel_integration_endpoints;
CREATE POLICY tenant_isolation_iel_integration_endpoints ON iel_integration_endpoints
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iel_integration_endpoints FORCE ROW LEVEL SECURITY;

ALTER TABLE iel_oracle_sync_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iel_oracle_sync_jobs ON iel_oracle_sync_jobs;
CREATE POLICY tenant_isolation_iel_oracle_sync_jobs ON iel_oracle_sync_jobs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iel_oracle_sync_jobs FORCE ROW LEVEL SECURITY;

ALTER TABLE iel_oracle_sync_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iel_oracle_sync_mappings ON iel_oracle_sync_mappings;
CREATE POLICY tenant_isolation_iel_oracle_sync_mappings ON iel_oracle_sync_mappings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iel_oracle_sync_mappings FORCE ROW LEVEL SECURITY;

ALTER TABLE iel_port_connect_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iel_port_connect_messages ON iel_port_connect_messages;
CREATE POLICY tenant_isolation_iel_port_connect_messages ON iel_port_connect_messages
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iel_port_connect_messages FORCE ROW LEVEL SECURITY;

ALTER TABLE iot_container_gps_trackings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iot_container_gps_trackings ON iot_container_gps_trackings;
CREATE POLICY tenant_isolation_iot_container_gps_trackings ON iot_container_gps_trackings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iot_container_gps_trackings FORCE ROW LEVEL SECURITY;

ALTER TABLE iot_data_lake_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iot_data_lake_analytics ON iot_data_lake_analytics;
CREATE POLICY tenant_isolation_iot_data_lake_analytics ON iot_data_lake_analytics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iot_data_lake_analytics FORCE ROW LEVEL SECURITY;

ALTER TABLE iot_electronic_seals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iot_electronic_seals ON iot_electronic_seals;
CREATE POLICY tenant_isolation_iot_electronic_seals ON iot_electronic_seals
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iot_electronic_seals FORCE ROW LEVEL SECURITY;

ALTER TABLE iot_port_equipments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iot_port_equipments ON iot_port_equipments;
CREATE POLICY tenant_isolation_iot_port_equipments ON iot_port_equipments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iot_port_equipments FORCE ROW LEVEL SECURITY;

ALTER TABLE iot_predictive_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iot_predictive_alerts ON iot_predictive_alerts;
CREATE POLICY tenant_isolation_iot_predictive_alerts ON iot_predictive_alerts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iot_predictive_alerts FORCE ROW LEVEL SECURITY;

ALTER TABLE iot_reefer_monitorings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iot_reefer_monitorings ON iot_reefer_monitorings;
CREATE POLICY tenant_isolation_iot_reefer_monitorings ON iot_reefer_monitorings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iot_reefer_monitorings FORCE ROW LEVEL SECURITY;

ALTER TABLE iot_shock_detections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iot_shock_detections ON iot_shock_detections;
CREATE POLICY tenant_isolation_iot_shock_detections ON iot_shock_detections
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iot_shock_detections FORCE ROW LEVEL SECURITY;

ALTER TABLE iot_vessel_positions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_iot_vessel_positions ON iot_vessel_positions;
CREATE POLICY tenant_isolation_iot_vessel_positions ON iot_vessel_positions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE iot_vessel_positions FORCE ROW LEVEL SECURITY;

ALTER TABLE isf_api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_isf_api_keys ON isf_api_keys;
CREATE POLICY tenant_isolation_isf_api_keys ON isf_api_keys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE isf_api_keys FORCE ROW LEVEL SECURITY;

ALTER TABLE isf_audit_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_isf_audit_events ON isf_audit_events;
CREATE POLICY tenant_isolation_isf_audit_events ON isf_audit_events
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE isf_audit_events FORCE ROW LEVEL SECURITY;

ALTER TABLE isf_compliance_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_isf_compliance_reports ON isf_compliance_reports;
CREATE POLICY tenant_isolation_isf_compliance_reports ON isf_compliance_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE isf_compliance_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE isf_deployment_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_isf_deployment_configs ON isf_deployment_configs;
CREATE POLICY tenant_isolation_isf_deployment_configs ON isf_deployment_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE isf_deployment_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE isf_encryption_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_isf_encryption_keys ON isf_encryption_keys;
CREATE POLICY tenant_isolation_isf_encryption_keys ON isf_encryption_keys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE isf_encryption_keys FORCE ROW LEVEL SECURITY;

ALTER TABLE isf_iam_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_isf_iam_policies ON isf_iam_policies;
CREATE POLICY tenant_isolation_isf_iam_policies ON isf_iam_policies
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE isf_iam_policies FORCE ROW LEVEL SECURITY;

ALTER TABLE isf_jit_access_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_isf_jit_access_requests ON isf_jit_access_requests;
CREATE POLICY tenant_isolation_isf_jit_access_requests ON isf_jit_access_requests
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE isf_jit_access_requests FORCE ROW LEVEL SECURITY;

ALTER TABLE isf_k8s_clusters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_isf_k8s_clusters ON isf_k8s_clusters;
CREATE POLICY tenant_isolation_isf_k8s_clusters ON isf_k8s_clusters
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE isf_k8s_clusters FORCE ROW LEVEL SECURITY;

ALTER TABLE isf_k8s_namespaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_isf_k8s_namespaces ON isf_k8s_namespaces;
CREATE POLICY tenant_isolation_isf_k8s_namespaces ON isf_k8s_namespaces
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE isf_k8s_namespaces FORCE ROW LEVEL SECURITY;

ALTER TABLE isf_key_rotation_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_isf_key_rotation_log ON isf_key_rotation_log;
CREATE POLICY tenant_isolation_isf_key_rotation_log ON isf_key_rotation_log
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE isf_key_rotation_log FORCE ROW LEVEL SECURITY;

ALTER TABLE isf_service_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_isf_service_accounts ON isf_service_accounts;
CREATE POLICY tenant_isolation_isf_service_accounts ON isf_service_accounts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE isf_service_accounts FORCE ROW LEVEL SECURITY;

ALTER TABLE kmt_competency_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_kmt_competency_assessments ON kmt_competency_assessments;
CREATE POLICY tenant_isolation_kmt_competency_assessments ON kmt_competency_assessments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE kmt_competency_assessments FORCE ROW LEVEL SECURITY;

ALTER TABLE kmt_knowledge_assistants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_kmt_knowledge_assistants ON kmt_knowledge_assistants;
CREATE POLICY tenant_isolation_kmt_knowledge_assistants ON kmt_knowledge_assistants
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE kmt_knowledge_assistants FORCE ROW LEVEL SECURITY;

ALTER TABLE kmt_lessons_learned ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_kmt_lessons_learned ON kmt_lessons_learned;
CREATE POLICY tenant_isolation_kmt_lessons_learned ON kmt_lessons_learned
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE kmt_lessons_learned FORCE ROW LEVEL SECURITY;

ALTER TABLE kmt_onboarding_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_kmt_onboarding_workflows ON kmt_onboarding_workflows;
CREATE POLICY tenant_isolation_kmt_onboarding_workflows ON kmt_onboarding_workflows
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE kmt_onboarding_workflows FORCE ROW LEVEL SECURITY;

ALTER TABLE kmt_regulatory_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_kmt_regulatory_alerts ON kmt_regulatory_alerts;
CREATE POLICY tenant_isolation_kmt_regulatory_alerts ON kmt_regulatory_alerts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE kmt_regulatory_alerts FORCE ROW LEVEL SECURITY;

ALTER TABLE kmt_sop_libraries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_kmt_sop_libraries ON kmt_sop_libraries;
CREATE POLICY tenant_isolation_kmt_sop_libraries ON kmt_sop_libraries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE kmt_sop_libraries FORCE ROW LEVEL SECURITY;

ALTER TABLE kmt_training_modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_kmt_training_modules ON kmt_training_modules;
CREATE POLICY tenant_isolation_kmt_training_modules ON kmt_training_modules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE kmt_training_modules FORCE ROW LEVEL SECURITY;

ALTER TABLE kmt_video_libraries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_kmt_video_libraries ON kmt_video_libraries;
CREATE POLICY tenant_isolation_kmt_video_libraries ON kmt_video_libraries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE kmt_video_libraries FORCE ROW LEVEL SECURITY;

ALTER TABLE loc_cargo_cutoffs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_loc_cargo_cutoffs ON loc_cargo_cutoffs;
CREATE POLICY tenant_isolation_loc_cargo_cutoffs ON loc_cargo_cutoffs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE loc_cargo_cutoffs FORCE ROW LEVEL SECURITY;

ALTER TABLE loc_cargo_mix_optimizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_loc_cargo_mix_optimizations ON loc_cargo_mix_optimizations;
CREATE POLICY tenant_isolation_loc_cargo_mix_optimizations ON loc_cargo_mix_optimizations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE loc_cargo_mix_optimizations FORCE ROW LEVEL SECURITY;

ALTER TABLE loc_load_factor_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_loc_load_factor_reports ON loc_load_factor_reports;
CREATE POLICY tenant_isolation_loc_load_factor_reports ON loc_load_factor_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE loc_load_factor_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE loc_overbooking_rollovers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_loc_overbooking_rollovers ON loc_overbooking_rollovers;
CREATE POLICY tenant_isolation_loc_overbooking_rollovers ON loc_overbooking_rollovers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE loc_overbooking_rollovers FORCE ROW LEVEL SECURITY;

ALTER TABLE loc_revenue_integrity_audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_loc_revenue_integrity_audits ON loc_revenue_integrity_audits;
CREATE POLICY tenant_isolation_loc_revenue_integrity_audits ON loc_revenue_integrity_audits
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE loc_revenue_integrity_audits FORCE ROW LEVEL SECURITY;

ALTER TABLE loc_rolling_upgrades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_loc_rolling_upgrades ON loc_rolling_upgrades;
CREATE POLICY tenant_isolation_loc_rolling_upgrades ON loc_rolling_upgrades
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE loc_rolling_upgrades FORCE ROW LEVEL SECURITY;

ALTER TABLE loc_schedule_deviations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_loc_schedule_deviations ON loc_schedule_deviations;
CREATE POLICY tenant_isolation_loc_schedule_deviations ON loc_schedule_deviations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE loc_schedule_deviations FORCE ROW LEVEL SECURITY;

ALTER TABLE loc_slot_swap_coordinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_loc_slot_swap_coordinations ON loc_slot_swap_coordinations;
CREATE POLICY tenant_isolation_loc_slot_swap_coordinations ON loc_slot_swap_coordinations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE loc_slot_swap_coordinations FORCE ROW LEVEL SECURITY;

ALTER TABLE lpr_continuity_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lpr_continuity_plans ON lpr_continuity_plans;
CREATE POLICY tenant_isolation_lpr_continuity_plans ON lpr_continuity_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lpr_continuity_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE lpr_emergency_procedures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lpr_emergency_procedures ON lpr_emergency_procedures;
CREATE POLICY tenant_isolation_lpr_emergency_procedures ON lpr_emergency_procedures
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lpr_emergency_procedures FORCE ROW LEVEL SECURITY;

ALTER TABLE lpr_hsse_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lpr_hsse_records ON lpr_hsse_records;
CREATE POLICY tenant_isolation_lpr_hsse_records ON lpr_hsse_records
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lpr_hsse_records FORCE ROW LEVEL SECURITY;

ALTER TABLE lpr_incident_investigations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lpr_incident_investigations ON lpr_incident_investigations;
CREATE POLICY tenant_isolation_lpr_incident_investigations ON lpr_incident_investigations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lpr_incident_investigations FORCE ROW LEVEL SECURITY;

ALTER TABLE lpr_near_miss_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lpr_near_miss_reports ON lpr_near_miss_reports;
CREATE POLICY tenant_isolation_lpr_near_miss_reports ON lpr_near_miss_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lpr_near_miss_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE lpr_pi_club_scorings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lpr_pi_club_scorings ON lpr_pi_club_scorings;
CREATE POLICY tenant_isolation_lpr_pi_club_scorings ON lpr_pi_club_scorings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lpr_pi_club_scorings FORCE ROW LEVEL SECURITY;

ALTER TABLE lpr_risk_kpi_dashboards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lpr_risk_kpi_dashboards ON lpr_risk_kpi_dashboards;
CREATE POLICY tenant_isolation_lpr_risk_kpi_dashboards ON lpr_risk_kpi_dashboards
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lpr_risk_kpi_dashboards FORCE ROW LEVEL SECURITY;

ALTER TABLE lpr_risk_registers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lpr_risk_registers ON lpr_risk_registers;
CREATE POLICY tenant_isolation_lpr_risk_registers ON lpr_risk_registers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lpr_risk_registers FORCE ROW LEVEL SECURITY;

ALTER TABLE lrm_cargo_mixes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lrm_cargo_mixes ON lrm_cargo_mixes;
CREATE POLICY tenant_isolation_lrm_cargo_mixes ON lrm_cargo_mixes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lrm_cargo_mixes FORCE ROW LEVEL SECURITY;

ALTER TABLE lrm_demand_forecasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lrm_demand_forecasts ON lrm_demand_forecasts;
CREATE POLICY tenant_isolation_lrm_demand_forecasts ON lrm_demand_forecasts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lrm_demand_forecasts FORCE ROW LEVEL SECURITY;

ALTER TABLE lrm_freight_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lrm_freight_contracts ON lrm_freight_contracts;
CREATE POLICY tenant_isolation_lrm_freight_contracts ON lrm_freight_contracts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lrm_freight_contracts FORCE ROW LEVEL SECURITY;

ALTER TABLE lrm_leakage_detections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lrm_leakage_detections ON lrm_leakage_detections;
CREATE POLICY tenant_isolation_lrm_leakage_detections ON lrm_leakage_detections
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lrm_leakage_detections FORCE ROW LEVEL SECURITY;

ALTER TABLE lrm_maximization_engines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lrm_maximization_engines ON lrm_maximization_engines;
CREATE POLICY tenant_isolation_lrm_maximization_engines ON lrm_maximization_engines
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lrm_maximization_engines FORCE ROW LEVEL SECURITY;

ALTER TABLE lrm_rate_integrities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lrm_rate_integrities ON lrm_rate_integrities;
CREATE POLICY tenant_isolation_lrm_rate_integrities ON lrm_rate_integrities
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lrm_rate_integrities FORCE ROW LEVEL SECURITY;

ALTER TABLE lrm_revenue_accruals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lrm_revenue_accruals ON lrm_revenue_accruals;
CREATE POLICY tenant_isolation_lrm_revenue_accruals ON lrm_revenue_accruals
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lrm_revenue_accruals FORCE ROW LEVEL SECURITY;

ALTER TABLE lrm_teu_maximizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lrm_teu_maximizations ON lrm_teu_maximizations;
CREATE POLICY tenant_isolation_lrm_teu_maximizations ON lrm_teu_maximizations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE lrm_teu_maximizations FORCE ROW LEVEL SECURITY;

ALTER TABLE ltr_alliance_agreements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ltr_alliance_agreements ON ltr_alliance_agreements;
CREATE POLICY tenant_isolation_ltr_alliance_agreements ON ltr_alliance_agreements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ltr_alliance_agreements FORCE ROW LEVEL SECURITY;

ALTER TABLE ltr_market_intelligence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ltr_market_intelligence ON ltr_market_intelligence;
CREATE POLICY tenant_isolation_ltr_market_intelligence ON ltr_market_intelligence
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ltr_market_intelligence FORCE ROW LEVEL SECURITY;

ALTER TABLE ltr_port_pair_trade_lanes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ltr_port_pair_trade_lanes ON ltr_port_pair_trade_lanes;
CREATE POLICY tenant_isolation_ltr_port_pair_trade_lanes ON ltr_port_pair_trade_lanes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ltr_port_pair_trade_lanes FORCE ROW LEVEL SECURITY;

ALTER TABLE ltr_port_stay_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ltr_port_stay_analyses ON ltr_port_stay_analyses;
CREATE POLICY tenant_isolation_ltr_port_stay_analyses ON ltr_port_stay_analyses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ltr_port_stay_analyses FORCE ROW LEVEL SECURITY;

ALTER TABLE ltr_route_optimizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ltr_route_optimizations ON ltr_route_optimizations;
CREATE POLICY tenant_isolation_ltr_route_optimizations ON ltr_route_optimizations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ltr_route_optimizations FORCE ROW LEVEL SECURITY;

ALTER TABLE ltr_service_loops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ltr_service_loops ON ltr_service_loops;
CREATE POLICY tenant_isolation_ltr_service_loops ON ltr_service_loops
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ltr_service_loops FORCE ROW LEVEL SECURITY;

ALTER TABLE ltr_slot_agreements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ltr_slot_agreements ON ltr_slot_agreements;
CREATE POLICY tenant_isolation_ltr_slot_agreements ON ltr_slot_agreements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ltr_slot_agreements FORCE ROW LEVEL SECURITY;

ALTER TABLE ltr_trade_lane_pnl ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ltr_trade_lane_pnl ON ltr_trade_lane_pnl;
CREATE POLICY tenant_isolation_ltr_trade_lane_pnl ON ltr_trade_lane_pnl
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ltr_trade_lane_pnl FORCE ROW LEVEL SECURITY;

ALTER TABLE mdm_commodities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mdm_commodities ON mdm_commodities;
CREATE POLICY tenant_isolation_mdm_commodities ON mdm_commodities
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mdm_commodities FORCE ROW LEVEL SECURITY;

ALTER TABLE mdm_container_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mdm_container_types ON mdm_container_types;
CREATE POLICY tenant_isolation_mdm_container_types ON mdm_container_types
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mdm_container_types FORCE ROW LEVEL SECURITY;

ALTER TABLE mdm_cost_centres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mdm_cost_centres ON mdm_cost_centres;
CREATE POLICY tenant_isolation_mdm_cost_centres ON mdm_cost_centres
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mdm_cost_centres FORCE ROW LEVEL SECURITY;

ALTER TABLE mdm_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mdm_customers ON mdm_customers;
CREATE POLICY tenant_isolation_mdm_customers ON mdm_customers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mdm_customers FORCE ROW LEVEL SECURITY;

ALTER TABLE mdm_exchange_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mdm_exchange_rates ON mdm_exchange_rates;
CREATE POLICY tenant_isolation_mdm_exchange_rates ON mdm_exchange_rates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mdm_exchange_rates FORCE ROW LEVEL SECURITY;

ALTER TABLE mdm_gl_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mdm_gl_accounts ON mdm_gl_accounts;
CREATE POLICY tenant_isolation_mdm_gl_accounts ON mdm_gl_accounts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mdm_gl_accounts FORCE ROW LEVEL SECURITY;

ALTER TABLE mdm_ports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mdm_ports ON mdm_ports;
CREATE POLICY tenant_isolation_mdm_ports ON mdm_ports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mdm_ports FORCE ROW LEVEL SECURITY;

ALTER TABLE mdm_tariff_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mdm_tariff_codes ON mdm_tariff_codes;
CREATE POLICY tenant_isolation_mdm_tariff_codes ON mdm_tariff_codes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mdm_tariff_codes FORCE ROW LEVEL SECURITY;

ALTER TABLE mdm_terminals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mdm_terminals ON mdm_terminals;
CREATE POLICY tenant_isolation_mdm_terminals ON mdm_terminals
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mdm_terminals FORCE ROW LEVEL SECURITY;

ALTER TABLE mdm_vessels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mdm_vessels ON mdm_vessels;
CREATE POLICY tenant_isolation_mdm_vessels ON mdm_vessels
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mdm_vessels FORCE ROW LEVEL SECURITY;

ALTER TABLE mec_annex_compliances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mec_annex_compliances ON mec_annex_compliances;
CREATE POLICY tenant_isolation_mec_annex_compliances ON mec_annex_compliances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mec_annex_compliances FORCE ROW LEVEL SECURITY;

ALTER TABLE mec_anti_foulings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mec_anti_foulings ON mec_anti_foulings;
CREATE POLICY tenant_isolation_mec_anti_foulings ON mec_anti_foulings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mec_anti_foulings FORCE ROW LEVEL SECURITY;

ALTER TABLE mec_ballast_waters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mec_ballast_waters ON mec_ballast_waters;
CREATE POLICY tenant_isolation_mec_ballast_waters ON mec_ballast_waters
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mec_ballast_waters FORCE ROW LEVEL SECURITY;

ALTER TABLE mec_cargo_charters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mec_cargo_charters ON mec_cargo_charters;
CREATE POLICY tenant_isolation_mec_cargo_charters ON mec_cargo_charters
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mec_cargo_charters FORCE ROW LEVEL SECURITY;

ALTER TABLE mec_cii_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mec_cii_ratings ON mec_cii_ratings;
CREATE POLICY tenant_isolation_mec_cii_ratings ON mec_cii_ratings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mec_cii_ratings FORCE ROW LEVEL SECURITY;

ALTER TABLE mec_environmental_incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mec_environmental_incidents ON mec_environmental_incidents;
CREATE POLICY tenant_isolation_mec_environmental_incidents ON mec_environmental_incidents
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mec_environmental_incidents FORCE ROW LEVEL SECURITY;

ALTER TABLE mec_sulphur_caps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mec_sulphur_caps ON mec_sulphur_caps;
CREATE POLICY tenant_isolation_mec_sulphur_caps ON mec_sulphur_caps
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mec_sulphur_caps FORCE ROW LEVEL SECURITY;

ALTER TABLE mec_waste_managements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mec_waste_managements ON mec_waste_managements;
CREATE POLICY tenant_isolation_mec_waste_managements ON mec_waste_managements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mec_waste_managements FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_compliance_filings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_compliance_filings ON mels_compliance_filings;
CREATE POLICY tenant_isolation_mels_compliance_filings ON mels_compliance_filings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_compliance_filings FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_compliance_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_compliance_rules ON mels_compliance_rules;
CREATE POLICY tenant_isolation_mels_compliance_rules ON mels_compliance_rules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_compliance_rules FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_currency_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_currency_configs ON mels_currency_configs;
CREATE POLICY tenant_isolation_mels_currency_configs ON mels_currency_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_currency_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_fx_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_fx_rates ON mels_fx_rates;
CREATE POLICY tenant_isolation_mels_fx_rates ON mels_fx_rates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_fx_rates FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_intercompany_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_intercompany_transactions ON mels_intercompany_transactions;
CREATE POLICY tenant_isolation_mels_intercompany_transactions ON mels_intercompany_transactions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_intercompany_transactions FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_legal_entities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_legal_entities ON mels_legal_entities;
CREATE POLICY tenant_isolation_mels_legal_entities ON mels_legal_entities
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_legal_entities FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_locale_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_locale_configs ON mels_locale_configs;
CREATE POLICY tenant_isolation_mels_locale_configs ON mels_locale_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_locale_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_oracle_integration_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_oracle_integration_configs ON mels_oracle_integration_configs;
CREATE POLICY tenant_isolation_mels_oracle_integration_configs ON mels_oracle_integration_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_oracle_integration_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_oracle_sync_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_oracle_sync_logs ON mels_oracle_sync_logs;
CREATE POLICY tenant_isolation_mels_oracle_sync_logs ON mels_oracle_sync_logs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_oracle_sync_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_settlement_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_settlement_batches ON mels_settlement_batches;
CREATE POLICY tenant_isolation_mels_settlement_batches ON mels_settlement_batches
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_settlement_batches FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_settlement_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_settlement_items ON mels_settlement_items;
CREATE POLICY tenant_isolation_mels_settlement_items ON mels_settlement_items
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_settlement_items FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_tax_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_tax_configs ON mels_tax_configs;
CREATE POLICY tenant_isolation_mels_tax_configs ON mels_tax_configs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_tax_configs FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_tax_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_tax_rates ON mels_tax_rates;
CREATE POLICY tenant_isolation_mels_tax_rates ON mels_tax_rates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_tax_rates FORCE ROW LEVEL SECURITY;

ALTER TABLE mels_translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mels_translations ON mels_translations;
CREATE POLICY tenant_isolation_mels_translations ON mels_translations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mels_translations FORCE ROW LEVEL SECURITY;

ALTER TABLE mob_container_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mob_container_surveys ON mob_container_surveys;
CREATE POLICY tenant_isolation_mob_container_surveys ON mob_container_surveys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mob_container_surveys FORCE ROW LEVEL SECURITY;

ALTER TABLE mob_damage_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mob_damage_assessments ON mob_damage_assessments;
CREATE POLICY tenant_isolation_mob_damage_assessments ON mob_damage_assessments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mob_damage_assessments FORCE ROW LEVEL SECURITY;

ALTER TABLE mob_driver_deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mob_driver_deliveries ON mob_driver_deliveries;
CREATE POLICY tenant_isolation_mob_driver_deliveries ON mob_driver_deliveries
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mob_driver_deliveries FORCE ROW LEVEL SECURITY;

ALTER TABLE mob_executive_dashboards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mob_executive_dashboards ON mob_executive_dashboards;
CREATE POLICY tenant_isolation_mob_executive_dashboards ON mob_executive_dashboards
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mob_executive_dashboards FORCE ROW LEVEL SECURITY;

ALTER TABLE mob_gate_processings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mob_gate_processings ON mob_gate_processings;
CREATE POLICY tenant_isolation_mob_gate_processings ON mob_gate_processings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mob_gate_processings FORCE ROW LEVEL SECURITY;

ALTER TABLE mob_offline_syncs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mob_offline_syncs ON mob_offline_syncs;
CREATE POLICY tenant_isolation_mob_offline_syncs ON mob_offline_syncs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mob_offline_syncs FORCE ROW LEVEL SECURITY;

ALTER TABLE mob_push_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mob_push_notifications ON mob_push_notifications;
CREATE POLICY tenant_isolation_mob_push_notifications ON mob_push_notifications
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mob_push_notifications FORCE ROW LEVEL SECURITY;

ALTER TABLE mob_yard_inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_mob_yard_inspections ON mob_yard_inspections;
CREATE POLICY tenant_isolation_mob_yard_inspections ON mob_yard_inspections
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE mob_yard_inspections FORCE ROW LEVEL SECURITY;

ALTER TABLE odm_bills_of_lading ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_odm_bills_of_lading ON odm_bills_of_lading;
CREATE POLICY tenant_isolation_odm_bills_of_lading ON odm_bills_of_lading
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE odm_bills_of_lading FORCE ROW LEVEL SECURITY;

ALTER TABLE odm_bl_charges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_odm_bl_charges ON odm_bl_charges;
CREATE POLICY tenant_isolation_odm_bl_charges ON odm_bl_charges
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE odm_bl_charges FORCE ROW LEVEL SECURITY;

ALTER TABLE odm_bl_containers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_odm_bl_containers ON odm_bl_containers;
CREATE POLICY tenant_isolation_odm_bl_containers ON odm_bl_containers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE odm_bl_containers FORCE ROW LEVEL SECURITY;

ALTER TABLE odm_cargo_tracking_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_odm_cargo_tracking_events ON odm_cargo_tracking_events;
CREATE POLICY tenant_isolation_odm_cargo_tracking_events ON odm_cargo_tracking_events
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE odm_cargo_tracking_events FORCE ROW LEVEL SECURITY;

ALTER TABLE odm_document_amendments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_odm_document_amendments ON odm_document_amendments;
CREATE POLICY tenant_isolation_odm_document_amendments ON odm_document_amendments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE odm_document_amendments FORCE ROW LEVEL SECURITY;

ALTER TABLE odm_manifest_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_odm_manifest_items ON odm_manifest_items;
CREATE POLICY tenant_isolation_odm_manifest_items ON odm_manifest_items
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE odm_manifest_items FORCE ROW LEVEL SECURITY;

ALTER TABLE odm_manifests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_odm_manifests ON odm_manifests;
CREATE POLICY tenant_isolation_odm_manifests ON odm_manifests
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE odm_manifests FORCE ROW LEVEL SECURITY;

ALTER TABLE odm_regulatory_filings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_odm_regulatory_filings ON odm_regulatory_filings;
CREATE POLICY tenant_isolation_odm_regulatory_filings ON odm_regulatory_filings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE odm_regulatory_filings FORCE ROW LEVEL SECURITY;

ALTER TABLE odm_shipping_instructions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_odm_shipping_instructions ON odm_shipping_instructions;
CREATE POLICY tenant_isolation_odm_shipping_instructions ON odm_shipping_instructions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE odm_shipping_instructions FORCE ROW LEVEL SECURITY;

ALTER TABLE odm_vgm_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_odm_vgm_records ON odm_vgm_records;
CREATE POLICY tenant_isolation_odm_vgm_records ON odm_vgm_records
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE odm_vgm_records FORCE ROW LEVEL SECURITY;

ALTER TABLE oog_cargo_acceptances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_oog_cargo_acceptances ON oog_cargo_acceptances;
CREATE POLICY tenant_isolation_oog_cargo_acceptances ON oog_cargo_acceptances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE oog_cargo_acceptances FORCE ROW LEVEL SECURITY;

ALTER TABLE oog_doc_permits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_oog_doc_permits ON oog_doc_permits;
CREATE POLICY tenant_isolation_oog_doc_permits ON oog_doc_permits
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE oog_doc_permits FORCE ROW LEVEL SECURITY;

ALTER TABLE oog_heavy_lifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_oog_heavy_lifts ON oog_heavy_lifts;
CREATE POLICY tenant_isolation_oog_heavy_lifts ON oog_heavy_lifts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE oog_heavy_lifts FORCE ROW LEVEL SECURITY;

ALTER TABLE oog_multi_modal_logistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_oog_multi_modal_logistics ON oog_multi_modal_logistics;
CREATE POLICY tenant_isolation_oog_multi_modal_logistics ON oog_multi_modal_logistics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE oog_multi_modal_logistics FORCE ROW LEVEL SECURITY;

ALTER TABLE oog_port_approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_oog_port_approvals ON oog_port_approvals;
CREATE POLICY tenant_isolation_oog_port_approvals ON oog_port_approvals
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE oog_port_approvals FORCE ROW LEVEL SECURITY;

ALTER TABLE oog_securing_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_oog_securing_plans ON oog_securing_plans;
CREATE POLICY tenant_isolation_oog_securing_plans ON oog_securing_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE oog_securing_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE oog_special_equipment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_oog_special_equipment ON oog_special_equipment;
CREATE POLICY tenant_isolation_oog_special_equipment ON oog_special_equipment
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE oog_special_equipment FORCE ROW LEVEL SECURITY;

ALTER TABLE oog_stowage_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_oog_stowage_plans ON oog_stowage_plans;
CREATE POLICY tenant_isolation_oog_stowage_plans ON oog_stowage_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE oog_stowage_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE pam_cash_to_masters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pam_cash_to_masters ON pam_cash_to_masters;
CREATE POLICY tenant_isolation_pam_cash_to_masters ON pam_cash_to_masters
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pam_cash_to_masters FORCE ROW LEVEL SECURITY;

ALTER TABLE pam_crew_change_coordinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pam_crew_change_coordinations ON pam_crew_change_coordinations;
CREATE POLICY tenant_isolation_pam_crew_change_coordinations ON pam_crew_change_coordinations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pam_crew_change_coordinations FORCE ROW LEVEL SECURITY;

ALTER TABLE pam_disbursement_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pam_disbursement_accounts ON pam_disbursement_accounts;
CREATE POLICY tenant_isolation_pam_disbursement_accounts ON pam_disbursement_accounts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pam_disbursement_accounts FORCE ROW LEVEL SECURITY;

ALTER TABLE pam_husbandry_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pam_husbandry_services ON pam_husbandry_services;
CREATE POLICY tenant_isolation_pam_husbandry_services ON pam_husbandry_services
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pam_husbandry_services FORCE ROW LEVEL SECURITY;

ALTER TABLE pam_port_authority_communications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pam_port_authority_communications ON pam_port_authority_communications;
CREATE POLICY tenant_isolation_pam_port_authority_communications ON pam_port_authority_communications
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pam_port_authority_communications FORCE ROW LEVEL SECURITY;

ALTER TABLE pam_port_call_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pam_port_call_plans ON pam_port_call_plans;
CREATE POLICY tenant_isolation_pam_port_call_plans ON pam_port_call_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pam_port_call_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE pam_pre_arrival_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pam_pre_arrival_checklists ON pam_pre_arrival_checklists;
CREATE POLICY tenant_isolation_pam_pre_arrival_checklists ON pam_pre_arrival_checklists
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pam_pre_arrival_checklists FORCE ROW LEVEL SECURITY;

ALTER TABLE pam_vessel_clearances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pam_vessel_clearances ON pam_vessel_clearances;
CREATE POLICY tenant_isolation_pam_vessel_clearances ON pam_vessel_clearances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pam_vessel_clearances FORCE ROW LEVEL SECURITY;

ALTER TABLE pda_agent_statements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pda_agent_statements ON pda_agent_statements;
CREATE POLICY tenant_isolation_pda_agent_statements ON pda_agent_statements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pda_agent_statements FORCE ROW LEVEL SECURITY;

ALTER TABLE pda_consolidated_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pda_consolidated_reports ON pda_consolidated_reports;
CREATE POLICY tenant_isolation_pda_consolidated_reports ON pda_consolidated_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pda_consolidated_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE pda_cost_benchmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pda_cost_benchmarks ON pda_cost_benchmarks;
CREATE POLICY tenant_isolation_pda_cost_benchmarks ON pda_cost_benchmarks
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pda_cost_benchmarks FORCE ROW LEVEL SECURITY;

ALTER TABLE pda_expense_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pda_expense_allocations ON pda_expense_allocations;
CREATE POLICY tenant_isolation_pda_expense_allocations ON pda_expense_allocations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pda_expense_allocations FORCE ROW LEVEL SECURITY;

ALTER TABLE pda_final_das ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pda_final_das ON pda_final_das;
CREATE POLICY tenant_isolation_pda_final_das ON pda_final_das
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pda_final_das FORCE ROW LEVEL SECURITY;

ALTER TABLE pda_port_costs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pda_port_costs ON pda_port_costs;
CREATE POLICY tenant_isolation_pda_port_costs ON pda_port_costs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pda_port_costs FORCE ROW LEVEL SECURITY;

ALTER TABLE pda_proforma_estimates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pda_proforma_estimates ON pda_proforma_estimates;
CREATE POLICY tenant_isolation_pda_proforma_estimates ON pda_proforma_estimates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pda_proforma_estimates FORCE ROW LEVEL SECURITY;

ALTER TABLE pda_variance_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pda_variance_analyses ON pda_variance_analyses;
CREATE POLICY tenant_isolation_pda_variance_analyses ON pda_variance_analyses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pda_variance_analyses FORCE ROW LEVEL SECURITY;

ALTER TABLE pe_approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pe_approvals ON pe_approvals;
CREATE POLICY tenant_isolation_pe_approvals ON pe_approvals
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pe_approvals FORCE ROW LEVEL SECURITY;

ALTER TABLE pe_e2e_flow_instances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pe_e2e_flow_instances ON pe_e2e_flow_instances;
CREATE POLICY tenant_isolation_pe_e2e_flow_instances ON pe_e2e_flow_instances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pe_e2e_flow_instances FORCE ROW LEVEL SECURITY;

ALTER TABLE pe_e2e_step_instances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pe_e2e_step_instances ON pe_e2e_step_instances;
CREATE POLICY tenant_isolation_pe_e2e_step_instances ON pe_e2e_step_instances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pe_e2e_step_instances FORCE ROW LEVEL SECURITY;

ALTER TABLE pe_event_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pe_event_log ON pe_event_log;
CREATE POLICY tenant_isolation_pe_event_log ON pe_event_log
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pe_event_log FORCE ROW LEVEL SECURITY;

ALTER TABLE pe_event_triggers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pe_event_triggers ON pe_event_triggers;
CREATE POLICY tenant_isolation_pe_event_triggers ON pe_event_triggers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pe_event_triggers FORCE ROW LEVEL SECURITY;

ALTER TABLE pe_flow_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pe_flow_events ON pe_flow_events;
CREATE POLICY tenant_isolation_pe_flow_events ON pe_flow_events
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pe_flow_events FORCE ROW LEVEL SECURITY;

ALTER TABLE pe_human_gates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pe_human_gates ON pe_human_gates;
CREATE POLICY tenant_isolation_pe_human_gates ON pe_human_gates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pe_human_gates FORCE ROW LEVEL SECURITY;

ALTER TABLE pe_process_instances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pe_process_instances ON pe_process_instances;
CREATE POLICY tenant_isolation_pe_process_instances ON pe_process_instances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pe_process_instances FORCE ROW LEVEL SECURITY;

ALTER TABLE pe_step_entity_bindings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pe_step_entity_bindings ON pe_step_entity_bindings;
CREATE POLICY tenant_isolation_pe_step_entity_bindings ON pe_step_entity_bindings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pe_step_entity_bindings FORCE ROW LEVEL SECURITY;

ALTER TABLE pe_step_instances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pe_step_instances ON pe_step_instances;
CREATE POLICY tenant_isolation_pe_step_instances ON pe_step_instances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE pe_step_instances FORCE ROW LEVEL SECURITY;

ALTER TABLE psc_goods_receipt_inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_psc_goods_receipt_inspections ON psc_goods_receipt_inspections;
CREATE POLICY tenant_isolation_psc_goods_receipt_inspections ON psc_goods_receipt_inspections
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE psc_goods_receipt_inspections FORCE ROW LEVEL SECURITY;

ALTER TABLE psc_inventory_stock_controls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_psc_inventory_stock_controls ON psc_inventory_stock_controls;
CREATE POLICY tenant_isolation_psc_inventory_stock_controls ON psc_inventory_stock_controls
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE psc_inventory_stock_controls FORCE ROW LEVEL SECURITY;

ALTER TABLE psc_procurement_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_psc_procurement_contracts ON psc_procurement_contracts;
CREATE POLICY tenant_isolation_psc_procurement_contracts ON psc_procurement_contracts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE psc_procurement_contracts FORCE ROW LEVEL SECURITY;

ALTER TABLE psc_purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_psc_purchase_orders ON psc_purchase_orders;
CREATE POLICY tenant_isolation_psc_purchase_orders ON psc_purchase_orders
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE psc_purchase_orders FORCE ROW LEVEL SECURITY;

ALTER TABLE psc_purchase_requisitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_psc_purchase_requisitions ON psc_purchase_requisitions;
CREATE POLICY tenant_isolation_psc_purchase_requisitions ON psc_purchase_requisitions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE psc_purchase_requisitions FORCE ROW LEVEL SECURITY;

ALTER TABLE psc_spend_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_psc_spend_analytics ON psc_spend_analytics;
CREATE POLICY tenant_isolation_psc_spend_analytics ON psc_spend_analytics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE psc_spend_analytics FORCE ROW LEVEL SECURITY;

ALTER TABLE psc_supplier_scorecards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_psc_supplier_scorecards ON psc_supplier_scorecards;
CREATE POLICY tenant_isolation_psc_supplier_scorecards ON psc_supplier_scorecards
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE psc_supplier_scorecards FORCE ROW LEVEL SECURITY;

ALTER TABLE psc_vendor_sourcings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_psc_vendor_sourcings ON psc_vendor_sourcings;
CREATE POLICY tenant_isolation_psc_vendor_sourcings ON psc_vendor_sourcings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE psc_vendor_sourcings FORCE ROW LEVEL SECURITY;

ALTER TABLE ptt_budget_plannings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ptt_budget_plannings ON ptt_budget_plannings;
CREATE POLICY tenant_isolation_ptt_budget_plannings ON ptt_budget_plannings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ptt_budget_plannings FORCE ROW LEVEL SECURITY;

ALTER TABLE ptt_cost_optimizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ptt_cost_optimizations ON ptt_cost_optimizations;
CREATE POLICY tenant_isolation_ptt_cost_optimizations ON ptt_cost_optimizations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ptt_cost_optimizations FORCE ROW LEVEL SECURITY;

ALTER TABLE ptt_invoice_validations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ptt_invoice_validations ON ptt_invoice_validations;
CREATE POLICY tenant_isolation_ptt_invoice_validations ON ptt_invoice_validations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ptt_invoice_validations FORCE ROW LEVEL SECURITY;

ALTER TABLE ptt_pilotage_towage_charges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ptt_pilotage_towage_charges ON ptt_pilotage_towage_charges;
CREATE POLICY tenant_isolation_ptt_pilotage_towage_charges ON ptt_pilotage_towage_charges
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ptt_pilotage_towage_charges FORCE ROW LEVEL SECURITY;

ALTER TABLE ptt_port_dues_wharfages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ptt_port_dues_wharfages ON ptt_port_dues_wharfages;
CREATE POLICY tenant_isolation_ptt_port_dues_wharfages ON ptt_port_dues_wharfages
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ptt_port_dues_wharfages FORCE ROW LEVEL SECURITY;

ALTER TABLE ptt_storage_demurrage_tariffs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ptt_storage_demurrage_tariffs ON ptt_storage_demurrage_tariffs;
CREATE POLICY tenant_isolation_ptt_storage_demurrage_tariffs ON ptt_storage_demurrage_tariffs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ptt_storage_demurrage_tariffs FORCE ROW LEVEL SECURITY;

ALTER TABLE ptt_tariff_comparisons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ptt_tariff_comparisons ON ptt_tariff_comparisons;
CREATE POLICY tenant_isolation_ptt_tariff_comparisons ON ptt_tariff_comparisons
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ptt_tariff_comparisons FORCE ROW LEVEL SECURITY;

ALTER TABLE ptt_terminal_handling_charges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ptt_terminal_handling_charges ON ptt_terminal_handling_charges;
CREATE POLICY tenant_isolation_ptt_terminal_handling_charges ON ptt_terminal_handling_charges
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ptt_terminal_handling_charges FORCE ROW LEVEL SECURITY;

ALTER TABLE rcm_breakdown_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rcm_breakdown_responses ON rcm_breakdown_responses;
CREATE POLICY tenant_isolation_rcm_breakdown_responses ON rcm_breakdown_responses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE rcm_breakdown_responses FORCE ROW LEVEL SECURITY;

ALTER TABLE rcm_claim_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rcm_claim_analytics ON rcm_claim_analytics;
CREATE POLICY tenant_isolation_rcm_claim_analytics ON rcm_claim_analytics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE rcm_claim_analytics FORCE ROW LEVEL SECURITY;

ALTER TABLE rcm_cold_chain_docs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rcm_cold_chain_docs ON rcm_cold_chain_docs;
CREATE POLICY tenant_isolation_rcm_cold_chain_docs ON rcm_cold_chain_docs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE rcm_cold_chain_docs FORCE ROW LEVEL SECURITY;

ALTER TABLE rcm_power_management ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rcm_power_management ON rcm_power_management;
CREATE POLICY tenant_isolation_rcm_power_management ON rcm_power_management
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE rcm_power_management FORCE ROW LEVEL SECURITY;

ALTER TABLE rcm_pti_inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rcm_pti_inspections ON rcm_pti_inspections;
CREATE POLICY tenant_isolation_rcm_pti_inspections ON rcm_pti_inspections
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE rcm_pti_inspections FORCE ROW LEVEL SECURITY;

ALTER TABLE rcm_reefer_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rcm_reefer_bookings ON rcm_reefer_bookings;
CREATE POLICY tenant_isolation_rcm_reefer_bookings ON rcm_reefer_bookings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE rcm_reefer_bookings FORCE ROW LEVEL SECURITY;

ALTER TABLE rcm_temp_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rcm_temp_alerts ON rcm_temp_alerts;
CREATE POLICY tenant_isolation_rcm_temp_alerts ON rcm_temp_alerts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE rcm_temp_alerts FORCE ROW LEVEL SECURITY;

ALTER TABLE rcm_temp_monitorings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rcm_temp_monitorings ON rcm_temp_monitorings;
CREATE POLICY tenant_isolation_rcm_temp_monitorings ON rcm_temp_monitorings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE rcm_temp_monitorings FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_account_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_account_plans ON scm_account_plans;
CREATE POLICY tenant_isolation_scm_account_plans ON scm_account_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_account_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_campaigns ON scm_campaigns;
CREATE POLICY tenant_isolation_scm_campaigns ON scm_campaigns
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_campaigns FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_contract_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_contract_line_items ON scm_contract_line_items;
CREATE POLICY tenant_isolation_scm_contract_line_items ON scm_contract_line_items
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_contract_line_items FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_contracts ON scm_contracts;
CREATE POLICY tenant_isolation_scm_contracts ON scm_contracts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_contracts FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_customer_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_customer_contacts ON scm_customer_contacts;
CREATE POLICY tenant_isolation_scm_customer_contacts ON scm_customer_contacts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_customer_contacts FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_customer_segments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_customer_segments ON scm_customer_segments;
CREATE POLICY tenant_isolation_scm_customer_segments ON scm_customer_segments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_customer_segments FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_customers ON scm_customers;
CREATE POLICY tenant_isolation_scm_customers ON scm_customers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_customers FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_incentive_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_incentive_rules ON scm_incentive_rules;
CREATE POLICY tenant_isolation_scm_incentive_rules ON scm_incentive_rules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_incentive_rules FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_leads ON scm_leads;
CREATE POLICY tenant_isolation_scm_leads ON scm_leads
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_leads FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_onboarding_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_onboarding_checklists ON scm_onboarding_checklists;
CREATE POLICY tenant_isolation_scm_onboarding_checklists ON scm_onboarding_checklists
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_onboarding_checklists FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_opportunities ON scm_opportunities;
CREATE POLICY tenant_isolation_scm_opportunities ON scm_opportunities
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_opportunities FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_opportunity_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_opportunity_activities ON scm_opportunity_activities;
CREATE POLICY tenant_isolation_scm_opportunity_activities ON scm_opportunity_activities
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_opportunity_activities FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_pipeline_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_pipeline_stages ON scm_pipeline_stages;
CREATE POLICY tenant_isolation_scm_pipeline_stages ON scm_pipeline_stages
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_pipeline_stages FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_quotation_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_quotation_line_items ON scm_quotation_line_items;
CREATE POLICY tenant_isolation_scm_quotation_line_items ON scm_quotation_line_items
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_quotation_line_items FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_rate_quotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_rate_quotations ON scm_rate_quotations;
CREATE POLICY tenant_isolation_scm_rate_quotations ON scm_rate_quotations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_rate_quotations FORCE ROW LEVEL SECURITY;

ALTER TABLE scm_sales_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_scm_sales_targets ON scm_sales_targets;
CREATE POLICY tenant_isolation_scm_sales_targets ON scm_sales_targets
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE scm_sales_targets FORCE ROW LEVEL SECURITY;

ALTER TABLE ser_alt_fuel_trackings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ser_alt_fuel_trackings ON ser_alt_fuel_trackings;
CREATE POLICY tenant_isolation_ser_alt_fuel_trackings ON ser_alt_fuel_trackings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ser_alt_fuel_trackings FORCE ROW LEVEL SECURITY;

ALTER TABLE ser_carbon_footprints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ser_carbon_footprints ON ser_carbon_footprints;
CREATE POLICY tenant_isolation_ser_carbon_footprints ON ser_carbon_footprints
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ser_carbon_footprints FORCE ROW LEVEL SECURITY;

ALTER TABLE ser_decarb_roadmaps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ser_decarb_roadmaps ON ser_decarb_roadmaps;
CREATE POLICY tenant_isolation_ser_decarb_roadmaps ON ser_decarb_roadmaps
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ser_decarb_roadmaps FORCE ROW LEVEL SECURITY;

ALTER TABLE ser_esg_kpis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ser_esg_kpis ON ser_esg_kpis;
CREATE POLICY tenant_isolation_ser_esg_kpis ON ser_esg_kpis
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ser_esg_kpis FORCE ROW LEVEL SECURITY;

ALTER TABLE ser_ghg_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ser_ghg_reports ON ser_ghg_reports;
CREATE POLICY tenant_isolation_ser_ghg_reports ON ser_ghg_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ser_ghg_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE ser_poseidon_alignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ser_poseidon_alignments ON ser_poseidon_alignments;
CREATE POLICY tenant_isolation_ser_poseidon_alignments ON ser_poseidon_alignments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ser_poseidon_alignments FORCE ROW LEVEL SECURITY;

ALTER TABLE ser_sea_cargo_charters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ser_sea_cargo_charters ON ser_sea_cargo_charters;
CREATE POLICY tenant_isolation_ser_sea_cargo_charters ON ser_sea_cargo_charters
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ser_sea_cargo_charters FORCE ROW LEVEL SECURITY;

ALTER TABLE ser_tcfd_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_ser_tcfd_reports ON ser_tcfd_reports;
CREATE POLICY tenant_isolation_ser_tcfd_reports ON ser_tcfd_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE ser_tcfd_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sessions ON sessions;
CREATE POLICY tenant_isolation_sessions ON sessions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;

ALTER TABLE sim_cargo_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sim_cargo_surveys ON sim_cargo_surveys;
CREATE POLICY tenant_isolation_sim_cargo_surveys ON sim_cargo_surveys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE sim_cargo_surveys FORCE ROW LEVEL SECURITY;

ALTER TABLE sim_classification_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sim_classification_surveys ON sim_classification_surveys;
CREATE POLICY tenant_isolation_sim_classification_surveys ON sim_classification_surveys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE sim_classification_surveys FORCE ROW LEVEL SECURITY;

ALTER TABLE sim_container_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sim_container_surveys ON sim_container_surveys;
CREATE POLICY tenant_isolation_sim_container_surveys ON sim_container_surveys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE sim_container_surveys FORCE ROW LEVEL SECURITY;

ALTER TABLE sim_draft_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sim_draft_surveys ON sim_draft_surveys;
CREATE POLICY tenant_isolation_sim_draft_surveys ON sim_draft_surveys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE sim_draft_surveys FORCE ROW LEVEL SECURITY;

ALTER TABLE sim_hatch_inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sim_hatch_inspections ON sim_hatch_inspections;
CREATE POLICY tenant_isolation_sim_hatch_inspections ON sim_hatch_inspections
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE sim_hatch_inspections FORCE ROW LEVEL SECURITY;

ALTER TABLE sim_hire_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sim_hire_surveys ON sim_hire_surveys;
CREATE POLICY tenant_isolation_sim_hire_surveys ON sim_hire_surveys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE sim_hire_surveys FORCE ROW LEVEL SECURITY;

ALTER TABLE sim_reefer_pti_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sim_reefer_pti_surveys ON sim_reefer_pti_surveys;
CREATE POLICY tenant_isolation_sim_reefer_pti_surveys ON sim_reefer_pti_surveys
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE sim_reefer_pti_surveys FORCE ROW LEVEL SECURITY;

ALTER TABLE sim_survey_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sim_survey_reports ON sim_survey_reports;
CREATE POLICY tenant_isolation_sim_survey_reports ON sim_survey_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE sim_survey_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE svp_canal_transits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_svp_canal_transits ON svp_canal_transits;
CREATE POLICY tenant_isolation_svp_canal_transits ON svp_canal_transits
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE svp_canal_transits FORCE ROW LEVEL SECURITY;

ALTER TABLE svp_deployment_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_svp_deployment_plans ON svp_deployment_plans;
CREATE POLICY tenant_isolation_svp_deployment_plans ON svp_deployment_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE svp_deployment_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE svp_eta_managements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_svp_eta_managements ON svp_eta_managements;
CREATE POLICY tenant_isolation_svp_eta_managements ON svp_eta_managements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE svp_eta_managements FORCE ROW LEVEL SECURITY;

ALTER TABLE svp_port_sequences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_svp_port_sequences ON svp_port_sequences;
CREATE POLICY tenant_isolation_svp_port_sequences ON svp_port_sequences
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE svp_port_sequences FORCE ROW LEVEL SECURITY;

ALTER TABLE svp_service_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_svp_service_schedules ON svp_service_schedules;
CREATE POLICY tenant_isolation_svp_service_schedules ON svp_service_schedules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE svp_service_schedules FORCE ROW LEVEL SECURITY;

ALTER TABLE svp_speed_fuel_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_svp_speed_fuel_analyses ON svp_speed_fuel_analyses;
CREATE POLICY tenant_isolation_svp_speed_fuel_analyses ON svp_speed_fuel_analyses
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE svp_speed_fuel_analyses FORCE ROW LEVEL SECURITY;

ALTER TABLE svp_voyage_optimizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_svp_voyage_optimizations ON svp_voyage_optimizations;
CREATE POLICY tenant_isolation_svp_voyage_optimizations ON svp_voyage_optimizations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE svp_voyage_optimizations FORCE ROW LEVEL SECURITY;

ALTER TABLE svp_weather_routings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_svp_weather_routings ON svp_weather_routings;
CREATE POLICY tenant_isolation_svp_weather_routings ON svp_weather_routings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE svp_weather_routings FORCE ROW LEVEL SECURITY;

ALTER TABLE tcm_bank_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tcm_bank_accounts ON tcm_bank_accounts;
CREATE POLICY tenant_isolation_tcm_bank_accounts ON tcm_bank_accounts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE tcm_bank_accounts FORCE ROW LEVEL SECURITY;

ALTER TABLE tcm_bank_guarantees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tcm_bank_guarantees ON tcm_bank_guarantees;
CREATE POLICY tenant_isolation_tcm_bank_guarantees ON tcm_bank_guarantees
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE tcm_bank_guarantees FORCE ROW LEVEL SECURITY;

ALTER TABLE tcm_bank_reconciliations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tcm_bank_reconciliations ON tcm_bank_reconciliations;
CREATE POLICY tenant_isolation_tcm_bank_reconciliations ON tcm_bank_reconciliations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE tcm_bank_reconciliations FORCE ROW LEVEL SECURITY;

ALTER TABLE tcm_cash_pooling_sweeps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tcm_cash_pooling_sweeps ON tcm_cash_pooling_sweeps;
CREATE POLICY tenant_isolation_tcm_cash_pooling_sweeps ON tcm_cash_pooling_sweeps
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE tcm_cash_pooling_sweeps FORCE ROW LEVEL SECURITY;

ALTER TABLE tcm_cash_positions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tcm_cash_positions ON tcm_cash_positions;
CREATE POLICY tenant_isolation_tcm_cash_positions ON tcm_cash_positions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE tcm_cash_positions FORCE ROW LEVEL SECURITY;

ALTER TABLE tcm_fx_hedging_exposures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tcm_fx_hedging_exposures ON tcm_fx_hedging_exposures;
CREATE POLICY tenant_isolation_tcm_fx_hedging_exposures ON tcm_fx_hedging_exposures
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE tcm_fx_hedging_exposures FORCE ROW LEVEL SECURITY;

ALTER TABLE tcm_intercompany_loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tcm_intercompany_loans ON tcm_intercompany_loans;
CREATE POLICY tenant_isolation_tcm_intercompany_loans ON tcm_intercompany_loans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE tcm_intercompany_loans FORCE ROW LEVEL SECURITY;

ALTER TABLE tcm_letters_of_credit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tcm_letters_of_credit ON tcm_letters_of_credit;
CREATE POLICY tenant_isolation_tcm_letters_of_credit ON tcm_letters_of_credit
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE tcm_letters_of_credit FORCE ROW LEVEL SECURITY;

ALTER TABLE thm_cargo_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_thm_cargo_plans ON thm_cargo_plans;
CREATE POLICY tenant_isolation_thm_cargo_plans ON thm_cargo_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE thm_cargo_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE thm_cargo_trackings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_thm_cargo_trackings ON thm_cargo_trackings;
CREATE POLICY tenant_isolation_thm_cargo_trackings ON thm_cargo_trackings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE thm_cargo_trackings FORCE ROW LEVEL SECURITY;

ALTER TABLE thm_feeder_coordinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_thm_feeder_coordinations ON thm_feeder_coordinations;
CREATE POLICY tenant_isolation_thm_feeder_coordinations ON thm_feeder_coordinations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE thm_feeder_coordinations FORCE ROW LEVEL SECURITY;

ALTER TABLE thm_hub_efficiencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_thm_hub_efficiencies ON thm_hub_efficiencies;
CREATE POLICY tenant_isolation_thm_hub_efficiencies ON thm_hub_efficiencies
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE thm_hub_efficiencies FORCE ROW LEVEL SECURITY;

ALTER TABLE thm_missed_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_thm_missed_connections ON thm_missed_connections;
CREATE POLICY tenant_isolation_thm_missed_connections ON thm_missed_connections
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE thm_missed_connections FORCE ROW LEVEL SECURITY;

ALTER TABLE thm_optimization_engines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_thm_optimization_engines ON thm_optimization_engines;
CREATE POLICY tenant_isolation_thm_optimization_engines ON thm_optimization_engines
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE thm_optimization_engines FORCE ROW LEVEL SECURITY;

ALTER TABLE thm_penalty_trackings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_thm_penalty_trackings ON thm_penalty_trackings;
CREATE POLICY tenant_isolation_thm_penalty_trackings ON thm_penalty_trackings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE thm_penalty_trackings FORCE ROW LEVEL SECURITY;

ALTER TABLE thm_revenue_attributions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_thm_revenue_attributions ON thm_revenue_attributions;
CREATE POLICY tenant_isolation_thm_revenue_attributions ON thm_revenue_attributions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE thm_revenue_attributions FORCE ROW LEVEL SECURITY;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE vpe_carbon_emissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vpe_carbon_emissions ON vpe_carbon_emissions;
CREATE POLICY tenant_isolation_vpe_carbon_emissions ON vpe_carbon_emissions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vpe_carbon_emissions FORCE ROW LEVEL SECURITY;

ALTER TABLE vpe_cii_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vpe_cii_ratings ON vpe_cii_ratings;
CREATE POLICY tenant_isolation_vpe_cii_ratings ON vpe_cii_ratings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vpe_cii_ratings FORCE ROW LEVEL SECURITY;

ALTER TABLE vpe_eexi_compliances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vpe_eexi_compliances ON vpe_eexi_compliances;
CREATE POLICY tenant_isolation_vpe_eexi_compliances ON vpe_eexi_compliances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vpe_eexi_compliances FORCE ROW LEVEL SECURITY;

ALTER TABLE vpe_fuel_benchmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vpe_fuel_benchmarks ON vpe_fuel_benchmarks;
CREATE POLICY tenant_isolation_vpe_fuel_benchmarks ON vpe_fuel_benchmarks
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vpe_fuel_benchmarks FORCE ROW LEVEL SECURITY;

ALTER TABLE vpe_noon_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vpe_noon_reports ON vpe_noon_reports;
CREATE POLICY tenant_isolation_vpe_noon_reports ON vpe_noon_reports
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vpe_noon_reports FORCE ROW LEVEL SECURITY;

ALTER TABLE vpe_speed_consumptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vpe_speed_consumptions ON vpe_speed_consumptions;
CREATE POLICY tenant_isolation_vpe_speed_consumptions ON vpe_speed_consumptions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vpe_speed_consumptions FORCE ROW LEVEL SECURITY;

ALTER TABLE vpe_voyage_performances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vpe_voyage_performances ON vpe_voyage_performances;
CREATE POLICY tenant_isolation_vpe_voyage_performances ON vpe_voyage_performances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vpe_voyage_performances FORCE ROW LEVEL SECURITY;

ALTER TABLE vpe_weather_routings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vpe_weather_routings ON vpe_weather_routings;
CREATE POLICY tenant_isolation_vpe_weather_routings ON vpe_weather_routings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vpe_weather_routings FORCE ROW LEVEL SECURITY;

ALTER TABLE vrs_hire_reconciliations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vrs_hire_reconciliations ON vrs_hire_reconciliations;
CREATE POLICY tenant_isolation_vrs_hire_reconciliations ON vrs_hire_reconciliations
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vrs_hire_reconciliations FORCE ROW LEVEL SECURITY;

ALTER TABLE vrs_interco_settlements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vrs_interco_settlements ON vrs_interco_settlements;
CREATE POLICY tenant_isolation_vrs_interco_settlements ON vrs_interco_settlements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vrs_interco_settlements FORCE ROW LEVEL SECURITY;

ALTER TABLE vrs_profit_benchmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vrs_profit_benchmarks ON vrs_profit_benchmarks;
CREATE POLICY tenant_isolation_vrs_profit_benchmarks ON vrs_profit_benchmarks
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vrs_profit_benchmarks FORCE ROW LEVEL SECURITY;

ALTER TABLE vrs_result_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vrs_result_workflows ON vrs_result_workflows;
CREATE POLICY tenant_isolation_vrs_result_workflows ON vrs_result_workflows
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vrs_result_workflows FORCE ROW LEVEL SECURITY;

ALTER TABLE vrs_tc_settlements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vrs_tc_settlements ON vrs_tc_settlements;
CREATE POLICY tenant_isolation_vrs_tc_settlements ON vrs_tc_settlements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vrs_tc_settlements FORCE ROW LEVEL SECURITY;

ALTER TABLE vrs_voyage_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vrs_voyage_analytics ON vrs_voyage_analytics;
CREATE POLICY tenant_isolation_vrs_voyage_analytics ON vrs_voyage_analytics
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vrs_voyage_analytics FORCE ROW LEVEL SECURITY;

ALTER TABLE vrs_voyage_closes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vrs_voyage_closes ON vrs_voyage_closes;
CREATE POLICY tenant_isolation_vrs_voyage_closes ON vrs_voyage_closes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vrs_voyage_closes FORCE ROW LEVEL SECURITY;

ALTER TABLE vrs_voyage_pnls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vrs_voyage_pnls ON vrs_voyage_pnls;
CREATE POLICY tenant_isolation_vrs_voyage_pnls ON vrs_voyage_pnls
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vrs_voyage_pnls FORCE ROW LEVEL SECURITY;

ALTER TABLE vtm_compliance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vtm_compliance_records ON vtm_compliance_records;
CREATE POLICY tenant_isolation_vtm_compliance_records ON vtm_compliance_records
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vtm_compliance_records FORCE ROW LEVEL SECURITY;

ALTER TABLE vtm_defect_repairs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vtm_defect_repairs ON vtm_defect_repairs;
CREATE POLICY tenant_isolation_vtm_defect_repairs ON vtm_defect_repairs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vtm_defect_repairs FORCE ROW LEVEL SECURITY;

ALTER TABLE vtm_dry_dock_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vtm_dry_dock_plans ON vtm_dry_dock_plans;
CREATE POLICY tenant_isolation_vtm_dry_dock_plans ON vtm_dry_dock_plans
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vtm_dry_dock_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE vtm_planned_maintenance_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vtm_planned_maintenance_tasks ON vtm_planned_maintenance_tasks;
CREATE POLICY tenant_isolation_vtm_planned_maintenance_tasks ON vtm_planned_maintenance_tasks
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vtm_planned_maintenance_tasks FORCE ROW LEVEL SECURITY;

ALTER TABLE vtm_predictive_maintenance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vtm_predictive_maintenance ON vtm_predictive_maintenance;
CREATE POLICY tenant_isolation_vtm_predictive_maintenance ON vtm_predictive_maintenance
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vtm_predictive_maintenance FORCE ROW LEVEL SECURITY;

ALTER TABLE vtm_spare_parts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vtm_spare_parts ON vtm_spare_parts;
CREATE POLICY tenant_isolation_vtm_spare_parts ON vtm_spare_parts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vtm_spare_parts FORCE ROW LEVEL SECURITY;

ALTER TABLE vtm_survey_trackings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vtm_survey_trackings ON vtm_survey_trackings;
CREATE POLICY tenant_isolation_vtm_survey_trackings ON vtm_survey_trackings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vtm_survey_trackings FORCE ROW LEVEL SECURITY;

ALTER TABLE vtm_technical_procurements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_vtm_technical_procurements ON vtm_technical_procurements;
CREATE POLICY tenant_isolation_vtm_technical_procurements ON vtm_technical_procurements
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE vtm_technical_procurements FORCE ROW LEVEL SECURITY;

ALTER TABLE wne_doa_matrix ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wne_doa_matrix ON wne_doa_matrix;
CREATE POLICY tenant_isolation_wne_doa_matrix ON wne_doa_matrix
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE wne_doa_matrix FORCE ROW LEVEL SECURITY;

ALTER TABLE wne_notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wne_notification_preferences ON wne_notification_preferences;
CREATE POLICY tenant_isolation_wne_notification_preferences ON wne_notification_preferences
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE wne_notification_preferences FORCE ROW LEVEL SECURITY;

ALTER TABLE wne_notification_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wne_notification_templates ON wne_notification_templates;
CREATE POLICY tenant_isolation_wne_notification_templates ON wne_notification_templates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE wne_notification_templates FORCE ROW LEVEL SECURITY;

ALTER TABLE wne_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wne_notifications ON wne_notifications;
CREATE POLICY tenant_isolation_wne_notifications ON wne_notifications
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE wne_notifications FORCE ROW LEVEL SECURITY;

ALTER TABLE wne_routing_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wne_routing_rules ON wne_routing_rules;
CREATE POLICY tenant_isolation_wne_routing_rules ON wne_routing_rules
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE wne_routing_rules FORCE ROW LEVEL SECURITY;

ALTER TABLE wne_sla_definitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wne_sla_definitions ON wne_sla_definitions;
CREATE POLICY tenant_isolation_wne_sla_definitions ON wne_sla_definitions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE wne_sla_definitions FORCE ROW LEVEL SECURITY;

ALTER TABLE wne_sla_instances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wne_sla_instances ON wne_sla_instances;
CREATE POLICY tenant_isolation_wne_sla_instances ON wne_sla_instances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE wne_sla_instances FORCE ROW LEVEL SECURITY;

ALTER TABLE wne_workflow_instances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wne_workflow_instances ON wne_workflow_instances;
CREATE POLICY tenant_isolation_wne_workflow_instances ON wne_workflow_instances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE wne_workflow_instances FORCE ROW LEVEL SECURITY;

ALTER TABLE wne_workflow_step_instances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wne_workflow_step_instances ON wne_workflow_step_instances;
CREATE POLICY tenant_isolation_wne_workflow_step_instances ON wne_workflow_step_instances
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE wne_workflow_step_instances FORCE ROW LEVEL SECURITY;

ALTER TABLE wne_workflow_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wne_workflow_steps ON wne_workflow_steps;
CREATE POLICY tenant_isolation_wne_workflow_steps ON wne_workflow_steps
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE wne_workflow_steps FORCE ROW LEVEL SECURITY;

ALTER TABLE wne_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_wne_workflows ON wne_workflows;
CREATE POLICY tenant_isolation_wne_workflows ON wne_workflows
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE wne_workflows FORCE ROW LEVEL SECURITY;

ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_auth_audit_log ON auth_audit_log;
DROP POLICY IF EXISTS tenant_isolation ON auth_audit_log;
CREATE POLICY tenant_isolation_auth_audit_log ON auth_audit_log
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE auth_audit_log FORCE ROW LEVEL SECURITY;

ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_role_assignments ON role_assignments;
DROP POLICY IF EXISTS tenant_isolation ON role_assignments;
CREATE POLICY tenant_isolation_role_assignments ON role_assignments
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE role_assignments FORCE ROW LEVEL SECURITY;

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_role_permissions ON role_permissions;
DROP POLICY IF EXISTS tenant_isolation ON role_permissions;
CREATE POLICY tenant_isolation_role_permissions ON role_permissions
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE role_permissions FORCE ROW LEVEL SECURITY;

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_roles ON roles;
DROP POLICY IF EXISTS tenant_isolation ON roles;
CREATE POLICY tenant_isolation_roles ON roles
  USING (tenant_id IS NULL OR tenant_id = current_setting('app.tenant_id')::uuid);
ALTER TABLE roles FORCE ROW LEVEL SECURITY;
