-- =====================================================================
-- Sales & CRM AI Agents — Registration + Execution + Data Generation
-- Tenant: 7f709f8d-ca75-4626-85ae-5501ddeea85e (Test Corp 3)
-- User:   268b0e88-c67c-4c55-88e1-e267c66f7302 (admin@demo.cserp.com)
-- =====================================================================

BEGIN;

-- ==========================================================
-- STEP 0: Fix pipeline stages and segments with real names
-- ==========================================================
UPDATE scm_pipeline_stages SET stage_name = 'Lead Qualification', stage_code = 'LEAD-QUAL', probability = 10, color = '#6B7280', sort_order = 0
  WHERE id = 'd9a70cc5-96fd-4d5b-8704-ca9cf48e4b81';
UPDATE scm_pipeline_stages SET stage_name = 'Needs Analysis', stage_code = 'NEEDS-ANLY', probability = 20, color = '#3B82F6', sort_order = 1
  WHERE id = 'd10ea27d-a4b4-4149-bfa4-61e1f4f4b494';
UPDATE scm_pipeline_stages SET stage_name = 'Rate Quotation', stage_code = 'RATE-QUOTE', probability = 40, color = '#8B5CF6', sort_order = 2
  WHERE id = '14d96b5d-b811-4b9a-a222-7fd9e5545d78';
UPDATE scm_pipeline_stages SET stage_name = 'Proposal Sent', stage_code = 'PROPOSAL', probability = 55, color = '#F59E0B', sort_order = 3
  WHERE id = '0e517aa9-a4bd-400e-b1a6-79872b19d9d9';
UPDATE scm_pipeline_stages SET stage_name = 'Negotiation', stage_code = 'NEGOTIATE', probability = 70, color = '#EF4444', sort_order = 4
  WHERE id = 'b13c981a-4c90-4433-be62-ee0e7e06d9a4';
UPDATE scm_pipeline_stages SET stage_name = 'Contract Review', stage_code = 'CONTRACT', probability = 85, color = '#10B981', sort_order = 5
  WHERE id = '9e1d7669-6778-4c09-ae10-80a9b783d4f8';
UPDATE scm_pipeline_stages SET stage_name = 'Won', stage_code = 'WON', probability = 100, color = '#059669', sort_order = 6, is_won = true
  WHERE id = '955b69c6-3aaf-40ab-bbdf-b49f407eba10';
UPDATE scm_pipeline_stages SET stage_name = 'Lost', stage_code = 'LOST', probability = 0, color = '#DC2626', sort_order = 7, is_lost = true
  WHERE id = '8135a646-ae17-4971-b741-a7edd98298b9';

-- Fix customer segments
UPDATE scm_customer_segments SET segment_name = 'Enterprise Shipper', segment_code = 'ENT-SHIP', description = 'Large-volume shippers with 5000+ TEU annually', color = '#7C3AED', sort_order = 0
  WHERE id = 'f5f94ce6-d11c-4bc6-bc4c-fda153613cb5';
UPDATE scm_customer_segments SET segment_name = 'Mid-Market Shipper', segment_code = 'MID-SHIP', description = 'Medium-volume shippers with 1000-5000 TEU annually', color = '#2563EB', sort_order = 1
  WHERE id = 'ce727961-9af2-460d-974d-c2a9fa0bb88b';
UPDATE scm_customer_segments SET segment_name = 'SME Shipper', segment_code = 'SME-SHIP', description = 'Small shippers with under 1000 TEU annually', color = '#0891B2', sort_order = 2
  WHERE id = 'c09fba03-4eb3-4309-afd1-31d43367b2cc';
UPDATE scm_customer_segments SET segment_name = 'Freight Forwarder', segment_code = 'FRT-FWD', description = 'Third-party logistics and freight forwarding companies', color = '#059669', sort_order = 3
  WHERE id = '8448d2a2-5b8e-4771-9a28-e9321916c887';
UPDATE scm_customer_segments SET segment_name = 'NVOCC', segment_code = 'NVOCC', description = 'Non-vessel operating common carriers', color = '#D97706', sort_order = 4
  WHERE id = 'bfe4061d-f3e5-45e2-8c33-edc1540d1058';
UPDATE scm_customer_segments SET segment_name = 'Government Entity', segment_code = 'GOV-ENT', description = 'Government and state-owned enterprises', color = '#DC2626', sort_order = 5
  WHERE id = '1b7b71cb-26c2-4a24-9b4c-d71cf60710c9';
UPDATE scm_customer_segments SET segment_name = 'Oil & Gas', segment_code = 'OIL-GAS', description = 'Oil, gas, and petrochemical shippers', color = '#374151', sort_order = 6
  WHERE id = 'fa44efb8-2e95-452c-8493-7c4531a9b402';
UPDATE scm_customer_segments SET segment_name = 'Strategic Partner', segment_code = 'STRATEGIC', description = 'Long-term alliance partners and VSA participants', color = '#9333EA', sort_order = 7
  WHERE id = '99696c4e-3dbd-48a3-b162-0f160c524e2b';


-- ==========================================================
-- STEP 1: Register 12 new Sales CRM AI Agents
-- ==========================================================

-- Agent 1: Customer Onboarding Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'customer-onboarding', 'Customer Onboarding Agent', 'autonomous',
  'Automates customer onboarding by creating accounts, generating KYC checklists, assigning account managers, and setting up credit terms based on customer profile',
  '["customer_creation","kyc_checklist_generation","credit_limit_recommendation","account_manager_assignment","onboarding_task_creation"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/customer-onboarding/execute',
  '{"connected_modules":["sales-crm"],"automation_level":90,"accuracy_rate":96,"decisions_per_day":50}'::jsonb,
  3, 60000, '{"max_retries":2,"backoff_ms":3000}'::jsonb, true, 'idle'
);

-- Agent 2: Opportunity Pipeline Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'opportunity-pipeline', 'Opportunity Pipeline Agent', 'autonomous',
  'Creates and manages sales opportunities by analyzing customer needs, estimating revenue, recommending service types, and setting pipeline stages for container shipping deals',
  '["opportunity_creation","revenue_estimation","stage_recommendation","win_probability_analysis","competitive_intelligence"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/opportunity-pipeline/execute',
  '{"connected_modules":["sales-crm"],"automation_level":85,"accuracy_rate":92,"decisions_per_day":100}'::jsonb,
  5, 45000, '{"max_retries":2,"backoff_ms":2000}'::jsonb, true, 'idle'
);

-- Agent 3: Lead Qualification Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'lead-qualifier', 'Lead Qualification Agent', 'autonomous',
  'Qualifies incoming leads by scoring based on company size, trade volume potential, industry fit, and geographic alignment with our shipping network',
  '["lead_scoring","industry_analysis","volume_estimation","geographic_fit_analysis","conversion_prediction"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/lead-qualifier/execute',
  '{"connected_modules":["sales-crm"],"automation_level":95,"accuracy_rate":88,"decisions_per_day":200}'::jsonb,
  10, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle'
);

-- Agent 4: Rate Quotation Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0004-4000-8000-000000000004', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'rate-quotation', 'Rate Quotation Agent', 'semi_autonomous',
  'Generates competitive freight rate quotations by analyzing trade lanes, current market rates, customer history, and container availability. Requires human review for large deals.',
  '["rate_calculation","market_rate_analysis","margin_optimization","line_item_generation","validity_period_recommendation"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/rate-quotation/execute',
  '{"connected_modules":["sales-crm","commercial-pricing"],"automation_level":75,"accuracy_rate":94,"decisions_per_day":80}'::jsonb,
  5, 60000, '{"max_retries":2,"backoff_ms":3000}'::jsonb, true, 'idle'
);

-- Agent 5: Contract Generator Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0005-4000-8000-000000000005', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'contract-generator', 'Contract Generator Agent', 'semi_autonomous',
  'Generates shipping contracts from accepted quotations, including volume commitments, penalty clauses, payment terms, and trade lane specifics',
  '["contract_creation","terms_generation","volume_commitment_calculation","penalty_clause_recommendation","renewal_scheduling"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/contract-generator/execute',
  '{"connected_modules":["sales-crm"],"automation_level":70,"accuracy_rate":97,"decisions_per_day":30}'::jsonb,
  2, 90000, '{"max_retries":2,"backoff_ms":5000}'::jsonb, true, 'idle'
);

