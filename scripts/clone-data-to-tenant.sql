-- Clone all Sales CRM data + AI agents from Test Corp 3 to jineeshs@gmail.com's tenant
-- Source: 7f709f8d-ca75-4626-85ae-5501ddeea85e (Test Corp 3)
-- Target: b0861726-81c3-40c5-ac12-e66c5ec9c4bc (jineeshs@gmail.com)
-- Target user: bf57c426-866c-4d27-9a98-42c471e4df6c

BEGIN;

CREATE TEMP TABLE id_map (table_name text, old_id uuid, new_id uuid DEFAULT gen_random_uuid());

-- Pre-generate new IDs for all source records
INSERT INTO id_map (table_name, old_id) SELECT 'seg', id FROM scm_customer_segments WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'stg', id FROM scm_pipeline_stages WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'cam', id FROM scm_campaigns WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'cust', id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'cc', id FROM scm_customer_contacts WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'lead', id FROM scm_leads WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'opp', id FROM scm_opportunities WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'act', id FROM scm_opportunity_activities WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'rq', id FROM scm_rate_quotations WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'con', id FROM scm_contracts WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'st', id FROM scm_sales_targets WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'ir', id FROM scm_incentive_rules WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'ob', id FROM scm_onboarding_checklists WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'ap', id FROM scm_account_plans WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'qli', id FROM scm_quotation_line_items WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'cli', id FROM scm_contract_line_items WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'agent', id FROM aaf_agents WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';
INSERT INTO id_map (table_name, old_id) SELECT 'run', id FROM aaf_agent_runs WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';

CREATE OR REPLACE FUNCTION mid(p_old uuid) RETURNS uuid AS $$
  SELECT COALESCE((SELECT new_id FROM id_map WHERE old_id = p_old LIMIT 1), p_old);
$$ LANGUAGE sql;