-- Agent 6: Sales Forecast Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0006-4000-8000-000000000006', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'sales-forecast', 'Sales Forecast Agent', 'autonomous',
  'Forecasts sales revenue by analyzing pipeline data, historical conversion rates, seasonal patterns, and market conditions for container shipping',
  '["revenue_forecasting","pipeline_analysis","seasonal_adjustment","market_trend_analysis","target_tracking"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/sales-forecast/execute',
  '{"connected_modules":["sales-crm","analytics"],"automation_level":95,"accuracy_rate":85,"decisions_per_day":10}'::jsonb,
  1, 120000, '{"max_retries":1,"backoff_ms":5000}'::jsonb, true, 'idle'
);

-- Agent 7: Account Health Monitor Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0007-4000-8000-000000000007', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'account-health', 'Account Health Monitor', 'monitoring',
  'Continuously monitors customer account health by tracking payment patterns, volume trends, complaint frequency, and engagement metrics to flag at-risk accounts',
  '["health_scoring","churn_risk_detection","payment_pattern_analysis","volume_trend_monitoring","engagement_tracking"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/account-health/execute',
  '{"connected_modules":["sales-crm","accounts-receivable"],"automation_level":100,"accuracy_rate":90,"decisions_per_day":500}'::jsonb,
  1, 30000, '{"max_retries":3,"backoff_ms":2000}'::jsonb, true, 'idle'
);

-- Agent 8: Activity Scheduler Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0008-4000-8000-000000000008', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'activity-scheduler', 'Activity Scheduler Agent', 'autonomous',
  'Schedules and creates follow-up activities for opportunities — calls, meetings, demos, site visits — based on deal stage, customer preferences, and sales playbook',
  '["follow_up_scheduling","meeting_suggestion","activity_prioritization","engagement_cadence","reminder_generation"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/activity-scheduler/execute',
  '{"connected_modules":["sales-crm"],"automation_level":90,"accuracy_rate":93,"decisions_per_day":150}'::jsonb,
  5, 20000, '{"max_retries":2,"backoff_ms":1000}'::jsonb, true, 'idle'
);

-- Agent 9: Competitive Intelligence Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0009-4000-8000-000000000009', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'competitive-intel', 'Competitive Intelligence Agent', 'assistive',
  'Provides competitive intelligence by analyzing competitor rates, service offerings, and market positioning to help sales teams win more container shipping deals',
  '["competitor_rate_analysis","market_positioning","win_loss_analysis","service_gap_identification","pricing_recommendation"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/competitive-intel/execute',
  '{"connected_modules":["sales-crm","commercial-pricing"],"automation_level":60,"accuracy_rate":82,"decisions_per_day":40}'::jsonb,
  2, 45000, '{"max_retries":2,"backoff_ms":3000}'::jsonb, true, 'idle'
);

-- Agent 10: Trade Lane Recommender Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0010-4000-8000-000000000010', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'trade-lane-recommender', 'Trade Lane Recommender', 'autonomous',
  'Recommends optimal trade lanes and routing for customer shipments based on origin/destination, transit time requirements, cost optimization, and network coverage',
  '["route_optimization","transit_time_estimation","cost_comparison","transshipment_analysis","schedule_matching"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/trade-lane-recommender/execute',
  '{"connected_modules":["sales-crm","capacity-voyage","liner-trade-route"],"automation_level":85,"accuracy_rate":91,"decisions_per_day":120}'::jsonb,
  5, 30000, '{"max_retries":2,"backoff_ms":2000}'::jsonb, true, 'idle'
);

-- Agent 11: Sales Incentive Calculator Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0011-4000-8000-000000000011', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'incentive-calculator', 'Sales Incentive Calculator', 'autonomous',
  'Calculates sales team commissions and incentives based on achieved targets, deal values, and configured incentive rules. Tracks performance against quarterly and annual targets.',
  '["commission_calculation","target_tracking","bonus_computation","performance_ranking","payout_scheduling"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/incentive-calculator/execute',
  '{"connected_modules":["sales-crm","hr-payroll"],"automation_level":95,"accuracy_rate":99,"decisions_per_day":20}'::jsonb,
  1, 60000, '{"max_retries":2,"backoff_ms":3000}'::jsonb, true, 'idle'
);

-- Agent 12: Customer 360 Enrichment Agent
INSERT INTO aaf_agents (id, tenant_id, agent_code, agent_name, agent_type, description, capabilities, model_provider, model_id, endpoint, config, max_concurrency, timeout_ms, retry_policy, is_active, status)
VALUES (
  'a1000001-0012-4000-8000-000000000012', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'customer-360', 'Customer 360 Enrichment Agent', 'autonomous',
  'Enriches customer profiles with shipping volume history, payment behavior, booking patterns, preferred trade lanes, and relationship health score for complete 360-degree view',
  '["profile_enrichment","volume_analysis","payment_behavior_scoring","booking_pattern_detection","relationship_scoring"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai-agent-framework/agents/customer-360/execute',
  '{"connected_modules":["sales-crm","bookings","accounts-receivable"],"automation_level":95,"accuracy_rate":93,"decisions_per_day":300}'::jsonb,
  5, 30000, '{"max_retries":3,"backoff_ms":2000}'::jsonb, true, 'idle'
);


-- ==========================================================
-- STEP 2: Create realistic customers via agent runs
-- ==========================================================

-- Agent Run: Customer Onboarding Agent — creates 5 new customers

-- Customer: Emirates Shipping Enterprises
INSERT INTO scm_customers (id, tenant_id, customer_code, company_name, trade_name, customer_type, segment_id, tier, industry, country, city, address, postal_code, phone, email, website, tax_registration_no, credit_limit_amount, credit_currency, payment_terms_days, annual_revenue, employee_count, account_manager_id, status)
VALUES (
  'c2000001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'CUST-011', 'Emirates Shipping Enterprises', 'ESE Logistics', 'shipper',
  'f5f94ce6-d11c-4bc6-bc4c-fda153613cb5', 'platinum', 'Container Shipping', 'AE', 'Dubai',
  'Business Bay Tower, Sheikh Zayed Road', '12345', '+971-4-555-0101', 'info@ese-logistics.ae', 'https://ese-logistics.ae',
  'TRN-100234567890003', 5000000, 'AED', 60, 250000000, 850,
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 'active'
);

-- Customer: Khalifa Port Trading
INSERT INTO scm_customers (id, tenant_id, customer_code, company_name, trade_name, customer_type, segment_id, tier, industry, country, city, address, postal_code, phone, email, website, tax_registration_no, credit_limit_amount, credit_currency, payment_terms_days, annual_revenue, employee_count, account_manager_id, status)
VALUES (
  'c2000001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'CUST-012', 'Khalifa Port Trading Co.', 'KPT', 'freight_forwarder',
  '8448d2a2-5b8e-4771-9a28-e9321916c887', 'gold', 'Freight Forwarding', 'AE', 'Abu Dhabi',
  'Khalifa Industrial Zone', '41000', '+971-2-555-0202', 'ops@kpt-trading.ae', 'https://kpt-trading.ae',
  'TRN-100234567890004', 2000000, 'AED', 45, 80000000, 320,
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 'active'
);

-- Customer: Mumbai Container Lines
INSERT INTO scm_customers (id, tenant_id, customer_code, company_name, trade_name, customer_type, segment_id, tier, industry, country, city, address, postal_code, phone, email, website, tax_registration_no, credit_limit_amount, credit_currency, payment_terms_days, annual_revenue, employee_count, account_manager_id, status)
VALUES (
  'c2000001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'CUST-013', 'Mumbai Container Lines Pvt Ltd', 'MCL', 'nvocc',
  'bfe4061d-f3e5-45e2-8c33-edc1540d1058', 'gold', 'NVOCC Operations', 'IN', 'Mumbai',
  'Nariman Point, Marine Drive', '400021', '+91-22-5555-0303', 'bookings@mcl-india.com', 'https://mcl-india.com',
  'GSTIN-27AABCM1234F1Z5', 3000000, 'INR', 30, 120000000, 450,
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 'active'
);

-- Customer: Doha Petrochemicals
INSERT INTO scm_customers (id, tenant_id, customer_code, company_name, trade_name, customer_type, segment_id, tier, industry, country, city, address, postal_code, phone, email, website, tax_registration_no, credit_limit_amount, credit_currency, payment_terms_days, annual_revenue, employee_count, account_manager_id, status)
VALUES (
  'c2000001-0004-4000-8000-000000000004', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'CUST-014', 'Doha Petrochemicals QSC', 'DPC', 'shipper',
  'fa44efb8-2e95-452c-8493-7c4531a9b402', 'platinum', 'Oil & Gas', 'QA', 'Doha',
  'West Bay Financial District, Tower 3', '22100', '+974-4455-0404', 'logistics@doha-petrochem.qa', 'https://doha-petrochem.qa',
  'QA-TIN-000567890', 10000000, 'QAR', 90, 500000000, 2100,
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 'active'
);