-- 1. Customer Segments
INSERT INTO scm_customer_segments (id, tenant_id, segment_code, segment_name, description, criteria, is_active, sort_order, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', s.segment_code, s.segment_name, s.description, s.criteria, s.is_active, s.sort_order, s.created_at, s.updated_at
FROM scm_customer_segments s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
ON CONFLICT (tenant_id, segment_code) DO NOTHING;

-- 2. Pipeline Stages (no description column)
INSERT INTO scm_pipeline_stages (id, tenant_id, stage_name, stage_code, sort_order, probability, color, is_won, is_lost, is_active, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', s.stage_name, s.stage_code, s.sort_order, s.probability, s.color, s.is_won, s.is_lost, s.is_active, s.metadata, s.created_at, s.updated_at
FROM scm_pipeline_stages s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
ON CONFLICT (tenant_id, stage_code) DO NOTHING;

-- 3. Campaigns
INSERT INTO scm_campaigns (id, tenant_id, campaign_name, campaign_code, campaign_type, description, target_audience, channel, budget_amount, spent_amount, currency, start_date, end_date, leads_generated, conversions, roi, region, trade_lane, status, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', s.campaign_name, s.campaign_code, s.campaign_type, s.description, s.target_audience, s.channel, s.budget_amount, s.spent_amount, s.currency, s.start_date, s.end_date, s.leads_generated, s.conversions, s.roi, s.region, s.trade_lane, s.status, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_campaigns s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
ON CONFLICT (tenant_id, campaign_code) DO NOTHING;

-- 4. Customers (segment_id FK, account_manager_id → target user)
INSERT INTO scm_customers (id, tenant_id, customer_code, company_name, trade_name, customer_type, segment_id, tier, industry, country, city, address, postal_code, phone, email, website, tax_registration_no, credit_limit_amount, credit_currency, payment_terms_days, annual_revenue, employee_count, account_manager_id, status, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', s.customer_code, s.company_name, s.trade_name, s.customer_type, CASE WHEN s.segment_id IS NOT NULL THEN mid(s.segment_id) ELSE NULL END, s.tier, s.industry, s.country, s.city, s.address, s.postal_code, s.phone, s.email, s.website, s.tax_registration_no, s.credit_limit_amount, s.credit_currency, s.payment_terms_days, s.annual_revenue, s.employee_count, 'bf57c426-866c-4d27-9a98-42c471e4df6c', s.status, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_customers s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
ON CONFLICT (tenant_id, customer_code) DO NOTHING;

-- 5. Customer Contacts (customer_id FK)
INSERT INTO scm_customer_contacts (id, tenant_id, customer_id, first_name, last_name, job_title, department, email, phone, mobile, is_primary, is_decision_maker, preferred_language, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', mid(s.customer_id), s.first_name, s.last_name, s.job_title, s.department, s.email, s.phone, s.mobile, s.is_primary, s.is_decision_maker, s.preferred_language, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_customer_contacts s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
AND s.customer_id IN (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e');

-- 6. Leads (campaign_id FK, assigned_to → target user, converted_to_customer_id FK)
INSERT INTO scm_leads (id, tenant_id, company_name, contact_name, contact_email, contact_phone, job_title, country, city, industry, estimated_teu, estimated_revenue, trade_lane, source, campaign_id, assigned_to, qualification_score, converted_to_customer_id, converted_at, status, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', s.company_name, s.contact_name, s.contact_email, s.contact_phone, s.job_title, s.country, s.city, s.industry, s.estimated_teu, s.estimated_revenue, s.trade_lane, s.source, CASE WHEN s.campaign_id IS NOT NULL THEN mid(s.campaign_id) ELSE NULL END, 'bf57c426-866c-4d27-9a98-42c471e4df6c', s.qualification_score, CASE WHEN s.converted_to_customer_id IS NOT NULL THEN mid(s.converted_to_customer_id) ELSE NULL END, s.converted_at, s.status, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_leads s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';

-- 7. Opportunities (customer_id, contact_id, stage_id FKs, owner_id → target user)
INSERT INTO scm_opportunities (id, tenant_id, opportunity_name, opportunity_code, customer_id, contact_id, stage_id, owner_id, expected_revenue, currency, probability, expected_teu, trade_lane, origin_port, destination_port, service_type, expected_close_date, actual_close_date, lost_reason, competitor_name, source, status, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', s.opportunity_name, s.opportunity_code, mid(s.customer_id), CASE WHEN s.contact_id IS NOT NULL THEN mid(s.contact_id) ELSE NULL END, CASE WHEN s.stage_id IS NOT NULL THEN mid(s.stage_id) ELSE NULL END, 'bf57c426-866c-4d27-9a98-42c471e4df6c', s.expected_revenue, s.currency, s.probability, s.expected_teu, s.trade_lane, s.origin_port, s.destination_port, s.service_type, s.expected_close_date, s.actual_close_date, s.lost_reason, s.competitor_name, s.source, s.status, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_opportunities s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
AND s.customer_id IN (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e');

-- 8. Opportunity Activities (opportunity_id FK, assigned_to → target user)
INSERT INTO scm_opportunity_activities (id, tenant_id, opportunity_id, activity_type, subject, description, activity_date, due_date, completed_at, assigned_to, outcome, status, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', mid(s.opportunity_id), s.activity_type, s.subject, s.description, s.activity_date, s.due_date, s.completed_at, 'bf57c426-866c-4d27-9a98-42c471e4df6c', s.outcome, s.status, s.metadata, s.created_at, s.updated_at
FROM scm_opportunity_activities s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
AND s.opportunity_id IN (SELECT id FROM scm_opportunities WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND customer_id IN (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'));

-- 9. Rate Quotations (customer_id, contact_id, opportunity_id FKs)
INSERT INTO scm_rate_quotations (id, tenant_id, quotation_number, customer_id, contact_id, opportunity_id, sales_rep_id, origin_port, destination_port, trade_lane, service_type, container_type, container_size, estimated_teu, estimated_volume, total_amount, currency, valid_from, valid_to, transit_time_days, free_time_days, incoterm, status, approved_by, approved_at, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', s.quotation_number, mid(s.customer_id), CASE WHEN s.contact_id IS NOT NULL THEN mid(s.contact_id) ELSE NULL END, CASE WHEN s.opportunity_id IS NOT NULL THEN mid(s.opportunity_id) ELSE NULL END, 'bf57c426-866c-4d27-9a98-42c471e4df6c', s.origin_port, s.destination_port, s.trade_lane, s.service_type, s.container_type, s.container_size, s.estimated_teu, s.estimated_volume, s.total_amount, s.currency, s.valid_from, s.valid_to, s.transit_time_days, s.free_time_days, s.incoterm, s.status, s.approved_by, s.approved_at, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_rate_quotations s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
AND s.customer_id IN (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e');

-- 10. Contracts (customer_id, quotation_id FKs)
INSERT INTO scm_contracts (id, tenant_id, contract_number, contract_name, customer_id, quotation_id, contract_type, start_date, end_date, auto_renew, renewal_term_days, minimum_commitment_teu, maximum_commitment_teu, penalty_rate, total_value, currency, payment_terms_days, trade_lane, sales_rep_id, approved_by, approved_at, status, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', s.contract_number, s.contract_name, mid(s.customer_id), CASE WHEN s.quotation_id IS NOT NULL THEN mid(s.quotation_id) ELSE NULL END, s.contract_type, s.start_date, s.end_date, s.auto_renew, s.renewal_term_days, s.minimum_commitment_teu, s.maximum_commitment_teu, s.penalty_rate, s.total_value, s.currency, s.payment_terms_days, s.trade_lane, 'bf57c426-866c-4d27-9a98-42c471e4df6c', s.approved_by, s.approved_at, s.status, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_contracts s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';

-- 11. Sales Targets (sales_rep_id → target user)
INSERT INTO scm_sales_targets (id, tenant_id, sales_rep_id, target_name, target_type, fiscal_year, fiscal_quarter, fiscal_month, revenue_target, teu_target, new_customer_target, revenue_actual, teu_actual, new_customer_actual, currency, trade_lane, region, status, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', 'bf57c426-866c-4d27-9a98-42c471e4df6c', s.target_name, s.target_type, s.fiscal_year, s.fiscal_quarter, s.fiscal_month, s.revenue_target, s.teu_target, s.new_customer_target, s.revenue_actual, s.teu_actual, s.new_customer_actual, s.currency, s.trade_lane, s.region, s.status, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_sales_targets s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';

-- 12. Incentive Rules
INSERT INTO scm_incentive_rules (id, tenant_id, rule_name, rule_code, target_type, threshold_percent, commission_rate, bonus_amount, currency, capped_at, effective_from, effective_to, applies_to, region, trade_lane, is_active, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', s.rule_name, s.rule_code, s.target_type, s.threshold_percent, s.commission_rate, s.bonus_amount, s.currency, s.capped_at, s.effective_from, s.effective_to, s.applies_to, s.region, s.trade_lane, s.is_active, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_incentive_rules s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
ON CONFLICT DO NOTHING;

-- 13. Onboarding Checklists (customer_id FK)
INSERT INTO scm_onboarding_checklists (id, tenant_id, customer_id, task_name, task_category, description, assigned_to, due_date, completed_at, completed_by, sort_order, is_required, document_required, document_url, status, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', mid(s.customer_id), s.task_name, s.task_category, s.description, 'bf57c426-866c-4d27-9a98-42c471e4df6c', s.due_date, s.completed_at, s.completed_by, s.sort_order, s.is_required, s.document_required, s.document_url, s.status, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_onboarding_checklists s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
AND s.customer_id IN (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e');

-- 14. Account Plans (customer_id FK)
INSERT INTO scm_account_plans (id, tenant_id, customer_id, plan_name, fiscal_year, account_manager_id, revenue_target_amount, teu_target, retention_strategy, growth_strategy, risk_assessment, competitive_analysis, key_objectives, swot_analysis, review_date, status, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', mid(s.customer_id), s.plan_name, s.fiscal_year, 'bf57c426-866c-4d27-9a98-42c471e4df6c', s.revenue_target_amount, s.teu_target, s.retention_strategy, s.growth_strategy, s.risk_assessment, s.competitive_analysis, s.key_objectives, s.swot_analysis, s.review_date, s.status, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_account_plans s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
AND s.customer_id IN (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e');

-- 15. Quotation Line Items (quotation_id FK)
INSERT INTO scm_quotation_line_items (id, tenant_id, quotation_id, charge_code, charge_name, charge_type, basis, unit_price, quantity, total_price, currency, container_type, container_size, is_mandatory, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', mid(s.quotation_id), s.charge_code, s.charge_name, s.charge_type, s.basis, s.unit_price, s.quantity, s.total_price, s.currency, s.container_type, s.container_size, s.is_mandatory, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_quotation_line_items s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
AND s.quotation_id IN (SELECT id FROM scm_rate_quotations WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND customer_id IN (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'));

-- 16. Contract Line Items (contract_id FK)
INSERT INTO scm_contract_line_items (id, tenant_id, contract_id, charge_code, charge_name, charge_type, basis, unit_price, currency, container_type, container_size, origin_port, destination_port, valid_from, valid_to, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', mid(s.contract_id), s.charge_code, s.charge_name, s.charge_type, s.basis, s.unit_price, s.currency, s.container_type, s.container_size, s.origin_port, s.destination_port, s.valid_from, s.valid_to, s.notes, s.metadata, s.created_at, s.updated_at
FROM scm_contract_line_items s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
AND s.contract_id IN (SELECT id FROM scm_contracts WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND customer_id IN (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'));

-- 17. AI Agents
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', s.agent_code, s.agent_name, s.agent_type, s.description, s.capabilities, s.model_provider, s.model_id, s.endpoint, s.config, s.max_concurrency, s.timeout_ms, s.retry_policy, s.is_active, s.status, s.created_at, s.updated_at
FROM aaf_agents s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e'
ON CONFLICT DO NOTHING;

-- 18. AI Agent Runs (agent_id FK)
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, orchestration_task_id, run_number, trigger_type, status, priority, input, output, error_message, error_code, tokens_used, cost_estimate, started_at, completed_at, duration_ms, retry_count, parent_run_id, notes, metadata, created_at, updated_at)
SELECT mid(s.id), 'b0861726-81c3-40c5-ac12-e66c5ec9c4bc', mid(s.agent_id), s.orchestration_task_id, s.run_number, s.trigger_type, s.status, s.priority, s.input, s.output, s.error_message, s.error_code, s.tokens_used, s.cost_estimate, s.started_at, s.completed_at, s.duration_ms, s.retry_count, s.parent_run_id, s.notes, s.metadata, s.created_at, s.updated_at
FROM aaf_agent_runs s WHERE s.tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e';

DROP FUNCTION IF EXISTS mid(uuid);

COMMIT;