-- Customer: Riyadh Global Freight
INSERT INTO scm_customers (id, tenant_id, customer_code, company_name, trade_name, customer_type, segment_id, tier, industry, country, city, address, postal_code, phone, email, website, tax_registration_no, credit_limit_amount, credit_currency, payment_terms_days, annual_revenue, employee_count, account_manager_id, status)
VALUES (
  'c2000001-0005-4000-8000-000000000005', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'CUST-015', 'Riyadh Global Freight LLC', 'RGF', 'freight_forwarder',
  '8448d2a2-5b8e-4771-9a28-e9321916c887', 'silver', 'Freight Forwarding', 'SA', 'Riyadh',
  'King Fahd Road, Al Olaya District', '11564', '+966-11-555-0505', 'info@rgf-logistics.sa', 'https://rgf-logistics.sa',
  'SA-VAT-310234567890', 1000000, 'SAR', 30, 35000000, 180,
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 'active'
);

-- Agent Run record for Customer Onboarding
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0001-4000-8000-000000000001', 'RUN-CO-2026-001', 'api', 'completed', 'normal',
  '{"task":"onboard_new_customers","source":"bulk_import","count":5,"regions":["AE","IN","QA","SA"]}'::jsonb,
  '{"customers_created":5,"customer_ids":["c2000001-0001-4000-8000-000000000001","c2000001-0002-4000-8000-000000000002","c2000001-0003-4000-8000-000000000003","c2000001-0004-4000-8000-000000000004","c2000001-0005-4000-8000-000000000005"],"contacts_created":10,"onboarding_tasks_created":25,"credit_assessments_completed":5,"summary":"Successfully onboarded 5 new customers across UAE, India, Qatar, and Saudi Arabia. All KYC checklists generated and credit limits assessed."}'::jsonb,
  4250, 1, NOW() - interval '2 hours', NOW() - interval '1 hour 55 minutes', 300000
);


-- ==========================================================
-- STEP 3: Create customer contacts
-- ==========================================================

-- Contacts for Emirates Shipping Enterprises
INSERT INTO scm_customer_contacts (id, tenant_id, customer_id, first_name, last_name, job_title, department, email, phone, mobile, is_primary, is_decision_maker)
VALUES
  ('cc300001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0001-4000-8000-000000000001', 'Ahmed', 'Al Maktoum', 'VP Logistics', 'Supply Chain', 'ahmed.m@ese-logistics.ae', '+971-4-555-0111', '+971-50-111-2233', true, true),
  ('cc300001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0001-4000-8000-000000000001', 'Fatima', 'Hassan', 'Shipping Manager', 'Operations', 'fatima.h@ese-logistics.ae', '+971-4-555-0112', '+971-55-222-3344', false, false);

-- Contacts for Khalifa Port Trading
INSERT INTO scm_customer_contacts (id, tenant_id, customer_id, first_name, last_name, job_title, department, email, phone, mobile, is_primary, is_decision_maker)
VALUES
  ('cc300001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0002-4000-8000-000000000002', 'Rashid', 'Al Nahyan', 'Operations Director', 'Operations', 'rashid@kpt-trading.ae', '+971-2-555-0211', '+971-56-333-4455', true, true);

-- Contacts for Mumbai Container Lines
INSERT INTO scm_customer_contacts (id, tenant_id, customer_id, first_name, last_name, job_title, department, email, phone, mobile, is_primary, is_decision_maker)
VALUES
  ('cc300001-0004-4000-8000-000000000004', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0003-4000-8000-000000000003', 'Priya', 'Sharma', 'Head of Freight', 'Freight', 'priya.sharma@mcl-india.com', '+91-22-5555-0311', '+91-98765-43210', true, true),
  ('cc300001-0005-4000-8000-000000000005', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0003-4000-8000-000000000003', 'Rajesh', 'Patel', 'Commercial Manager', 'Commercial', 'rajesh.p@mcl-india.com', '+91-22-5555-0312', '+91-98765-43211', false, true);

-- Contacts for Doha Petrochemicals
INSERT INTO scm_customer_contacts (id, tenant_id, customer_id, first_name, last_name, job_title, department, email, phone, mobile, is_primary, is_decision_maker)
VALUES
  ('cc300001-0006-4000-8000-000000000006', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0004-4000-8000-000000000004', 'Khalid', 'Al Thani', 'Chief Supply Chain Officer', 'Supply Chain', 'khalid.t@doha-petrochem.qa', '+974-4455-0411', '+974-5566-7788', true, true);

-- Contacts for Riyadh Global Freight
INSERT INTO scm_customer_contacts (id, tenant_id, customer_id, first_name, last_name, job_title, department, email, phone, mobile, is_primary, is_decision_maker)
VALUES
  ('cc300001-0007-4000-8000-000000000007', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0005-4000-8000-000000000005', 'Mohammed', 'Al Saud', 'General Manager', 'Management', 'mohammed@rgf-logistics.sa', '+966-11-555-0511', '+966-50-111-2233', true, true),
  ('cc300001-0008-4000-8000-000000000008', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0005-4000-8000-000000000005', 'Sara', 'Al Qahtani', 'Booking Coordinator', 'Operations', 'sara.q@rgf-logistics.sa', '+966-11-555-0512', '+966-55-222-3344', false, false);


-- ==========================================================
-- STEP 4: Create leads via Lead Qualification Agent
-- ==========================================================

INSERT INTO scm_leads (id, tenant_id, company_name, contact_name, contact_email, contact_phone, job_title, country, city, industry, estimated_teu, estimated_revenue, trade_lane, source, assigned_to, qualification_score, status, notes)
VALUES
  ('b4000001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Sharjah Steel Industries', 'Omar Khalil', 'omar@sharjah-steel.ae', '+971-6-555-0601', 'Procurement Manager', 'AE', 'Sharjah', 'Steel Manufacturing', 3500, 45000000, 'AG-ECSA', 'trade_show', '268b0e88-c67c-4c55-88e1-e267c66f7302', 82, 'qualified', 'Met at Breakbulk Middle East 2026. High volume steel coil exporter to East Africa.'),
  ('b4000001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Chennai Textiles Export Corp', 'Ananya Rao', 'ananya@chennai-tex.in', '+91-44-5555-0702', 'Export Director', 'IN', 'Chennai', 'Textiles', 1200, 18000000, 'ISC-EUR', 'referral', '268b0e88-c67c-4c55-88e1-e267c66f7302', 75, 'qualified', 'Referred by Mumbai Container Lines. Exports garments to Europe, needs reliable FCL service.'),
  ('b4000001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Oman Cement Company', 'Yusuf Al Balushi', 'yusuf@omancement.om', '+968-2444-0803', 'Logistics Head', 'OM', 'Muscat', 'Building Materials', 5000, 30000000, 'AG-SEA', 'cold_call', '268b0e88-c67c-4c55-88e1-e267c66f7302', 68, 'contacted', 'Major cement exporter to SE Asia. Currently using MSC. Exploring alternatives due to rate increases.'),
  ('b4000001-0004-4000-8000-000000000004', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Bahrain Aluminium (ALBA)', 'Hassan Al Khalifa', 'hassan@alba.bh', '+973-1777-0904', 'VP Supply Chain', 'BH', 'Manama', 'Aluminium Smelting', 8000, 120000000, 'AG-FE', 'website', '268b0e88-c67c-4c55-88e1-e267c66f7302', 91, 'qualified', 'One of the largest aluminium smelters globally. Massive FCL + breakbulk potential to Far East markets.'),
  ('b4000001-0005-4000-8000-000000000005', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Jeddah Food Imports LLC', 'Layla Mansour', 'layla@jeddah-foods.sa', '+966-12-555-1005', 'Import Manager', 'SA', 'Jeddah', 'Food & Beverage', 2000, 25000000, 'SEA-AG', 'email_campaign', '268b0e88-c67c-4c55-88e1-e267c66f7302', 73, 'new', 'Reefer cargo specialist. Imports frozen food from Thailand and Vietnam. Needs reliable cold chain.'),
  ('b4000001-0006-4000-8000-000000000006', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Kochi Spice Exporters', 'Deepak Menon', 'deepak@kochi-spice.in', '+91-484-555-1106', 'Managing Director', 'IN', 'Kochi', 'Spices & Agricultural', 800, 12000000, 'ISC-EUR', 'partner', '268b0e88-c67c-4c55-88e1-e267c66f7302', 65, 'contacted', 'Specialty spice exporter to Europe. Needs temperature-controlled FCL for cardamom and pepper.'),
  ('b4000001-0007-4000-8000-000000000007', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Kuwait Petrochemical Industries', 'Nasser Al Sabah', 'nasser@kpi-kuwait.kw', '+965-2222-1207', 'Logistics Director', 'KW', 'Kuwait City', 'Petrochemicals', 6000, 95000000, 'AG-FE', 'trade_show', '268b0e88-c67c-4c55-88e1-e267c66f7302', 88, 'qualified', 'ISO tank + FCL demand for chemical exports. Requires DG-certified vessels.');

-- Agent Run: Lead Qualification Agent
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0003-4000-8000-000000000003', 'RUN-LQ-2026-001', 'api', 'completed', 'normal',
  '{"task":"qualify_new_leads","batch_size":7,"scoring_criteria":["company_size","trade_volume","industry_fit","geographic_alignment","competitor_vulnerability"]}'::jsonb,
  '{"leads_scored":7,"qualified":4,"contacted":2,"new":1,"average_score":77.4,"high_value_leads":["l4000001-0004-4000-8000-000000000004","l4000001-0007-4000-8000-000000000007"],"recommended_actions":{"immediate_followup":["Bahrain Aluminium","Kuwait Petrochemical"],"nurture_campaign":["Jeddah Food Imports","Kochi Spice Exporters"]}}'::jsonb,
  2800, 1, NOW() - interval '1 hour 50 minutes', NOW() - interval '1 hour 47 minutes', 180000
);


-- ==========================================================
-- STEP 5: Create opportunities via Opportunity Pipeline Agent
-- ==========================================================

-- Opportunity 1: ESE — Dubai to Rotterdam FCL Contract
INSERT INTO scm_opportunities (id, tenant_id, opportunity_name, opportunity_code, customer_id, contact_id, stage_id, owner_id, expected_revenue, currency, probability, expected_teu, trade_lane, origin_port, destination_port, service_type, expected_close_date, source, status, notes)
VALUES (
  'd5000001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'ESE — Dubai to Rotterdam FCL Annual Contract', 'OPP-2026-011',
  'c2000001-0001-4000-8000-000000000001', 'cc300001-0001-4000-8000-000000000001',
  'b13c981a-4c90-4433-be62-ee0e7e06d9a4', '268b0e88-c67c-4c55-88e1-e267c66f7302',
  12000000, 'USD', 70, 4800, 'AG-EUR', 'AEJEA', 'NLRTM', 'fcl',
  '2026-04-15T00:00:00Z', 'existing_customer', 'open',
  'Annual FCL contract renewal. Customer wants rate lock for 12 months. Competitor (Hapag-Lloyd) offering 5% discount. Need to match or add value-add services.'
);

-- Opportunity 2: MCL — India West Coast to Middle East NVOCC
INSERT INTO scm_opportunities (id, tenant_id, opportunity_name, opportunity_code, customer_id, contact_id, stage_id, owner_id, expected_revenue, currency, probability, expected_teu, trade_lane, origin_port, destination_port, service_type, expected_close_date, source, status, notes)
VALUES (
  'd5000001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'MCL — JNPT to Jebel Ali Weekly NVOCC Slots', 'OPP-2026-012',
  'c2000001-0003-4000-8000-000000000003', 'cc300001-0004-4000-8000-000000000004',
  '14d96b5d-b811-4b9a-a222-7fd9e5545d78', '268b0e88-c67c-4c55-88e1-e267c66f7302',
  5500000, 'USD', 40, 2200, 'ISC-AG', 'INNSA', 'AEJEA', 'fcl',
  '2026-05-01T00:00:00Z', 'existing_customer', 'open',
  'NVOCC requesting guaranteed weekly slot allocation of 50 TEU on JNPT-JEA service. Volume commitment for 12 months.'
);

-- Opportunity 3: DPC — Qatar LNG Equipment Breakbulk
INSERT INTO scm_opportunities (id, tenant_id, opportunity_name, opportunity_code, customer_id, contact_id, stage_id, owner_id, expected_revenue, currency, probability, expected_teu, trade_lane, origin_port, destination_port, service_type, expected_close_date, source, status, notes)
VALUES (
  'd5000001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'DPC — Ras Laffan to Ulsan Project Cargo', 'OPP-2026-013',
  'c2000001-0004-4000-8000-000000000004', 'cc300001-0006-4000-8000-000000000006',
  '0e517aa9-a4bd-400e-b1a6-79872b19d9d9', '268b0e88-c67c-4c55-88e1-e267c66f7302',
  25000000, 'USD', 55, 800, 'AG-FE', 'QAMES', 'KRUSN', 'breakbulk',
  '2026-06-30T00:00:00Z', 'existing_customer', 'open',
  'Project cargo for new LNG processing plant. 15 shipments of oversized equipment. Needs specialized flat racks and heavy-lift cranes.'
);

-- Opportunity 4: KPT — Abu Dhabi to Singapore Transshipment
INSERT INTO scm_opportunities (id, tenant_id, opportunity_name, opportunity_code, customer_id, contact_id, stage_id, owner_id, expected_revenue, currency, probability, expected_teu, trade_lane, origin_port, destination_port, service_type, expected_close_date, source, status, notes)
VALUES (
  'd5000001-0004-4000-8000-000000000004', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'KPT — Khalifa Port to Singapore Hub FCL', 'OPP-2026-014',
  'c2000001-0002-4000-8000-000000000002', 'cc300001-0003-4000-8000-000000000003',
  '9e1d7669-6778-4c09-ae10-80a9b783d4f8', '268b0e88-c67c-4c55-88e1-e267c66f7302',
  8000000, 'USD', 85, 3200, 'AG-SEA', 'AEKHL', 'SGSIN', 'fcl',
  '2026-03-31T00:00:00Z', 'existing_customer', 'open',
  'Volume commitment for transshipment cargo via Singapore hub. Contract review stage — legal reviewing terms. High probability close.'
);

-- Opportunity 5: RGF — Riyadh to Dammam Inland + Sea Multimodal
INSERT INTO scm_opportunities (id, tenant_id, opportunity_name, opportunity_code, customer_id, contact_id, stage_id, owner_id, expected_revenue, currency, probability, expected_teu, trade_lane, origin_port, destination_port, service_type, expected_close_date, source, status, notes)
VALUES (
  'd5000001-0005-4000-8000-000000000005', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'RGF — Saudi ICD to Dammam FCL Multimodal', 'OPP-2026-015',
  'c2000001-0005-4000-8000-000000000005', 'cc300001-0007-4000-8000-000000000007',
  'd10ea27d-a4b4-4149-bfa4-61e1f4f4b494', '268b0e88-c67c-4c55-88e1-e267c66f7302',
  3500000, 'USD', 20, 1400, 'AG-ISC', 'SADMM', 'INMAA', 'fcl',
  '2026-07-15T00:00:00Z', 'existing_customer', 'open',
  'Inland transport from Riyadh ICD to Dammam port + ocean to India. Needs door-to-port solution with customs clearance.'
);

-- Agent Run: Opportunity Pipeline Agent
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0002-4000-8000-000000000002', 'RUN-OP-2026-001', 'api', 'completed', 'normal',
  '{"task":"create_opportunities","customer_ids":["c2000001-0001","c2000001-0002","c2000001-0003","c2000001-0004","c2000001-0005"],"analyze_trade_lanes":true,"estimate_revenue":true}'::jsonb,
  '{"opportunities_created":5,"total_pipeline_value":54000000,"currency":"USD","total_expected_teu":12400,"stages":{"needs_analysis":1,"rate_quotation":1,"proposal_sent":1,"negotiation":1,"contract_review":1},"weighted_pipeline":30350000,"summary":"Created 5 opportunities worth $54M across AG-EUR, ISC-AG, AG-FE, AG-SEA, AG-ISC trade lanes. Weighted pipeline value $30.35M."}'::jsonb,
  3600, 1, NOW() - interval '1 hour 45 minutes', NOW() - interval '1 hour 41 minutes', 240000
);


-- ==========================================================
-- STEP 6: Create activities via Activity Scheduler Agent
-- ==========================================================

INSERT INTO scm_opportunity_activities (id, tenant_id, opportunity_id, activity_type, subject, description, activity_date, due_date, assigned_to, outcome, status)
VALUES
  ('da600001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'd5000001-0001-4000-8000-000000000001', 'meeting', 'Rate Negotiation Meeting with ESE VP', 'In-person meeting with Ahmed Al Maktoum at ESE HQ to discuss annual contract renewal and rate competitiveness vs Hapag-Lloyd.', '2026-03-10T09:00:00Z', '2026-03-10T09:00:00Z', '268b0e88-c67c-4c55-88e1-e267c66f7302', 'positive', 'completed'),
  ('da600001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'd5000001-0001-4000-8000-000000000001', 'proposal', 'Send Revised Rate Proposal to ESE', 'Prepare and send revised FCL rates for AEJEA-NLRTM with 3% loyalty discount and priority loading guarantee.', '2026-03-12T14:00:00Z', '2026-03-14T00:00:00Z', '268b0e88-c67c-4c55-88e1-e267c66f7302', NULL, 'planned'),
  ('da600001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'd5000001-0002-4000-8000-000000000002', 'call', 'Discovery Call with MCL — Weekly Slot Requirements', 'Discuss MCL weekly TEU requirements for JNPT-JEA service, equipment availability, and slot guarantee terms.', '2026-03-08T11:00:00Z', '2026-03-08T11:00:00Z', '268b0e88-c67c-4c55-88e1-e267c66f7302', 'interested', 'completed'),
  ('da600001-0004-4000-8000-000000000004', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'd5000001-0003-4000-8000-000000000003', 'site_visit', 'Site Survey at Ras Laffan for Project Cargo', 'Visit Ras Laffan industrial area to assess cargo dimensions, lifting requirements, and port handling capabilities for LNG equipment.', '2026-03-20T08:00:00Z', '2026-03-22T00:00:00Z', '268b0e88-c67c-4c55-88e1-e267c66f7302', NULL, 'planned'),
  ('da600001-0005-4000-8000-000000000005', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'd5000001-0004-4000-8000-000000000004', 'follow_up', 'Contract Terms Follow-up with KPT Legal', 'Follow up with Rashid on legal review status of transshipment agreement. Expected response by end of week.', '2026-03-07T10:00:00Z', '2026-03-09T00:00:00Z', '268b0e88-c67c-4c55-88e1-e267c66f7302', 'pending', 'planned'),
  ('da600001-0006-4000-8000-000000000006', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'd5000001-0005-4000-8000-000000000005', 'demo', 'Multimodal Solution Demo for RGF', 'Present end-to-end door-to-port solution including ICD pickup, customs clearance, and ocean freight to India.', '2026-03-15T13:00:00Z', '2026-03-15T13:00:00Z', '268b0e88-c67c-4c55-88e1-e267c66f7302', NULL, 'planned'),
  ('da600001-0007-4000-8000-000000000007', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'd5000001-0002-4000-8000-000000000002', 'email', 'Send MCL Rate Sheet for ISC-AG Service', 'Email rate sheet with special NVOCC pricing for JNPT-JEA, INMUN-AEJEA routes, including volume-based discounts.', '2026-03-09T08:00:00Z', '2026-03-09T17:00:00Z', '268b0e88-c67c-4c55-88e1-e267c66f7302', 'sent', 'completed'),
  ('da600001-0008-4000-8000-000000000008', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'd5000001-0003-4000-8000-000000000003', 'meeting', 'Technical Meeting — DPC Project Cargo Specs', 'Meeting with DPC engineering team to review equipment dimensions, weight specifications, and shipping schedules.', '2026-03-18T10:00:00Z', '2026-03-18T10:00:00Z', '268b0e88-c67c-4c55-88e1-e267c66f7302', NULL, 'planned');

-- Agent Run: Activity Scheduler
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0004-4000-8000-000000000004', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0008-4000-8000-000000000008', 'RUN-AS-2026-001', 'api', 'completed', 'normal',
  '{"task":"schedule_activities","opportunity_ids":["o5000001-0001","o5000001-0002","o5000001-0003","o5000001-0004","o5000001-0005"],"playbook":"enterprise_shipping"}'::jsonb,
  '{"activities_created":8,"by_type":{"meeting":2,"call":1,"email":1,"proposal":1,"site_visit":1,"follow_up":1,"demo":1},"completed":3,"planned":5,"next_action_dates":["2026-03-10","2026-03-12","2026-03-15","2026-03-18","2026-03-20"]}'::jsonb,
  1800, 1, NOW() - interval '1 hour 40 minutes', NOW() - interval '1 hour 38 minutes', 120000
);


-- ==========================================================
-- STEP 7: Create rate quotations via Rate Quotation Agent
-- ==========================================================

-- Quotation 1: ESE Dubai-Rotterdam FCL
INSERT INTO scm_rate_quotations (id, tenant_id, quotation_number, customer_id, contact_id, opportunity_id, sales_rep_id, origin_port, destination_port, trade_lane, service_type, container_type, container_size, estimated_teu, total_amount, currency, valid_from, valid_to, transit_time_days, free_time_days, incoterm, status, notes)
VALUES (
  'a7000001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'QT-2026-0101', 'c2000001-0001-4000-8000-000000000001', 'cc300001-0001-4000-8000-000000000001', 'd5000001-0001-4000-8000-000000000001',
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 'AEJEA', 'NLRTM', 'AG-EUR', 'fcl', 'DRY', '40HC',
  4800, 7200000, 'USD', '2026-04-01T00:00:00Z', '2027-03-31T00:00:00Z', 18, 14, 'CIF', 'submitted',
  'Annual contract quotation — 400 TEU/month, 40HC dry containers. Rate includes BAF and CAF. Priority loading guarantee included.'
);

-- Line items for Quotation 1
INSERT INTO scm_quotation_line_items (id, tenant_id, quotation_id, charge_code, charge_name, charge_type, basis, unit_price, quantity, total_price, currency, container_type, container_size, is_mandatory)
VALUES
  ('ab700001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'a7000001-0001-4000-8000-000000000001', 'OF-40HC', 'Ocean Freight 40HC', 'ocean_freight', 'per_container', 1350, 4800, 6480000, 'USD', 'DRY', '40HC', true),
  ('ab700001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'a7000001-0001-4000-8000-000000000001', 'THC-OR', 'Terminal Handling (Origin)', 'thc', 'per_container', 85, 4800, 408000, 'USD', 'DRY', '40HC', true),
  ('ab700001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'a7000001-0001-4000-8000-000000000001', 'DOC-FEE', 'Documentation Fee', 'documentation', 'per_bl', 65, 4800, 312000, 'USD', NULL, NULL, true);

-- Quotation 2: MCL JNPT-JEA NVOCC
INSERT INTO scm_rate_quotations (id, tenant_id, quotation_number, customer_id, contact_id, opportunity_id, sales_rep_id, origin_port, destination_port, trade_lane, service_type, container_type, container_size, estimated_teu, total_amount, currency, valid_from, valid_to, transit_time_days, free_time_days, incoterm, status, notes)
VALUES (
  'a7000001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'QT-2026-0102', 'c2000001-0003-4000-8000-000000000003', 'cc300001-0004-4000-8000-000000000004', 'd5000001-0002-4000-8000-000000000002',
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 'INNSA', 'AEJEA', 'ISC-AG', 'fcl', 'DRY', '20GP',
  2200, 3300000, 'USD', '2026-05-01T00:00:00Z', '2027-04-30T00:00:00Z', 5, 7, 'FOB', 'draft',
  'NVOCC slot allocation quotation — 50 TEU/week guaranteed. Special NVOCC rates with volume discount tiers.'
);

-- Quotation 3: DPC Project Cargo
INSERT INTO scm_rate_quotations (id, tenant_id, quotation_number, customer_id, contact_id, opportunity_id, sales_rep_id, origin_port, destination_port, trade_lane, service_type, container_type, container_size, estimated_teu, total_amount, currency, valid_from, valid_to, transit_time_days, free_time_days, incoterm, status, notes)
VALUES (
  'a7000001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'QT-2026-0103', 'c2000001-0004-4000-8000-000000000004', 'cc300001-0006-4000-8000-000000000006', 'd5000001-0003-4000-8000-000000000003',
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 'QAMES', 'KRUSN', 'AG-FE', 'breakbulk', 'FLAT', 'FR40',
  800, 18750000, 'USD', '2026-07-01T00:00:00Z', '2027-06-30T00:00:00Z', 22, 21, 'CIF', 'draft',
  'Project cargo quotation for 15 shipments of LNG equipment. Includes heavy-lift surcharge, flat rack rentals, and lashing/securing.'
);

-- Agent Run: Rate Quotation Agent
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0005-4000-8000-000000000005', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0004-4000-8000-000000000004', 'RUN-RQ-2026-001', 'api', 'completed', 'normal',
  '{"task":"generate_quotations","opportunities":["o5000001-0001","o5000001-0002","o5000001-0003"],"include_line_items":true,"market_rate_check":true}'::jsonb,
  '{"quotations_generated":3,"total_quoted_value":29250000,"currency":"USD","line_items_created":3,"market_competitiveness":{"QT-2026-0101":"3% below market","QT-2026-0102":"at market","QT-2026-0103":"5% premium (project cargo)"},"margin_analysis":{"average_margin_percent":18.5,"lowest_margin":"QT-2026-0102 at 12%","highest_margin":"QT-2026-0103 at 25%"}}'::jsonb,
  5200, 1, NOW() - interval '1 hour 35 minutes', NOW() - interval '1 hour 30 minutes', 300000
);


-- ==========================================================
-- STEP 8: Create contracts via Contract Generator Agent
-- ==========================================================

-- Contract 1: ESE Annual FCL Contract (from won opportunity)
INSERT INTO scm_contracts (id, tenant_id, contract_number, contract_name, customer_id, quotation_id, contract_type, start_date, end_date, auto_renew, renewal_term_days, minimum_commitment_teu, maximum_commitment_teu, penalty_rate, total_value, currency, payment_terms_days, trade_lane, sales_rep_id, status, notes)
VALUES (
  'c8800001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'CON-2026-0051', 'ESE Annual FCL — AG-EUR Service', 'c2000001-0001-4000-8000-000000000001', 'a7000001-0001-4000-8000-000000000001',
  'volume_commitment', '2026-04-01T00:00:00Z', '2027-03-31T00:00:00Z', true, 365,
  3600, 5400, 5, 7200000, 'USD', 60, 'AG-EUR',
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 'active',
  'Annual volume commitment contract with ESE. Min 300 TEU/month, max 450 TEU/month. 5% penalty for shortfall below minimum. Auto-renews unless 60-day notice.'
);

-- Contract line items
INSERT INTO scm_contract_line_items (id, tenant_id, contract_id, charge_code, charge_name, charge_type, basis, unit_price, currency, container_type, container_size, origin_port, destination_port, valid_from, valid_to)
VALUES
  ('cb180001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c8800001-0001-4000-8000-000000000001', 'OF-40HC', 'Ocean Freight 40HC', 'ocean_freight', 'per_container', 1350, 'USD', 'DRY', '40HC', 'AEJEA', 'NLRTM', '2026-04-01T00:00:00Z', '2027-03-31T00:00:00Z'),
  ('cb180001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c8800001-0001-4000-8000-000000000001', 'THC-OR', 'Terminal Handling (Origin)', 'thc', 'per_container', 85, 'USD', 'DRY', '40HC', 'AEJEA', NULL, '2026-04-01T00:00:00Z', '2027-03-31T00:00:00Z'),
  ('cb180001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c8800001-0001-4000-8000-000000000001', 'DOC-FEE', 'Documentation Fee', 'documentation', 'per_bl', 65, 'USD', NULL, NULL, NULL, NULL, '2026-04-01T00:00:00Z', '2027-03-31T00:00:00Z');

-- Contract 2: KPT Transshipment Agreement
INSERT INTO scm_contracts (id, tenant_id, contract_number, contract_name, customer_id, contract_type, start_date, end_date, auto_renew, minimum_commitment_teu, total_value, currency, payment_terms_days, trade_lane, sales_rep_id, status, notes)
VALUES (
  'c8800001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'CON-2026-0052', 'KPT Transshipment — AG-SEA via Singapore', 'c2000001-0002-4000-8000-000000000002',
  'volume_commitment', '2026-04-01T00:00:00Z', '2027-03-31T00:00:00Z', false,
  2400, 8000000, 'USD', 45, 'AG-SEA',
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 'draft',
  'Transshipment volume commitment via Singapore hub. Min 200 TEU/month. Includes priority berthing at Singapore terminal.'
);

-- Agent Run: Contract Generator
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0006-4000-8000-000000000006', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0005-4000-8000-000000000005', 'RUN-CG-2026-001', 'api', 'completed', 'normal',
  '{"task":"generate_contracts","quotation_ids":["q7000001-0001"],"opportunity_ids":["o5000001-0004"],"include_line_items":true}'::jsonb,
  '{"contracts_created":2,"total_contract_value":15200000,"line_items_created":3,"contract_types":{"volume_commitment":2},"auto_renewal":1,"summary":"Generated 2 contracts: ESE AG-EUR annual ($7.2M, active) and KPT transshipment ($8M, draft pending legal review)."}'::jsonb,
  4100, 1, NOW() - interval '1 hour 25 minutes', NOW() - interval '1 hour 20 minutes', 300000
);


-- ==========================================================
-- STEP 9: Create campaigns via Campaign Optimizer Agent
-- ==========================================================

INSERT INTO scm_campaigns (id, tenant_id, campaign_name, campaign_code, campaign_type, description, target_audience, channel, budget_amount, spent_amount, currency, start_date, end_date, leads_generated, conversions, region, trade_lane, status, notes)
VALUES
  ('c9900001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Breakbulk Middle East 2026', 'CAMP-BBK-2026', 'trade_show', 'Exhibition booth and networking at the largest breakbulk and project cargo event in the Middle East. Focus on project cargo and heavy-lift services.', 'Project Cargo Shippers, EPC Contractors', 'in-person', 150000, 95000, 'USD', '2026-02-15T00:00:00Z', '2026-02-17T00:00:00Z', 12, 3, 'ME', 'AG-FE', 'completed', 'Generated 12 qualified leads including Sharjah Steel and 2 EPC contractors. ROI tracking in progress.'),
  ('c9900001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'India Subcontinent Rate Launch Q2', 'CAMP-ISC-Q2', 'email', 'Email campaign announcing new competitive rates for ISC-AG and ISC-EUR trade lanes. Targeting existing NVOCC and forwarder customers.', 'NVOCCs, Freight Forwarders', 'email', 5000, 3200, 'USD', '2026-03-01T00:00:00Z', '2026-03-31T00:00:00Z', 8, 1, 'ISC', 'ISC-AG', 'active', 'Open rate: 32%, CTR: 8.5%. 8 leads from campaign, 1 converted to quotation request.'),
  ('c9900001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Cold Chain Solutions Webinar', 'CAMP-COLD-2026', 'webinar', 'Technical webinar showcasing reefer container capabilities, cold chain monitoring IoT, and compliance with food safety regulations.', 'Food Importers, Pharma Shippers, Reefer Cargo', 'virtual', 8000, 0, 'USD', '2026-04-10T00:00:00Z', '2026-04-10T00:00:00Z', 0, 0, 'GCC', 'SEA-AG', 'draft', 'Planned webinar targeting GCC food importers. Registration page not yet live.');

-- Agent Run: Campaign Optimizer
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0007-4000-8000-000000000007', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  '5fe72535-c174-4f43-9316-7efbe9228875', 'RUN-CM-2026-001', 'api', 'completed', 'normal',
  '{"task":"optimize_campaigns","active_campaigns":3,"analyze_roi":true,"suggest_improvements":true}'::jsonb,
  '{"campaigns_analyzed":3,"recommendations":{"CAMP-BBK-2026":{"roi":"3.2x","recommendation":"Follow up with all 12 leads within 72 hours"},"CAMP-ISC-Q2":{"open_rate":"32%","recommendation":"A/B test subject lines for higher CTR"},"CAMP-COLD-2026":{"recommendation":"Partner with food safety authority for credibility"}},"total_leads_generated":20,"conversion_rate":"15%"}'::jsonb,
  2100, 1, NOW() - interval '1 hour 15 minutes', NOW() - interval '1 hour 13 minutes', 120000
);


-- ==========================================================
-- STEP 10: Create sales targets via Sales Forecast Agent
-- ==========================================================

INSERT INTO scm_sales_targets (id, tenant_id, sales_rep_id, target_name, target_type, fiscal_year, fiscal_quarter, revenue_target, teu_target, new_customer_target, revenue_actual, teu_actual, new_customer_actual, currency, trade_lane, region, status, notes)
VALUES
  ('e1100001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e', '268b0e88-c67c-4c55-88e1-e267c66f7302', 'Q1 2026 — Middle East Revenue', 'combined', 2026, 1, 15000000, 6000, 3, 8500000, 3200, 2, 'USD', 'AG-EUR', 'ME', 'active', 'On track for TEU target. Revenue at 57% with one month remaining. Need to close ESE and KPT deals.'),
  ('e1100001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e', '268b0e88-c67c-4c55-88e1-e267c66f7302', 'Q2 2026 — India Expansion', 'revenue', 2026, 2, 8000000, 3500, 5, 0, 0, 0, 'USD', 'ISC-AG', 'ISC', 'active', 'Q2 target focused on India subcontinent trade. MCL opportunity is key anchor deal.'),
  ('e1100001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e', '268b0e88-c67c-4c55-88e1-e267c66f7302', 'FY 2026 — Annual TEU Target', 'teu', 2026, NULL, 50000000, 20000, 15, 3200, 3200, 2, 'USD', NULL, 'ALL', 'active', 'Full year TEU target. 16% achieved in Q1. Need accelerated pipeline conversion in Q2-Q3.');

-- Agent Run: Sales Forecast Agent
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0008-4000-8000-000000000008', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0006-4000-8000-000000000006', 'RUN-SF-2026-001', 'api', 'completed', 'normal',
  '{"task":"forecast_sales","fiscal_year":2026,"include_pipeline_analysis":true,"seasonal_adjustment":true}'::jsonb,
  '{"forecast":{"q1":{"revenue":15000000,"teu":6000,"confidence":0.82},"q2":{"revenue":12000000,"teu":5000,"confidence":0.65},"q3":{"revenue":14000000,"teu":5500,"confidence":0.55},"q4":{"revenue":11000000,"teu":4500,"confidence":0.50}},"annual_forecast":{"total_revenue":52000000,"total_teu":21000},"pipeline_coverage_ratio":2.4,"risk_factors":["Q2 India expansion depends on MCL deal","Project cargo timing uncertain","Competitive pressure on AG-EUR rates"]}'::jsonb,
  3200, 1, NOW() - interval '1 hour 10 minutes', NOW() - interval '1 hour 5 minutes', 300000
);


-- ==========================================================
-- STEP 11: Create incentive rules via Incentive Calculator Agent
-- ==========================================================

INSERT INTO scm_incentive_rules (id, tenant_id, rule_name, rule_code, target_type, threshold_percent, commission_rate, bonus_amount, currency, capped_at, effective_from, effective_to, applies_to, region, is_active, notes)
VALUES
  ('ae110001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Base Revenue Commission', 'INC-REV-BASE', 'revenue', 100, 2, 0, 'USD', 50000, '2026-01-01T00:00:00Z', '2026-12-31T00:00:00Z', 'all', NULL, true, '2% commission on all revenue once 100% of target achieved. Capped at $50K per quarter.'),
  ('ae110001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Overachievement Bonus', 'INC-REV-OVER', 'revenue', 120, 4, 10000, 'USD', 100000, '2026-01-01T00:00:00Z', '2026-12-31T00:00:00Z', 'individual', NULL, true, '4% commission + $10K bonus when exceeding 120% of revenue target. Capped at $100K.'),
  ('ae110001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'New Customer Acquisition Bonus', 'INC-NEWCUST', 'new_customer', 100, 0, 5000, 'USD', 25000, '2026-01-01T00:00:00Z', '2026-12-31T00:00:00Z', 'individual', NULL, true, '$5,000 bonus per new customer acquired once target met. Capped at $25K annually.');

-- Agent Run: Incentive Calculator
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0009-4000-8000-000000000009', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0011-4000-8000-000000000011', 'RUN-IC-2026-001', 'api', 'completed', 'normal',
  '{"task":"calculate_incentives","sales_rep_id":"268b0e88-c67c-4c55-88e1-e267c66f7302","period":"Q1-2026"}'::jsonb,
  '{"rep":"admin@demo.cserp.com","period":"Q1-2026","revenue_actual":8500000,"revenue_target":15000000,"achievement_percent":56.7,"commission_earned":0,"bonus_earned":0,"new_customers":2,"new_customer_target":3,"status":"below_target","recommendation":"Need to close ESE ($7.2M) and KPT ($8M) deals to hit Q1 revenue target"}'::jsonb,
  1500, 1, NOW() - interval '1 hour', NOW() - interval '59 minutes', 60000
);


-- ==========================================================
-- STEP 12: Create onboarding checklists for new customers
-- ==========================================================

-- Onboarding for ESE (customer 1)
INSERT INTO scm_onboarding_checklists (id, tenant_id, customer_id, task_name, task_category, description, assigned_to, due_date, sort_order, is_required, status)
VALUES
  ('db120001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0001-4000-8000-000000000001', 'KYC Document Collection', 'kyc', 'Collect trade license, certificate of incorporation, shareholder details, and authorized signatory list', '268b0e88-c67c-4c55-88e1-e267c66f7302', '2026-03-15T00:00:00Z', 0, true, 'completed'),
  ('db120001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0001-4000-8000-000000000001', 'Credit Assessment', 'credit_check', 'Run D&B credit check and internal credit scoring. Set credit limit based on annual revenue and payment history', '268b0e88-c67c-4c55-88e1-e267c66f7302', '2026-03-20T00:00:00Z', 1, true, 'completed'),
  ('db120001-0003-4000-8000-000000000003', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0001-4000-8000-000000000001', 'Rate Card Setup', 'rate_setup', 'Configure contracted rates in tariff system for AG-EUR trade lane', '268b0e88-c67c-4c55-88e1-e267c66f7302', '2026-03-25T00:00:00Z', 2, true, 'in_progress'),
  ('db120001-0004-4000-8000-000000000004', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0001-4000-8000-000000000001', 'System Access Provisioning', 'system_setup', 'Create customer portal account and configure EDI connectivity for booking and B/L exchange', '268b0e88-c67c-4c55-88e1-e267c66f7302', '2026-03-28T00:00:00Z', 3, true, 'pending'),
  ('db120001-0005-4000-8000-000000000005', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0001-4000-8000-000000000001', 'Operations Training', 'training', 'Train customer operations team on booking portal, track & trace, and B/L amendment procedures', '268b0e88-c67c-4c55-88e1-e267c66f7302', '2026-04-05T00:00:00Z', 4, false, 'pending');

-- Onboarding for Doha Petrochemicals (customer 4)
INSERT INTO scm_onboarding_checklists (id, tenant_id, customer_id, task_name, task_category, description, assigned_to, due_date, sort_order, is_required, status)
VALUES
  ('db120001-0006-4000-8000-000000000006', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0004-4000-8000-000000000004', 'KYC + Sanctions Screening', 'kyc', 'Enhanced KYC for petrochemical shipper. Run OFAC, EU, and UN sanctions screening. Verify beneficial ownership.', '268b0e88-c67c-4c55-88e1-e267c66f7302', '2026-03-18T00:00:00Z', 0, true, 'in_progress'),
  ('db120001-0007-4000-8000-000000000007', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0004-4000-8000-000000000004', 'DG Cargo Certification', 'documentation', 'Verify IMDG code compliance for petrochemical shipments. Collect MSDS for all product lines.', '268b0e88-c67c-4c55-88e1-e267c66f7302', '2026-03-22T00:00:00Z', 1, true, 'pending'),
  ('db120001-0008-4000-8000-000000000008', '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'c2000001-0004-4000-8000-000000000004', 'Credit Assessment (Platinum)', 'credit_check', 'Platinum-tier credit assessment. Verify QSC government backing, set QAR 10M credit limit.', '268b0e88-c67c-4c55-88e1-e267c66f7302', '2026-03-25T00:00:00Z', 2, true, 'pending');


-- ==========================================================
-- STEP 13: Create account plans via Customer 360 Agent
-- ==========================================================

INSERT INTO scm_account_plans (id, tenant_id, customer_id, plan_name, fiscal_year, account_manager_id, revenue_target_amount, teu_target, retention_strategy, growth_strategy, risk_assessment, competitive_analysis, key_objectives, swot_analysis, review_date, status, notes)
VALUES
  ('af130001-0001-4000-8000-000000000001', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'c2000001-0001-4000-8000-000000000001', 'ESE Strategic Account Plan FY2026', 2026,
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 12000000, 4800,
  'Priority loading guarantee + dedicated customer success manager + quarterly business reviews',
  'Cross-sell reefer services for perishable cargo + expand to AG-WCSA trade lane',
  'MEDIUM — Competitor Hapag-Lloyd aggressively pricing AG-EUR. Rate pressure expected in Q3.',
  'Hapag-Lloyd: Lower rates but less reliable schedule. MSC: More capacity but poor customer service. Our advantage: Schedule reliability + digital platform.',
  '{"objectives":["Renew annual contract by Apr 1","Expand to reefer cargo by Q3","Achieve 400 TEU/month average","Introduce EDI integration"]}'::jsonb,
  '{"strengths":["10-year relationship","Schedule reliability","Digital booking platform"],"weaknesses":["Higher rates than competitors","Limited reefer fleet"],"opportunities":["ESE expanding to South America","New warehouse in JAFZA"],"threats":["Hapag-Lloyd rate war","ESE CFO cost-cutting mandate"]}'::jsonb,
  '2026-06-30', 'active',
  'Key strategic account. 10-year relationship. Decision-maker is Ahmed Al Maktoum (VP Logistics). Monthly check-ins required.'),

  ('af130001-0002-4000-8000-000000000002', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'c2000001-0004-4000-8000-000000000004', 'DPC Platinum Account Plan FY2026', 2026,
  '268b0e88-c67c-4c55-88e1-e267c66f7302', 25000000, 800,
  'Dedicated project cargo team + priority vessel space + 24/7 operations hotline',
  'Win LNG project cargo ($25M) + explore regular chemical shipments via ISO tanks',
  'LOW — Government-backed entity with strong financials. Risk is project timeline delays.',
  'No direct competitor for project cargo capability in Qatar. Nearest competitor is BBC Chartering for breakbulk.',
  '{"objectives":["Win Ras Laffan project cargo contract","Set up ISO tank service by Q3","Establish monthly chemical FCL service","Achieve platinum SLA compliance"]}'::jsonb,
  '{"strengths":["Only carrier with heavy-lift capability in Qatar","Government relationship","DG cargo expertise"],"weaknesses":["Limited flat rack inventory","No ISO tank fleet"],"opportunities":["$50B LNG expansion program","New petrochemical plants under construction"],"threats":["Project delays","Environmental regulation changes"]}'::jsonb,
  '2026-09-30', 'active',
  'Highest value account in pipeline. Requires dedicated project cargo coordinator.');

-- Agent Run: Customer 360 Enrichment
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0010-4000-8000-000000000010', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0012-4000-8000-000000000012', 'RUN-C360-2026-001', 'api', 'completed', 'normal',
  '{"task":"enrich_customer_profiles","customer_ids":["c2000001-0001","c2000001-0004"],"include_account_plans":true,"include_swot":true}'::jsonb,
  '{"profiles_enriched":2,"account_plans_created":2,"swot_analyses":2,"health_scores":{"ESE":82,"DPC":95},"revenue_at_risk":0,"growth_potential":37000000,"summary":"Enriched 2 strategic accounts with full 360-degree profiles. ESE health score 82 (rate pressure risk). DPC health score 95 (strong government-backed partner)."}'::jsonb,
  5500, 1, NOW() - interval '55 minutes', NOW() - interval '48 minutes', 420000
);


-- ==========================================================
-- STEP 14: Additional agent runs for remaining agents
-- ==========================================================

-- Agent Run: Account Health Monitor
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0011-4000-8000-000000000011', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0007-4000-8000-000000000007', 'RUN-AH-2026-001', 'scheduled', 'completed', 'normal',
  '{"task":"monitor_account_health","scope":"all_active_customers","check_payments":true,"check_volumes":true,"check_complaints":true}'::jsonb,
  '{"accounts_monitored":15,"health_scores":{"healthy":11,"at_risk":3,"critical":1},"at_risk_accounts":["CUST-005 (volume declining 20% MoM)","CUST-007 (2 overdue invoices)","CUST-009 (complaint escalated)"],"critical_accounts":["CUST-003 (payment 90+ days overdue)"],"recommended_actions":{"immediate":["Contact CUST-003 finance team","Schedule retention call with CUST-005"],"this_week":["Review CUST-007 AR aging","Resolve CUST-009 complaint"]}}'::jsonb,
  2400, 1, NOW() - interval '45 minutes', NOW() - interval '42 minutes', 180000
);

-- Agent Run: Competitive Intelligence
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0012-4000-8000-000000000012', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0009-4000-8000-000000000009', 'RUN-CI-2026-001', 'manual', 'completed', 'normal',
  '{"task":"competitive_analysis","trade_lanes":["AG-EUR","ISC-AG","AG-FE"],"competitors":["Hapag-Lloyd","MSC","CMA-CGM","Maersk"]}'::jsonb,
  '{"analysis":{"AG-EUR":{"our_rate":1350,"market_avg":1420,"hapag":1290,"msc":1380,"our_position":"competitive","recommendation":"Hold rates, emphasize schedule reliability"},"ISC-AG":{"our_rate":850,"market_avg":880,"maersk":820,"cma":870,"our_position":"at market","recommendation":"Offer volume discounts to win NVOCC business"},"AG-FE":{"our_rate":1100,"market_avg":1050,"msc":980,"hapag":1080,"our_position":"above market","recommendation":"Justify premium with transit time advantage"}},"key_insight":"Hapag-Lloyd launching new AG-EUR weekly service in Q2 — expect rate pressure"}'::jsonb,
  3800, 1, NOW() - interval '40 minutes', NOW() - interval '36 minutes', 240000
);

-- Agent Run: Trade Lane Recommender
INSERT INTO aaf_agent_runs (id, tenant_id, agent_id, run_number, trigger_type, status, priority, input, output, tokens_used, cost_estimate, started_at, completed_at, duration_ms)
VALUES (
  'a3000001-0013-4000-8000-000000000013', '7f709f8d-ca75-4626-85ae-5501ddeea85e',
  'a1000001-0010-4000-8000-000000000010', 'RUN-TL-2026-001', 'api', 'completed', 'normal',
  '{"task":"recommend_trade_lanes","customer_id":"c2000001-0005-4000-8000-000000000005","origin":"Riyadh","destinations":["Mumbai","Chennai","Kochi"],"cargo_type":"general","volume":1400}'::jsonb,
  '{"recommendations":[{"route":"Riyadh ICD → Dammam → INMAA","transit_days":12,"cost_per_teu":1100,"transshipments":0,"recommendation":"Direct — fastest and cheapest"},{"route":"Riyadh ICD → Jeddah → INMUN","transit_days":14,"cost_per_teu":950,"transshipments":0,"recommendation":"Alternative — lower cost via Red Sea"},{"route":"Riyadh ICD → Dammam → Colombo → INMAA","transit_days":18,"cost_per_teu":880,"transshipments":1,"recommendation":"Budget — via Colombo hub, lowest cost"}],"best_match":"Direct Dammam-Chennai for speed, Jeddah-Mumbai for cost"}'::jsonb,
  2900, 1, NOW() - interval '35 minutes', NOW() - interval '32 minutes', 180000
);


-- ==========================================================
-- STEP 15: Update agent statuses to reflect activity
-- ==========================================================
UPDATE aaf_agents SET last_active_at = NOW(), status = 'idle' WHERE id IN (
  'a1000001-0001-4000-8000-000000000001',
  'a1000001-0002-4000-8000-000000000002',
  'a1000001-0003-4000-8000-000000000003',
  'a1000001-0004-4000-8000-000000000004',
  'a1000001-0005-4000-8000-000000000005',
  'a1000001-0006-4000-8000-000000000006',
  'a1000001-0007-4000-8000-000000000007',
  'a1000001-0008-4000-8000-000000000008',
  'a1000001-0009-4000-8000-000000000009',
  'a1000001-0010-4000-8000-000000000010',
  'a1000001-0011-4000-8000-000000000011',
  'a1000001-0012-4000-8000-000000000012'
);

-- Also update existing sales-related agents
UPDATE aaf_agents SET last_active_at = NOW() - interval '1 day', status = 'idle' WHERE agent_code IN (
  'lead-scorer', 'customer-segmenter', 'credit-scorer', 'quote-generator',
  'campaign-optimizer', 'churn-predictor', 'contract-compliance'
);

COMMIT;
