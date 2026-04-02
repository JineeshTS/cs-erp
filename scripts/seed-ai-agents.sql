BEGIN;

-- Seed 100 AI Agents for CS ERP
-- Tenant: 7f709f8d-ca75-4626-85ae-5501ddeea85e

INSERT INTO aaf_agents (
  tenant_id, agent_code, agent_name, agent_type, description, capabilities,
  model_provider, model_id, endpoint, config, max_concurrency, timeout_ms,
  retry_policy, is_active, status, last_active_at, notes, metadata
) VALUES

-- ============================================
-- BOOKING & COMMERCIAL (1-12)
-- ============================================
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'rate-optimizer', 'Rate Optimizer Agent', 'autonomous',
  'Dynamic pricing and market rate analysis for competitive freight rates',
  '["market_rate_analysis","dynamic_pricing","competitor_benchmarking","trade_lane_optimization","rate_forecasting"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/rate-optimizer/run',
  '{"connected_modules":["Rate Management","Quotation","Booking"],"automation_level":"full","avg_processing_time_ms":2500,"accuracy_rate":0.96,"decisions_per_day":1200}'::jsonb,
  5, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '12 minutes', 'Core pricing engine', '{"connected_modules":["Rate Management","Quotation","Booking"],"automation_level":"full","accuracy_rate":0.96,"decisions_per_day":1200}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'credit-scorer', 'Credit Scoring Agent', 'autonomous',
  'Customer creditworthiness assessment using payment history and financial data',
  '["credit_risk_scoring","payment_history_analysis","credit_limit_recommendation","financial_ratio_analysis"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/credit-scorer/run',
  '{"connected_modules":["Customer Management","Accounts Receivable","Credit Control"],"automation_level":"full","avg_processing_time_ms":3200,"accuracy_rate":0.94,"decisions_per_day":350}'::jsonb,
  3, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '1 hour', 'Integrated with AR module', '{"connected_modules":["Customer Management","Accounts Receivable","Credit Control"],"automation_level":"full","accuracy_rate":0.94,"decisions_per_day":350}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'booking-validator', 'Booking Validator Agent', 'autonomous',
  'Validates bookings for space availability, equipment, and compliance requirements',
  '["space_validation","equipment_check","compliance_verification","booking_conflict_detection","hazmat_validation"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/booking-validator/run',
  '{"connected_modules":["Booking","Equipment","Vessel Schedule"],"automation_level":"full","avg_processing_time_ms":1800,"accuracy_rate":0.98,"decisions_per_day":2500}'::jsonb,
  8, 15000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '3 minutes', 'High-throughput validation engine', '{"connected_modules":["Booking","Equipment","Vessel Schedule"],"automation_level":"full","accuracy_rate":0.98,"decisions_per_day":2500}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'contract-compliance', 'Contract Compliance Agent', 'monitoring',
  'Monitors contract terms, volume commitments, and renewal alerts',
  '["contract_monitoring","volume_tracking","renewal_alerting","term_violation_detection"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/contract-compliance/run',
  '{"connected_modules":["Contract Management","Customer Management","Rate Management"],"automation_level":"assisted","avg_processing_time_ms":4500,"accuracy_rate":0.95,"decisions_per_day":180}'::jsonb,
  2, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '2 hours', 'Runs periodic compliance scans', '{"connected_modules":["Contract Management","Customer Management","Rate Management"],"automation_level":"assisted","accuracy_rate":0.95,"decisions_per_day":180}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'quote-generator', 'Quote Generator Agent', 'semi_autonomous',
  'Auto-generates freight quotes from customer inquiries and RFQs',
  '["quote_generation","rate_lookup","surcharge_calculation","validity_management","multi_currency_pricing"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/quote-generator/run',
  '{"connected_modules":["Quotation","Rate Management","Customer Management"],"automation_level":"semi","avg_processing_time_ms":3800,"accuracy_rate":0.93,"decisions_per_day":600}'::jsonb,
  4, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '35 minutes', 'Requires human approval for non-standard terms', '{"connected_modules":["Quotation","Rate Management","Customer Management"],"automation_level":"semi","accuracy_rate":0.93,"decisions_per_day":600}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'churn-predictor', 'Customer Churn Predictor', 'monitoring',
  'Identifies at-risk customers based on booking patterns and engagement metrics',
  '["churn_prediction","engagement_scoring","retention_recommendations","early_warning_alerts"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/churn-predictor/run',
  '{"connected_modules":["Customer Management","Booking","CRM"],"automation_level":"assisted","avg_processing_time_ms":5200,"accuracy_rate":0.91,"decisions_per_day":150}'::jsonb,
  2, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '4 hours', 'Batch analysis runs daily', '{"connected_modules":["Customer Management","Booking","CRM"],"automation_level":"assisted","accuracy_rate":0.91,"decisions_per_day":150}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'demand-forecaster', 'Demand Forecaster Agent', 'autonomous',
  'Predicts booking volume per trade lane using historical and market data',
  '["volume_forecasting","seasonal_analysis","trade_lane_prediction","capacity_planning","trend_detection"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/demand-forecaster/run',
  '{"connected_modules":["Booking","Vessel Schedule","Rate Management"],"automation_level":"full","avg_processing_time_ms":8500,"accuracy_rate":0.89,"decisions_per_day":95}'::jsonb,
  2, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '6 hours', 'Uses 24 months historical data', '{"connected_modules":["Booking","Vessel Schedule","Rate Management"],"automation_level":"full","accuracy_rate":0.89,"decisions_per_day":95}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'lead-scorer', 'Lead Scoring Agent', 'autonomous',
  'Qualifies and prioritizes sales leads based on engagement and fit criteria',
  '["lead_qualification","priority_scoring","conversion_prediction","lead_enrichment"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/lead-scorer/run',
  '{"connected_modules":["CRM","Customer Management","Quotation"],"automation_level":"full","avg_processing_time_ms":2100,"accuracy_rate":0.88,"decisions_per_day":400}'::jsonb,
  3, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '50 minutes', 'Integrates with CRM pipeline', '{"connected_modules":["CRM","Customer Management","Quotation"],"automation_level":"full","accuracy_rate":0.88,"decisions_per_day":400}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'customer-segmenter', 'Customer Segmentation Agent', 'autonomous',
  'Segments customers by booking behavior, revenue tier, and trade patterns',
  '["behavioral_clustering","revenue_segmentation","trade_pattern_analysis","segment_migration_tracking"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/customer-segmenter/run',
  '{"connected_modules":["Customer Management","Booking","Analytics"],"automation_level":"full","avg_processing_time_ms":12000,"accuracy_rate":0.92,"decisions_per_day":50}'::jsonb,
  1, 120000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '8 hours', 'Batch segmentation runs weekly', '{"connected_modules":["Customer Management","Booking","Analytics"],"automation_level":"full","accuracy_rate":0.92,"decisions_per_day":50}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'surcharge-calculator', 'Surcharge Calculator Agent', 'autonomous',
  'Dynamic surcharge computation for BAF, CAF, THC, and special handling',
  '["baf_calculation","caf_calculation","thc_computation","special_surcharge","fuel_index_tracking"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/surcharge-calculator/run',
  '{"connected_modules":["Rate Management","Quotation","Invoicing"],"automation_level":"full","avg_processing_time_ms":800,"accuracy_rate":0.99,"decisions_per_day":3500}'::jsonb,
  10, 10000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '1 minute', 'Real-time calculation engine', '{"connected_modules":["Rate Management","Quotation","Invoicing"],"automation_level":"full","accuracy_rate":0.99,"decisions_per_day":3500}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'campaign-optimizer', 'Campaign Optimizer Agent', 'semi_autonomous',
  'Marketing campaign optimization for trade lane promotions and customer engagement',
  '["campaign_targeting","a_b_testing","roi_prediction","channel_optimization"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/campaign-optimizer/run',
  '{"connected_modules":["CRM","Customer Management","Analytics"],"automation_level":"semi","avg_processing_time_ms":6000,"accuracy_rate":0.85,"decisions_per_day":25}'::jsonb,
  1, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '12 hours', 'Requires marketing team approval', '{"connected_modules":["CRM","Customer Management","Analytics"],"automation_level":"semi","accuracy_rate":0.85,"decisions_per_day":25}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'sla-monitor', 'SLA Monitor Agent', 'monitoring',
  'Service level tracking, breach detection, and proactive alerts',
  '["sla_tracking","breach_detection","performance_alerting","trend_analysis"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/sla-monitor/run',
  '{"connected_modules":["Customer Management","Operations","Contract Management"],"automation_level":"assisted","avg_processing_time_ms":1500,"accuracy_rate":0.97,"decisions_per_day":800}'::jsonb,
  3, 15000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '5 minutes', 'Continuous SLA monitoring', '{"connected_modules":["Customer Management","Operations","Contract Management"],"automation_level":"assisted","accuracy_rate":0.97,"decisions_per_day":800}'::jsonb
),

-- ============================================
-- OPERATIONS & DOCUMENTATION (13-22)
-- ============================================
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'bl-generator', 'BL Generator Agent', 'semi_autonomous',
  'Auto-populates Bill of Lading from booking data with compliance checks',
  '["bl_auto_population","data_validation","compliance_check","amendment_tracking","pdf_generation"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/bl-generator/run',
  '{"connected_modules":["Bill of Lading","Booking","Documentation"],"automation_level":"semi","avg_processing_time_ms":4200,"accuracy_rate":0.96,"decisions_per_day":800}'::jsonb,
  5, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '20 minutes', 'Requires ops review before final issue', '{"connected_modules":["Bill of Lading","Booking","Documentation"],"automation_level":"semi","accuracy_rate":0.96,"decisions_per_day":800}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'manifest-compiler', 'Manifest Compiler Agent', 'autonomous',
  'Compiles and validates cargo manifests for customs and port submissions',
  '["manifest_compilation","data_aggregation","customs_format_validation","edi_generation","error_detection"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/manifest-compiler/run',
  '{"connected_modules":["Manifest","Booking","Customs"],"automation_level":"full","avg_processing_time_ms":6500,"accuracy_rate":0.97,"decisions_per_day":120}'::jsonb,
  3, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '2 hours', 'Supports CUSCAR, BAPLIE formats', '{"connected_modules":["Manifest","Booking","Customs"],"automation_level":"full","accuracy_rate":0.97,"decisions_per_day":120}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'vgm-validator', 'VGM Validator Agent', 'autonomous',
  'Verified Gross Mass validation against SOLAS requirements',
  '["weight_verification","solas_compliance","discrepancy_detection","weighbridge_integration"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/vgm-validator/run',
  '{"connected_modules":["VGM","Equipment","Booking"],"automation_level":"full","avg_processing_time_ms":900,"accuracy_rate":0.99,"decisions_per_day":2000}'::jsonb,
  8, 10000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '30 minutes', 'SOLAS compliant validation', '{"connected_modules":["VGM","Equipment","Booking"],"automation_level":"full","accuracy_rate":0.99,"decisions_per_day":2000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'cargo-tracker', 'Cargo Tracker Agent', 'autonomous',
  'Real-time shipment visibility with milestone tracking and alerts',
  '["real_time_tracking","milestone_detection","delay_prediction","customer_notification","ais_integration"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/cargo-tracker/run',
  '{"connected_modules":["Tracking","Booking","Vessel Schedule"],"automation_level":"full","avg_processing_time_ms":1200,"accuracy_rate":0.95,"decisions_per_day":5000}'::jsonb,
  10, 15000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '2 minutes', 'Continuous tracking updates', '{"connected_modules":["Tracking","Booking","Vessel Schedule"],"automation_level":"full","accuracy_rate":0.95,"decisions_per_day":5000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'hs-classifier', 'HS Code Classifier Agent', 'autonomous',
  'Automatic HS tariff code classification from cargo descriptions',
  '["hs_code_lookup","cargo_classification","tariff_determination","duty_estimation","ruling_reference"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/hs-classifier/run',
  '{"connected_modules":["Customs","Booking","Documentation"],"automation_level":"full","avg_processing_time_ms":2800,"accuracy_rate":0.93,"decisions_per_day":900}'::jsonb,
  4, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '45 minutes', 'Covers 6-digit HS level with country extensions', '{"connected_modules":["Customs","Booking","Documentation"],"automation_level":"full","accuracy_rate":0.93,"decisions_per_day":900}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'doc-validator', 'Document Validator Agent', 'semi_autonomous',
  'OCR-based document validation for shipping documents',
  '["ocr_extraction","field_validation","cross_reference_check","format_compliance","anomaly_flagging"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/doc-validator/run',
  '{"connected_modules":["Documentation","Bill of Lading","Customs"],"automation_level":"semi","avg_processing_time_ms":5500,"accuracy_rate":0.94,"decisions_per_day":450}'::jsonb,
  4, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '1 hour', 'Supports PDF, image, and scanned docs', '{"connected_modules":["Documentation","Bill of Lading","Customs"],"automation_level":"semi","accuracy_rate":0.94,"decisions_per_day":450}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'regulatory-filer', 'Regulatory Filing Agent', 'semi_autonomous',
  'Auto-prepares regulatory documents for port and customs submissions',
  '["regulatory_form_prep","submission_formatting","deadline_tracking","status_monitoring"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/regulatory-filer/run',
  '{"connected_modules":["Customs","Documentation","Compliance"],"automation_level":"semi","avg_processing_time_ms":7200,"accuracy_rate":0.95,"decisions_per_day":200}'::jsonb,
  2, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '3 hours', 'Covers GCC and India regulatory requirements', '{"connected_modules":["Customs","Documentation","Compliance"],"automation_level":"semi","accuracy_rate":0.95,"decisions_per_day":200}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'si-processor', 'Shipping Instruction Agent', 'autonomous',
  'Processes shipping instructions and validates against booking details',
  '["si_parsing","booking_matching","discrepancy_detection","auto_correction","bl_linkage"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/si-processor/run',
  '{"connected_modules":["Shipping Instructions","Booking","Bill of Lading"],"automation_level":"full","avg_processing_time_ms":2200,"accuracy_rate":0.96,"decisions_per_day":1100}'::jsonb,
  6, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '25 minutes', 'Handles EDI and portal submissions', '{"connected_modules":["Shipping Instructions","Booking","Bill of Lading"],"automation_level":"full","accuracy_rate":0.96,"decisions_per_day":1100}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'cargo-release', 'Cargo Release Agent', 'semi_autonomous',
  'Processes delivery and release orders with hold checks',
  '["release_validation","hold_check","payment_verification","customs_clearance_check"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/cargo-release/run',
  '{"connected_modules":["Delivery Order","Accounts Receivable","Customs"],"automation_level":"semi","avg_processing_time_ms":1800,"accuracy_rate":0.97,"decisions_per_day":650}'::jsonb,
  4, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '40 minutes', 'Checks financial and customs holds before release', '{"connected_modules":["Delivery Order","Accounts Receivable","Customs"],"automation_level":"semi","accuracy_rate":0.97,"decisions_per_day":650}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'dg-classifier', 'DG Classifier Agent', 'autonomous',
  'IMDG class determination for dangerous goods shipments',
  '["imdg_classification","un_number_lookup","packing_group_assignment","special_provision_check","dg_declaration_prep"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/dg-classifier/run',
  '{"connected_modules":["Dangerous Goods","Booking","Documentation"],"automation_level":"full","avg_processing_time_ms":3500,"accuracy_rate":0.98,"decisions_per_day":300}'::jsonb,
  3, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '1 hour', 'IMDG Code 2024 edition compliant', '{"connected_modules":["Dangerous Goods","Booking","Documentation"],"automation_level":"full","accuracy_rate":0.98,"decisions_per_day":300}'::jsonb
),

-- ============================================
-- VESSEL & VOYAGE (23-34)
-- ============================================
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'voyage-optimizer', 'Voyage Optimizer Agent', 'semi_autonomous',
  'Route and speed optimization for fuel efficiency and schedule adherence',
  '["route_optimization","speed_profile","fuel_consumption_modeling","schedule_adherence","emission_reduction"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/voyage-optimizer/run',
  '{"connected_modules":["Voyage Management","Vessel Schedule","Bunker Management"],"automation_level":"semi","avg_processing_time_ms":15000,"accuracy_rate":0.91,"decisions_per_day":45}'::jsonb,
  2, 120000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '3 hours', 'Considers weather, currents, and CII targets', '{"connected_modules":["Voyage Management","Vessel Schedule","Bunker Management"],"automation_level":"semi","accuracy_rate":0.91,"decisions_per_day":45}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'weather-router', 'Weather Routing Agent', 'autonomous',
  'Weather-aware routing using meteorological data and sea state forecasts',
  '["weather_analysis","sea_state_forecast","route_deviation","storm_avoidance","optimal_waypoint"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/weather-router/run',
  '{"connected_modules":["Voyage Management","Vessel Schedule"],"automation_level":"full","avg_processing_time_ms":8000,"accuracy_rate":0.88,"decisions_per_day":60}'::jsonb,
  2, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '4 hours', 'Integrates with external weather APIs', '{"connected_modules":["Voyage Management","Vessel Schedule"],"automation_level":"full","accuracy_rate":0.88,"decisions_per_day":60}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'stowage-planner', 'Stowage Planner Agent', 'semi_autonomous',
  'Optimal container placement considering weight, DG segregation, and reefer slots',
  '["bay_planning","weight_distribution","dg_segregation","reefer_slot_allocation","stability_check","restow_minimization"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/stowage-planner/run',
  '{"connected_modules":["Stowage Planning","Vessel Management","Equipment"],"automation_level":"semi","avg_processing_time_ms":25000,"accuracy_rate":0.94,"decisions_per_day":30}'::jsonb,
  1, 120000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '5 hours', 'BAPLIE import/export capable', '{"connected_modules":["Stowage Planning","Vessel Management","Equipment"],"automation_level":"semi","accuracy_rate":0.94,"decisions_per_day":30}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'bunker-optimizer', 'Bunker Optimizer Agent', 'semi_autonomous',
  'Fuel procurement optimization considering port prices and consumption forecasts',
  '["bunker_price_analysis","stem_optimization","consumption_forecast","supplier_comparison","procurement_timing"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/bunker-optimizer/run',
  '{"connected_modules":["Bunker Management","Voyage Management","Procurement"],"automation_level":"semi","avg_processing_time_ms":10000,"accuracy_rate":0.90,"decisions_per_day":20}'::jsonb,
  1, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '6 hours', 'Monitors global bunker indices', '{"connected_modules":["Bunker Management","Voyage Management","Procurement"],"automation_level":"semi","accuracy_rate":0.90,"decisions_per_day":20}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'speed-optimizer', 'Speed Optimizer Agent', 'autonomous',
  'CII-aware speed recommendations balancing schedule and emissions',
  '["speed_profiling","cii_impact_analysis","fuel_saving_calculation","schedule_impact","emission_tracking"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/speed-optimizer/run',
  '{"connected_modules":["Voyage Management","Vessel Management","ESG"],"automation_level":"full","avg_processing_time_ms":3000,"accuracy_rate":0.93,"decisions_per_day":200}'::jsonb,
  3, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '2 hours', 'IMO 2023 GHG regulations compliant', '{"connected_modules":["Voyage Management","Vessel Management","ESG"],"automation_level":"full","accuracy_rate":0.93,"decisions_per_day":200}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'noon-analyzer', 'Noon Report Analyzer Agent', 'autonomous',
  'Vessel performance monitoring from daily noon reports',
  '["performance_analysis","consumption_tracking","weather_impact","deviation_detection","benchmark_comparison"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/noon-analyzer/run',
  '{"connected_modules":["Vessel Management","Voyage Management"],"automation_level":"full","avg_processing_time_ms":4000,"accuracy_rate":0.95,"decisions_per_day":150}'::jsonb,
  2, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '3 hours', 'Daily automated analysis', '{"connected_modules":["Vessel Management","Voyage Management"],"automation_level":"full","accuracy_rate":0.95,"decisions_per_day":150}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'eta-predictor', 'ETA Predictor Agent', 'autonomous',
  'Arrival time prediction using AIS data, weather, and port congestion',
  '["eta_calculation","congestion_analysis","weather_adjustment","historical_pattern","confidence_scoring"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/eta-predictor/run',
  '{"connected_modules":["Vessel Schedule","Tracking","Port Management"],"automation_level":"full","avg_processing_time_ms":2000,"accuracy_rate":0.92,"decisions_per_day":1500}'::jsonb,
  5, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '8 minutes', 'Updates every 30 minutes per vessel', '{"connected_modules":["Vessel Schedule","Tracking","Port Management"],"automation_level":"full","accuracy_rate":0.92,"decisions_per_day":1500}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'port-turnaround', 'Port Turnaround Optimizer', 'semi_autonomous',
  'Minimize port stay through optimized operations sequencing',
  '["operation_sequencing","resource_allocation","bottleneck_detection","turnaround_prediction"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/port-turnaround/run',
  '{"connected_modules":["Port Management","Vessel Schedule","Terminal Operations"],"automation_level":"semi","avg_processing_time_ms":8000,"accuracy_rate":0.89,"decisions_per_day":40}'::jsonb,
  2, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '5 hours', 'Coordinates with terminal systems', '{"connected_modules":["Port Management","Vessel Schedule","Terminal Operations"],"automation_level":"semi","accuracy_rate":0.89,"decisions_per_day":40}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'fleet-deployer', 'Fleet Deployment Agent', 'semi_autonomous',
  'Vessel-to-route assignment optimization based on demand and vessel characteristics',
  '["fleet_optimization","route_matching","demand_alignment","cost_minimization","schedule_generation"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/fleet-deployer/run',
  '{"connected_modules":["Fleet Management","Vessel Schedule","Booking"],"automation_level":"semi","avg_processing_time_ms":20000,"accuracy_rate":0.87,"decisions_per_day":10}'::jsonb,
  1, 120000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '12 hours', 'Strategic fleet planning tool', '{"connected_modules":["Fleet Management","Vessel Schedule","Booking"],"automation_level":"semi","accuracy_rate":0.87,"decisions_per_day":10}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'voyage-pnl', 'Voyage P&L Agent', 'autonomous',
  'Real-time voyage profitability tracking with cost and revenue allocation',
  '["revenue_allocation","cost_tracking","profitability_analysis","variance_detection","forecast_update"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/voyage-pnl/run',
  '{"connected_modules":["Voyage Management","Finance","Invoicing"],"automation_level":"full","avg_processing_time_ms":5000,"accuracy_rate":0.94,"decisions_per_day":250}'::jsonb,
  3, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '1 hour', 'Tracks estimated vs actual P&L', '{"connected_modules":["Voyage Management","Finance","Invoicing"],"automation_level":"full","accuracy_rate":0.94,"decisions_per_day":250}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'capacity-forecaster', 'Capacity Forecaster Agent', 'autonomous',
  'Space utilization prediction and overbooking optimization',
  '["utilization_forecast","overbooking_optimization","no_show_prediction","capacity_alert"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/capacity-forecaster/run',
  '{"connected_modules":["Booking","Vessel Schedule","Analytics"],"automation_level":"full","avg_processing_time_ms":6000,"accuracy_rate":0.90,"decisions_per_day":180}'::jsonb,
  2, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '4 hours', 'Dynamic capacity management', '{"connected_modules":["Booking","Vessel Schedule","Analytics"],"automation_level":"full","accuracy_rate":0.90,"decisions_per_day":180}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'charter-analyzer', 'Charter Party Analyzer Agent', 'assistive',
  'Charter party term analysis and comparison against market standards',
  '["charter_term_analysis","market_comparison","risk_assessment","clause_extraction"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/charter-analyzer/run',
  '{"connected_modules":["Chartering","Vessel Management","Legal"],"automation_level":"assisted","avg_processing_time_ms":12000,"accuracy_rate":0.88,"decisions_per_day":15}'::jsonb,
  1, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '18 hours', 'Assists chartering team with analysis', '{"connected_modules":["Chartering","Vessel Management","Legal"],"automation_level":"assisted","accuracy_rate":0.88,"decisions_per_day":15}'::jsonb
),

-- ============================================
-- EQUIPMENT & CONTAINER (35-44)
-- ============================================
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'container-allocator', 'Container Allocation Agent', 'autonomous',
  'Optimal container type and unit selection based on cargo requirements',
  '["container_matching","availability_check","cost_optimization","equipment_substitution","pickup_routing"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/container-allocator/run',
  '{"connected_modules":["Equipment","Booking","Depot Management"],"automation_level":"full","avg_processing_time_ms":1500,"accuracy_rate":0.96,"decisions_per_day":1800}'::jsonb,
  8, 15000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '4 minutes', 'Real-time allocation engine', '{"connected_modules":["Equipment","Booking","Depot Management"],"automation_level":"full","accuracy_rate":0.96,"decisions_per_day":1800}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'reefer-monitor', 'Reefer Monitor Agent', 'autonomous',
  'Temperature anomaly detection and reefer cargo monitoring',
  '["temperature_monitoring","anomaly_detection","alert_generation","power_status_check","compliance_logging"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/reefer-monitor/run',
  '{"connected_modules":["Equipment","Tracking","Operations"],"automation_level":"full","avg_processing_time_ms":500,"accuracy_rate":0.99,"decisions_per_day":8000}'::jsonb,
  10, 10000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '1 minute', 'Continuous IoT monitoring', '{"connected_modules":["Equipment","Tracking","Operations"],"automation_level":"full","accuracy_rate":0.99,"decisions_per_day":8000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'predictive-maint', 'Predictive Maintenance Agent', 'autonomous',
  'Equipment failure prediction using sensor data and maintenance history',
  '["failure_prediction","maintenance_scheduling","component_lifecycle","cost_estimation","priority_ranking"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/predictive-maint/run',
  '{"connected_modules":["Maintenance","Equipment","Vessel Management"],"automation_level":"full","avg_processing_time_ms":7000,"accuracy_rate":0.91,"decisions_per_day":100}'::jsonb,
  2, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '6 hours', 'ML model retrained monthly', '{"connected_modules":["Maintenance","Equipment","Vessel Management"],"automation_level":"full","accuracy_rate":0.91,"decisions_per_day":100}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'empty-repo-optimizer', 'Empty Repo Optimizer Agent', 'semi_autonomous',
  'Empty container repositioning optimization to minimize imbalance costs',
  '["imbalance_detection","repositioning_planning","cost_optimization","demand_matching","route_selection"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/empty-repo-optimizer/run',
  '{"connected_modules":["Equipment","Booking","Vessel Schedule"],"automation_level":"semi","avg_processing_time_ms":18000,"accuracy_rate":0.88,"decisions_per_day":25}'::jsonb,
  1, 120000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '8 hours', 'Weekly optimization cycles', '{"connected_modules":["Equipment","Booking","Vessel Schedule"],"automation_level":"semi","accuracy_rate":0.88,"decisions_per_day":25}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'damage-assessor', 'Container Damage Assessor', 'semi_autonomous',
  'Image-based container damage classification and repair cost estimation',
  '["image_analysis","damage_classification","repair_estimation","liability_assignment","report_generation"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/damage-assessor/run',
  '{"connected_modules":["Equipment","Maintenance","Claims"],"automation_level":"semi","avg_processing_time_ms":8000,"accuracy_rate":0.89,"decisions_per_day":200}'::jsonb,
  3, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '3 hours', 'Vision model for damage detection', '{"connected_modules":["Equipment","Maintenance","Claims"],"automation_level":"semi","accuracy_rate":0.89,"decisions_per_day":200}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'yard-optimizer', 'Yard Optimizer Agent', 'autonomous',
  'Optimal yard slot allocation and container stacking strategy',
  '["slot_optimization","stacking_rules","retrieval_efficiency","yard_capacity","truck_appointment"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/yard-optimizer/run',
  '{"connected_modules":["Terminal Operations","Equipment","Gate Management"],"automation_level":"full","avg_processing_time_ms":2500,"accuracy_rate":0.93,"decisions_per_day":3000}'::jsonb,
  5, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '30 minutes', 'Supports multiple yard layouts', '{"connected_modules":["Terminal Operations","Equipment","Gate Management"],"automation_level":"full","accuracy_rate":0.93,"decisions_per_day":3000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'iot-alert', 'IoT Alert Agent', 'autonomous',
  'Sensor anomaly detection for container and vessel IoT devices',
  '["sensor_monitoring","anomaly_detection","threshold_alerting","pattern_recognition"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/iot-alert/run',
  '{"connected_modules":["Equipment","Vessel Management","Tracking"],"automation_level":"full","avg_processing_time_ms":300,"accuracy_rate":0.97,"decisions_per_day":12000}'::jsonb,
  10, 10000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '30 seconds', 'Ultra-low latency monitoring', '{"connected_modules":["Equipment","Vessel Management","Tracking"],"automation_level":"full","accuracy_rate":0.97,"decisions_per_day":12000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'pti-scheduler', 'PTI Scheduler Agent', 'autonomous',
  'Pre-trip inspection scheduling for reefer containers',
  '["inspection_scheduling","resource_allocation","compliance_tracking","result_recording"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/pti-scheduler/run',
  '{"connected_modules":["Equipment","Maintenance","Booking"],"automation_level":"full","avg_processing_time_ms":1200,"accuracy_rate":0.98,"decisions_per_day":500}'::jsonb,
  3, 15000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '2 hours', 'Automated PTI workflow', '{"connected_modules":["Equipment","Maintenance","Booking"],"automation_level":"full","accuracy_rate":0.98,"decisions_per_day":500}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'lease-evaluator', 'Lease Evaluator Agent', 'assistive',
  'Container lease vs buy analysis with total cost of ownership modeling',
  '["tco_analysis","lease_comparison","market_rate_tracking","portfolio_optimization"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/lease-evaluator/run',
  '{"connected_modules":["Equipment","Finance","Procurement"],"automation_level":"assisted","avg_processing_time_ms":10000,"accuracy_rate":0.90,"decisions_per_day":10}'::jsonb,
  1, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '20 hours', 'Quarterly evaluation cycles', '{"connected_modules":["Equipment","Finance","Procurement"],"automation_level":"assisted","accuracy_rate":0.90,"decisions_per_day":10}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'gps-tracker', 'GPS Tracker Agent', 'autonomous',
  'Container and vehicle position monitoring with geofencing alerts',
  '["position_tracking","geofence_monitoring","route_deviation","dwell_time_analysis"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/gps-tracker/run',
  '{"connected_modules":["Tracking","Equipment","Fleet Management"],"automation_level":"full","avg_processing_time_ms":400,"accuracy_rate":0.98,"decisions_per_day":15000}'::jsonb,
  10, 10000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '15 seconds', 'Real-time GPS processing', '{"connected_modules":["Tracking","Equipment","Fleet Management"],"automation_level":"full","accuracy_rate":0.98,"decisions_per_day":15000}'::jsonb
),

-- ============================================
-- FINANCIAL (45-58)
-- ============================================
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'invoice-generator', 'Invoice Generator Agent', 'semi_autonomous',
  'Auto-generates invoices from BL data and charge tariffs',
  '["invoice_creation","charge_calculation","tax_computation","multi_currency","pdf_generation","email_dispatch"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/invoice-generator/run',
  '{"connected_modules":["Invoicing","Bill of Lading","Accounts Receivable"],"automation_level":"semi","avg_processing_time_ms":3500,"accuracy_rate":0.97,"decisions_per_day":700}'::jsonb,
  5, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '15 minutes', 'Supports proforma and final invoices', '{"connected_modules":["Invoicing","Bill of Lading","Accounts Receivable"],"automation_level":"semi","accuracy_rate":0.97,"decisions_per_day":700}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'revenue-recognizer', 'Revenue Recognition Agent', 'autonomous',
  'IFRS 15 compliant revenue recognition across voyage milestones',
  '["revenue_allocation","milestone_tracking","deferred_revenue","journal_generation","audit_trail"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/revenue-recognizer/run',
  '{"connected_modules":["Finance","Voyage Management","General Ledger"],"automation_level":"full","avg_processing_time_ms":5500,"accuracy_rate":0.98,"decisions_per_day":400}'::jsonb,
  3, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '1 hour', 'IFRS 15 five-step model implementation', '{"connected_modules":["Finance","Voyage Management","General Ledger"],"automation_level":"full","accuracy_rate":0.98,"decisions_per_day":400}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'cash-applicator', 'Cash Application Agent', 'autonomous',
  'Automatic payment-to-invoice matching using reference and amount analysis',
  '["payment_matching","reference_parsing","partial_application","overpayment_handling","bank_reconciliation"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/cash-applicator/run',
  '{"connected_modules":["Accounts Receivable","Bank Management","Finance"],"automation_level":"full","avg_processing_time_ms":2000,"accuracy_rate":0.95,"decisions_per_day":1500}'::jsonb,
  5, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '30 minutes', 'Handles multi-currency matching', '{"connected_modules":["Accounts Receivable","Bank Management","Finance"],"automation_level":"full","accuracy_rate":0.95,"decisions_per_day":1500}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'demurrage-calculator', 'Demurrage Calculator Agent', 'autonomous',
  'Automated D&D calculation based on tariffs and container events',
  '["demurrage_calculation","detention_calculation","free_time_tracking","tariff_application","waiver_recommendation"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/demurrage-calculator/run',
  '{"connected_modules":["Demurrage","Equipment","Invoicing"],"automation_level":"full","avg_processing_time_ms":1500,"accuracy_rate":0.97,"decisions_per_day":900}'::jsonb,
  5, 15000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '45 minutes', 'Supports multiple tariff structures', '{"connected_modules":["Demurrage","Equipment","Invoicing"],"automation_level":"full","accuracy_rate":0.97,"decisions_per_day":900}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'fx-hedger', 'FX Hedging Agent', 'assistive',
  'Foreign exchange exposure analysis and hedge recommendations',
  '["exposure_analysis","hedge_recommendation","forward_rate_monitoring","risk_quantification"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/fx-hedger/run',
  '{"connected_modules":["Treasury","Finance","Accounts Payable"],"automation_level":"assisted","avg_processing_time_ms":8000,"accuracy_rate":0.87,"decisions_per_day":15}'::jsonb,
  1, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '10 hours', 'Covers USD, EUR, QAR, AED, SAR, INR', '{"connected_modules":["Treasury","Finance","Accounts Payable"],"automation_level":"assisted","accuracy_rate":0.87,"decisions_per_day":15}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'ap-matcher', 'AP Matcher Agent', 'autonomous',
  'Three-way match of PO, receipt, and vendor invoice',
  '["three_way_match","variance_detection","approval_routing","duplicate_detection","payment_scheduling"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/ap-matcher/run',
  '{"connected_modules":["Accounts Payable","Procurement","Finance"],"automation_level":"full","avg_processing_time_ms":2500,"accuracy_rate":0.96,"decisions_per_day":800}'::jsonb,
  4, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '1 hour', 'Tolerance-based matching rules', '{"connected_modules":["Accounts Payable","Procurement","Finance"],"automation_level":"full","accuracy_rate":0.96,"decisions_per_day":800}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'ocr-invoice', 'OCR Invoice Agent', 'autonomous',
  'Extracts structured data from scanned vendor invoices using OCR',
  '["ocr_extraction","field_mapping","vendor_matching","amount_validation","currency_detection"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/ocr-invoice/run',
  '{"connected_modules":["Accounts Payable","Procurement","Documentation"],"automation_level":"full","avg_processing_time_ms":6000,"accuracy_rate":0.93,"decisions_per_day":500}'::jsonb,
  4, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '2 hours', 'Supports Arabic and English documents', '{"connected_modules":["Accounts Payable","Procurement","Documentation"],"automation_level":"full","accuracy_rate":0.93,"decisions_per_day":500}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'fraud-detector', 'Fraud Detection Agent', 'autonomous',
  'Detects anomalous financial transactions and suspicious patterns',
  '["anomaly_detection","pattern_recognition","velocity_check","rule_engine","alert_generation"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/fraud-detector/run',
  '{"connected_modules":["Finance","Accounts Payable","Accounts Receivable"],"automation_level":"full","avg_processing_time_ms":1800,"accuracy_rate":0.96,"decisions_per_day":3000}'::jsonb,
  5, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '5 minutes', 'Real-time transaction screening', '{"connected_modules":["Finance","Accounts Payable","Accounts Receivable"],"automation_level":"full","accuracy_rate":0.96,"decisions_per_day":3000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'cashflow-predictor', 'Cash Flow Predictor Agent', 'autonomous',
  'Working capital forecasting using AR/AP aging and booking pipeline',
  '["cashflow_forecasting","working_capital_analysis","liquidity_prediction","scenario_modeling"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/cashflow-predictor/run',
  '{"connected_modules":["Treasury","Accounts Receivable","Accounts Payable"],"automation_level":"full","avg_processing_time_ms":10000,"accuracy_rate":0.89,"decisions_per_day":30}'::jsonb,
  1, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '6 hours', 'Rolling 90-day forecast', '{"connected_modules":["Treasury","Accounts Receivable","Accounts Payable"],"automation_level":"full","accuracy_rate":0.89,"decisions_per_day":30}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'cost-anomaly', 'Cost Anomaly Agent', 'monitoring',
  'Detects unusual cost patterns and variance from expected ranges',
  '["cost_monitoring","variance_detection","threshold_alerting","trend_analysis"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/cost-anomaly/run',
  '{"connected_modules":["Finance","Voyage Management","Procurement"],"automation_level":"assisted","avg_processing_time_ms":3000,"accuracy_rate":0.93,"decisions_per_day":500}'::jsonb,
  3, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '2 hours', 'Monitors all cost centers', '{"connected_modules":["Finance","Voyage Management","Procurement"],"automation_level":"assisted","accuracy_rate":0.93,"decisions_per_day":500}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'aging-predictor', 'Aging Predictor Agent', 'autonomous',
  'Predicts payment delays and identifies high-risk receivables',
  '["payment_prediction","risk_scoring","collection_prioritization","dso_forecasting"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/aging-predictor/run',
  '{"connected_modules":["Accounts Receivable","Credit Control","Customer Management"],"automation_level":"full","avg_processing_time_ms":4500,"accuracy_rate":0.91,"decisions_per_day":300}'::jsonb,
  2, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '3 hours', 'Feeds into credit scoring model', '{"connected_modules":["Accounts Receivable","Credit Control","Customer Management"],"automation_level":"full","accuracy_rate":0.91,"decisions_per_day":300}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'budget-variance', 'Budget Variance Agent', 'monitoring',
  'Auto-flags budget deviations and generates variance reports',
  '["variance_calculation","threshold_monitoring","trend_analysis","report_generation"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/budget-variance/run',
  '{"connected_modules":["Finance","Budgeting","General Ledger"],"automation_level":"assisted","avg_processing_time_ms":5000,"accuracy_rate":0.97,"decisions_per_day":100}'::jsonb,
  2, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '4 hours', 'Monthly and quarterly variance analysis', '{"connected_modules":["Finance","Budgeting","General Ledger"],"automation_level":"assisted","accuracy_rate":0.97,"decisions_per_day":100}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'interco-reconciler', 'Intercompany Reconciler Agent', 'autonomous',
  'Cross-entity transaction matching and intercompany balance reconciliation',
  '["transaction_matching","balance_reconciliation","discrepancy_detection","netting_calculation","journal_generation"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/interco-reconciler/run',
  '{"connected_modules":["Finance","General Ledger","Intercompany"],"automation_level":"full","avg_processing_time_ms":8000,"accuracy_rate":0.95,"decisions_per_day":60}'::jsonb,
  2, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '8 hours', 'Multi-entity reconciliation', '{"connected_modules":["Finance","General Ledger","Intercompany"],"automation_level":"full","accuracy_rate":0.95,"decisions_per_day":60}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'period-closer', 'Period Close Agent', 'semi_autonomous',
  'Automated period-end checks, accruals, and close procedures',
  '["close_checklist","accrual_calculation","cutoff_verification","journal_review","status_tracking"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/period-closer/run',
  '{"connected_modules":["Finance","General Ledger","Accounts Receivable","Accounts Payable"],"automation_level":"semi","avg_processing_time_ms":15000,"accuracy_rate":0.96,"decisions_per_day":20}'::jsonb,
  1, 120000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '22 hours', 'Month-end and year-end close support', '{"connected_modules":["Finance","General Ledger","Accounts Receivable","Accounts Payable"],"automation_level":"semi","accuracy_rate":0.96,"decisions_per_day":20}'::jsonb
),

-- ============================================
-- COMPLIANCE & RISK (59-72)
-- ============================================
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'sanctions-screener', 'Sanctions Screener Agent', 'autonomous',
  'Customer, vessel, and entity screening against global sanctions lists',
  '["sanctions_screening","pep_check","adverse_media","entity_resolution","real_time_monitoring","list_update_tracking"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/sanctions-screener/run',
  '{"connected_modules":["Compliance","Customer Management","Booking"],"automation_level":"full","avg_processing_time_ms":2500,"accuracy_rate":0.99,"decisions_per_day":2000}'::jsonb,
  8, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '2 minutes', 'OFAC, EU, UN sanctions lists', '{"connected_modules":["Compliance","Customer Management","Booking"],"automation_level":"full","accuracy_rate":0.99,"decisions_per_day":2000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'dg-segregation', 'DG Segregation Agent', 'autonomous',
  'Dangerous goods incompatibility checking per IMDG code',
  '["segregation_check","incompatibility_matrix","stowage_category","special_requirements"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/dg-segregation/run',
  '{"connected_modules":["Dangerous Goods","Stowage Planning","Booking"],"automation_level":"full","avg_processing_time_ms":800,"accuracy_rate":0.99,"decisions_per_day":1200}'::jsonb,
  5, 10000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '1 hour', 'IMDG segregation table implementation', '{"connected_modules":["Dangerous Goods","Stowage Planning","Booking"],"automation_level":"full","accuracy_rate":0.99,"decisions_per_day":1200}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'marpol-monitor', 'MARPOL Monitor Agent', 'monitoring',
  'Environmental compliance monitoring for MARPOL regulations',
  '["emission_monitoring","discharge_tracking","compliance_verification","reporting","eca_zone_alerting"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/marpol-monitor/run',
  '{"connected_modules":["Compliance","Vessel Management","ESG"],"automation_level":"assisted","avg_processing_time_ms":3000,"accuracy_rate":0.96,"decisions_per_day":200}'::jsonb,
  2, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '3 hours', 'MARPOL Annex I-VI monitoring', '{"connected_modules":["Compliance","Vessel Management","ESG"],"automation_level":"assisted","accuracy_rate":0.96,"decisions_per_day":200}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'cii-rater', 'CII Rating Agent', 'autonomous',
  'Carbon Intensity Indicator monitoring and rating prediction',
  '["cii_calculation","rating_prediction","improvement_recommendation","regulatory_reporting","fleet_benchmarking"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/cii-rater/run',
  '{"connected_modules":["Vessel Management","ESG","Compliance"],"automation_level":"full","avg_processing_time_ms":5000,"accuracy_rate":0.94,"decisions_per_day":80}'::jsonb,
  2, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '6 hours', 'IMO DCS data integration', '{"connected_modules":["Vessel Management","ESG","Compliance"],"automation_level":"full","accuracy_rate":0.94,"decisions_per_day":80}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'psc-readiness', 'PSC Readiness Agent', 'semi_autonomous',
  'Port State Control inspection preparation and deficiency tracking',
  '["readiness_assessment","deficiency_tracking","checklist_generation","historical_analysis","risk_scoring"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/psc-readiness/run',
  '{"connected_modules":["Vessel Management","Compliance","Maintenance"],"automation_level":"semi","avg_processing_time_ms":8000,"accuracy_rate":0.92,"decisions_per_day":15}'::jsonb,
  1, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '15 hours', 'Paris MOU and Tokyo MOU targeting factors', '{"connected_modules":["Vessel Management","Compliance","Maintenance"],"automation_level":"semi","accuracy_rate":0.92,"decisions_per_day":15}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'aeo-compliance', 'AEO Compliance Agent', 'monitoring',
  'Authorized Economic Operator compliance monitoring',
  '["aeo_monitoring","self_assessment","corrective_action","audit_preparation"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/aeo-compliance/run',
  '{"connected_modules":["Compliance","Customs","Operations"],"automation_level":"assisted","avg_processing_time_ms":6000,"accuracy_rate":0.95,"decisions_per_day":50}'::jsonb,
  1, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '12 hours', 'GCC AEO program requirements', '{"connected_modules":["Compliance","Customs","Operations"],"automation_level":"assisted","accuracy_rate":0.95,"decisions_per_day":50}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'audit-trail', 'Audit Trail Agent', 'autonomous',
  'Continuous transaction monitoring and audit trail analysis',
  '["transaction_monitoring","trail_analysis","anomaly_detection","compliance_verification","report_generation"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/audit-trail/run',
  '{"connected_modules":["Compliance","Finance","Operations"],"automation_level":"full","avg_processing_time_ms":1000,"accuracy_rate":0.98,"decisions_per_day":5000}'::jsonb,
  5, 15000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '3 minutes', 'Immutable audit log processing', '{"connected_modules":["Compliance","Finance","Operations"],"automation_level":"full","accuracy_rate":0.98,"decisions_per_day":5000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'risk-scorer', 'Risk Scorer Agent', 'autonomous',
  'Operational risk assessment across shipments and operations',
  '["risk_scoring","factor_weighting","mitigation_recommendation","portfolio_risk","threshold_alerting"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/risk-scorer/run',
  '{"connected_modules":["Risk Management","Operations","Compliance"],"automation_level":"full","avg_processing_time_ms":3500,"accuracy_rate":0.92,"decisions_per_day":600}'::jsonb,
  3, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '1 hour', 'Multi-factor risk model', '{"connected_modules":["Risk Management","Operations","Compliance"],"automation_level":"full","accuracy_rate":0.92,"decisions_per_day":600}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'claims-predictor', 'Claims Predictor Agent', 'autonomous',
  'Cargo claim likelihood estimation based on shipment characteristics',
  '["claim_prediction","risk_factor_analysis","historical_pattern","loss_estimation"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/claims-predictor/run',
  '{"connected_modules":["Claims","Insurance","Operations"],"automation_level":"full","avg_processing_time_ms":4000,"accuracy_rate":0.88,"decisions_per_day":250}'::jsonb,
  2, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '5 hours', 'Uses historical claims data', '{"connected_modules":["Claims","Insurance","Operations"],"automation_level":"full","accuracy_rate":0.88,"decisions_per_day":250}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'loss-prevention', 'Loss Prevention Agent', 'monitoring',
  'Incident pattern detection and proactive loss prevention',
  '["incident_monitoring","pattern_detection","root_cause_correlation","preventive_alerting"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/loss-prevention/run',
  '{"connected_modules":["Claims","Operations","Risk Management"],"automation_level":"assisted","avg_processing_time_ms":5000,"accuracy_rate":0.90,"decisions_per_day":100}'::jsonb,
  2, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '4 hours', 'Cross-incident correlation engine', '{"connected_modules":["Claims","Operations","Risk Management"],"automation_level":"assisted","accuracy_rate":0.90,"decisions_per_day":100}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'insurance-optimizer', 'Insurance Optimizer Agent', 'assistive',
  'Coverage gap analysis and insurance portfolio optimization',
  '["coverage_analysis","gap_detection","premium_benchmarking","policy_comparison"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/insurance-optimizer/run',
  '{"connected_modules":["Insurance","Risk Management","Finance"],"automation_level":"assisted","avg_processing_time_ms":12000,"accuracy_rate":0.87,"decisions_per_day":8}'::jsonb,
  1, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '20 hours', 'Annual review cycle with ad-hoc analysis', '{"connected_modules":["Insurance","Risk Management","Finance"],"automation_level":"assisted","accuracy_rate":0.87,"decisions_per_day":8}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'customs-filer', 'Customs Filing Agent', 'semi_autonomous',
  'Automated customs declaration preparation and submission',
  '["declaration_prep","tariff_lookup","duty_calculation","document_assembly","submission_tracking"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/customs-filer/run',
  '{"connected_modules":["Customs","Documentation","Compliance"],"automation_level":"semi","avg_processing_time_ms":6000,"accuracy_rate":0.95,"decisions_per_day":350}'::jsonb,
  3, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '2 hours', 'Qatar, UAE, KSA, India customs formats', '{"connected_modules":["Customs","Documentation","Compliance"],"automation_level":"semi","accuracy_rate":0.95,"decisions_per_day":350}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'incident-investigator', 'Incident Investigator Agent', 'assistive',
  'Root cause analysis assistance for operational incidents',
  '["root_cause_analysis","evidence_collection","timeline_reconstruction","recommendation_generation"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/incident-investigator/run',
  '{"connected_modules":["Risk Management","Operations","Compliance"],"automation_level":"assisted","avg_processing_time_ms":15000,"accuracy_rate":0.86,"decisions_per_day":5}'::jsonb,
  1, 120000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '18 hours', 'ISM Code investigation framework', '{"connected_modules":["Risk Management","Operations","Compliance"],"automation_level":"assisted","accuracy_rate":0.86,"decisions_per_day":5}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'regulatory-reporter', 'Regulatory Reporter Agent', 'semi_autonomous',
  'Automated compliance report generation for regulatory bodies',
  '["report_generation","data_aggregation","format_compliance","submission_scheduling","archive_management"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/regulatory-reporter/run',
  '{"connected_modules":["Compliance","Finance","ESG"],"automation_level":"semi","avg_processing_time_ms":10000,"accuracy_rate":0.95,"decisions_per_day":20}'::jsonb,
  1, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '12 hours', 'Covers IMO, flag state, and local requirements', '{"connected_modules":["Compliance","Finance","ESG"],"automation_level":"semi","accuracy_rate":0.95,"decisions_per_day":20}'::jsonb
),

-- ============================================
-- ANALYTICS & INTELLIGENCE (73-82)
-- ============================================
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'trade-analyzer', 'Trade Lane Analyzer Agent', 'autonomous',
  'Profitability analysis by trade lane with market context',
  '["lane_profitability","market_share","volume_analysis","competitor_positioning","trend_identification"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/trade-analyzer/run',
  '{"connected_modules":["Analytics","Rate Management","Booking"],"automation_level":"full","avg_processing_time_ms":8000,"accuracy_rate":0.93,"decisions_per_day":80}'::jsonb,
  2, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '4 hours', 'Covers all major GCC-India-Asia trade lanes', '{"connected_modules":["Analytics","Rate Management","Booking"],"automation_level":"full","accuracy_rate":0.93,"decisions_per_day":80}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'market-intel', 'Market Intelligence Agent', 'autonomous',
  'Competitor rate monitoring and market trend analysis',
  '["rate_monitoring","competitor_analysis","market_trend","index_tracking","alert_generation"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/market-intel/run',
  '{"connected_modules":["Analytics","Rate Management","CRM"],"automation_level":"full","avg_processing_time_ms":10000,"accuracy_rate":0.85,"decisions_per_day":50}'::jsonb,
  2, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '6 hours', 'Integrates SCFI, WCI, Freightos indices', '{"connected_modules":["Analytics","Rate Management","CRM"],"automation_level":"full","accuracy_rate":0.85,"decisions_per_day":50}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'kpi-monitor', 'KPI Monitor Agent', 'autonomous',
  'Operational KPI tracking with real-time dashboards and alerts',
  '["kpi_calculation","threshold_monitoring","dashboard_update","trend_analysis","report_generation"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/kpi-monitor/run',
  '{"connected_modules":["Analytics","Operations","Finance"],"automation_level":"full","avg_processing_time_ms":2000,"accuracy_rate":0.98,"decisions_per_day":1000}'::jsonb,
  5, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '5 minutes', 'Monitors 50+ operational KPIs', '{"connected_modules":["Analytics","Operations","Finance"],"automation_level":"full","accuracy_rate":0.98,"decisions_per_day":1000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'esg-reporter', 'ESG Reporter Agent', 'semi_autonomous',
  'Sustainability metrics collection and ESG report generation',
  '["emission_calculation","sustainability_metrics","report_generation","benchmark_comparison","target_tracking"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/esg-reporter/run',
  '{"connected_modules":["ESG","Vessel Management","Compliance"],"automation_level":"semi","avg_processing_time_ms":12000,"accuracy_rate":0.93,"decisions_per_day":15}'::jsonb,
  1, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '16 hours', 'GRI and SASB framework compliant', '{"connected_modules":["ESG","Vessel Management","Compliance"],"automation_level":"semi","accuracy_rate":0.93,"decisions_per_day":15}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'predictive-analytics', 'Predictive Analytics Agent', 'autonomous',
  'Multi-domain trend forecasting and predictive modeling',
  '["trend_forecasting","regression_analysis","time_series","anomaly_prediction","scenario_simulation"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/predictive-analytics/run',
  '{"connected_modules":["Analytics","Finance","Operations"],"automation_level":"full","avg_processing_time_ms":15000,"accuracy_rate":0.88,"decisions_per_day":40}'::jsonb,
  2, 120000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '8 hours', 'Ensemble model approach', '{"connected_modules":["Analytics","Finance","Operations"],"automation_level":"full","accuracy_rate":0.88,"decisions_per_day":40}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'customer-revenue', 'Customer Revenue Agent', 'autonomous',
  'Customer profitability analysis with lifetime value calculation',
  '["profitability_analysis","ltv_calculation","cost_allocation","revenue_attribution","segment_comparison"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/customer-revenue/run',
  '{"connected_modules":["Analytics","Customer Management","Finance"],"automation_level":"full","avg_processing_time_ms":6000,"accuracy_rate":0.94,"decisions_per_day":100}'::jsonb,
  2, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '5 hours', 'Activity-based costing model', '{"connected_modules":["Analytics","Customer Management","Finance"],"automation_level":"full","accuracy_rate":0.94,"decisions_per_day":100}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'benchmark-agent', 'Benchmark Agent', 'autonomous',
  'Industry benchmark comparison across operational and financial metrics',
  '["industry_comparison","peer_benchmarking","gap_analysis","best_practice_identification"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/benchmark-agent/run',
  '{"connected_modules":["Analytics","Finance","Operations"],"automation_level":"full","avg_processing_time_ms":8000,"accuracy_rate":0.86,"decisions_per_day":20}'::jsonb,
  1, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '10 hours', 'Uses Drewry and Alphaliner data', '{"connected_modules":["Analytics","Finance","Operations"],"automation_level":"full","accuracy_rate":0.86,"decisions_per_day":20}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'voyage-analytics', 'Voyage Analytics Agent', 'autonomous',
  'Voyage performance analysis with multi-dimensional insights',
  '["performance_analysis","efficiency_metrics","cost_breakdown","revenue_analysis","comparison_reporting"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/voyage-analytics/run',
  '{"connected_modules":["Voyage Management","Analytics","Finance"],"automation_level":"full","avg_processing_time_ms":7000,"accuracy_rate":0.95,"decisions_per_day":120}'::jsonb,
  2, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '3 hours', 'Post-voyage analysis automation', '{"connected_modules":["Voyage Management","Analytics","Finance"],"automation_level":"full","accuracy_rate":0.95,"decisions_per_day":120}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'carbon-calculator', 'Carbon Calculator Agent', 'autonomous',
  'Carbon footprint tracking per shipment, voyage, and fleet',
  '["emission_calculation","carbon_tracking","offset_recommendation","reporting","eu_ets_compliance"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/carbon-calculator/run',
  '{"connected_modules":["ESG","Voyage Management","Tracking"],"automation_level":"full","avg_processing_time_ms":2500,"accuracy_rate":0.96,"decisions_per_day":500}'::jsonb,
  3, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '2 hours', 'IMO well-to-wake methodology', '{"connected_modules":["ESG","Voyage Management","Tracking"],"automation_level":"full","accuracy_rate":0.96,"decisions_per_day":500}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'fleet-utilization', 'Fleet Utilization Agent', 'autonomous',
  'Fleet efficiency analysis covering capacity, speed, and idle time',
  '["utilization_tracking","idle_analysis","capacity_optimization","efficiency_scoring","fleet_comparison"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/fleet-utilization/run',
  '{"connected_modules":["Fleet Management","Vessel Schedule","Analytics"],"automation_level":"full","avg_processing_time_ms":5000,"accuracy_rate":0.94,"decisions_per_day":60}'::jsonb,
  2, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '4 hours', 'Daily fleet scorecard generation', '{"connected_modules":["Fleet Management","Vessel Schedule","Analytics"],"automation_level":"full","accuracy_rate":0.94,"decisions_per_day":60}'::jsonb
),

-- ============================================
-- PORT & TERMINAL (83-90)
-- ============================================
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'port-call-optimizer', 'Port Call Optimizer Agent', 'semi_autonomous',
  'Optimize port operations including anchorage, berth, and cargo ops',
  '["port_call_planning","anchorage_optimization","berth_window","cargo_ops_sequencing","cost_estimation"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/port-call-optimizer/run',
  '{"connected_modules":["Port Management","Vessel Schedule","Operations"],"automation_level":"semi","avg_processing_time_ms":10000,"accuracy_rate":0.90,"decisions_per_day":35}'::jsonb,
  2, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '5 hours', 'Covers Hamad, Jebel Ali, Mundra ports', '{"connected_modules":["Port Management","Vessel Schedule","Operations"],"automation_level":"semi","accuracy_rate":0.90,"decisions_per_day":35}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'disbursement-estimator', 'Disbursement Estimator Agent', 'autonomous',
  'Proforma Disbursement Account calculation for port calls',
  '["pda_calculation","tariff_lookup","service_estimation","currency_conversion","comparison_analysis"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/disbursement-estimator/run',
  '{"connected_modules":["Port Management","Finance","Accounts Payable"],"automation_level":"full","avg_processing_time_ms":4000,"accuracy_rate":0.92,"decisions_per_day":80}'::jsonb,
  3, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '3 hours', 'Port tariff database integration', '{"connected_modules":["Port Management","Finance","Accounts Payable"],"automation_level":"full","accuracy_rate":0.92,"decisions_per_day":80}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'berth-allocator', 'Berth Allocation Agent', 'semi_autonomous',
  'Optimal berth planning based on vessel size, cargo type, and schedule',
  '["berth_matching","schedule_optimization","conflict_resolution","resource_allocation"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/berth-allocator/run',
  '{"connected_modules":["Terminal Operations","Port Management","Vessel Schedule"],"automation_level":"semi","avg_processing_time_ms":6000,"accuracy_rate":0.91,"decisions_per_day":45}'::jsonb,
  2, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '4 hours', 'Multi-berth optimization', '{"connected_modules":["Terminal Operations","Port Management","Vessel Schedule"],"automation_level":"semi","accuracy_rate":0.91,"decisions_per_day":45}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'intermodal-planner', 'Intermodal Planner Agent', 'semi_autonomous',
  'Multimodal route optimization combining sea, road, and rail',
  '["route_optimization","mode_selection","cost_comparison","transit_time","carbon_footprint"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/intermodal-planner/run',
  '{"connected_modules":["Intermodal","Booking","Tracking"],"automation_level":"semi","avg_processing_time_ms":8000,"accuracy_rate":0.89,"decisions_per_day":60}'::jsonb,
  2, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '6 hours', 'Sea-road-rail integration', '{"connected_modules":["Intermodal","Booking","Tracking"],"automation_level":"semi","accuracy_rate":0.89,"decisions_per_day":60}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'transship-planner', 'Transshipment Planner Agent', 'semi_autonomous',
  'Hub optimization for transshipment cargo routing and scheduling',
  '["hub_selection","routing_optimization","connection_matching","dwell_time_minimization","cost_analysis"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/transship-planner/run',
  '{"connected_modules":["Transshipment","Vessel Schedule","Booking"],"automation_level":"semi","avg_processing_time_ms":12000,"accuracy_rate":0.90,"decisions_per_day":40}'::jsonb,
  2, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '7 hours', 'Jebel Ali and Salalah hub optimization', '{"connected_modules":["Transshipment","Vessel Schedule","Booking"],"automation_level":"semi","accuracy_rate":0.90,"decisions_per_day":40}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'port-tariff', 'Port Tariff Agent', 'autonomous',
  'Port tariff calculation and validation against published rates',
  '["tariff_calculation","rate_validation","invoice_verification","tariff_update_tracking"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/port-tariff/run',
  '{"connected_modules":["Port Management","Finance","Operations"],"automation_level":"full","avg_processing_time_ms":1500,"accuracy_rate":0.97,"decisions_per_day":400}'::jsonb,
  4, 15000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '2 hours', 'Covers 50+ ports in coverage area', '{"connected_modules":["Port Management","Finance","Operations"],"automation_level":"full","accuracy_rate":0.97,"decisions_per_day":400}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'last-mile', 'Last Mile Optimizer Agent', 'autonomous',
  'Delivery route optimization for last mile container transport',
  '["route_planning","vehicle_assignment","time_window","load_optimization","traffic_analysis"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/last-mile/run',
  '{"connected_modules":["Transport","Tracking","Operations"],"automation_level":"full","avg_processing_time_ms":5000,"accuracy_rate":0.91,"decisions_per_day":300}'::jsonb,
  3, 45000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '1 hour', 'Integrates with Google Maps API', '{"connected_modules":["Transport","Tracking","Operations"],"automation_level":"full","accuracy_rate":0.91,"decisions_per_day":300}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'pre-arrival', 'Pre-Arrival Agent', 'autonomous',
  'Vessel pre-arrival documentation and clearance preparation',
  '["document_preparation","clearance_check","notification_dispatch","compliance_verification"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/pre-arrival/run',
  '{"connected_modules":["Port Management","Documentation","Compliance"],"automation_level":"full","avg_processing_time_ms":3500,"accuracy_rate":0.96,"decisions_per_day":60}'::jsonb,
  2, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '3 hours', 'Prepares 72h, 48h, 24h notifications', '{"connected_modules":["Port Management","Documentation","Compliance"],"automation_level":"full","accuracy_rate":0.96,"decisions_per_day":60}'::jsonb
),

-- ============================================
-- HR & PROCUREMENT (91-95)
-- ============================================
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'crew-planner', 'Crew Planner Agent', 'semi_autonomous',
  'Crew rotation planning considering certifications, rest hours, and visas',
  '["rotation_planning","certification_check","rest_hour_compliance","visa_tracking","cost_optimization"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/crew-planner/run',
  '{"connected_modules":["Crew Management","Vessel Management","HR"],"automation_level":"semi","avg_processing_time_ms":10000,"accuracy_rate":0.93,"decisions_per_day":20}'::jsonb,
  1, 90000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '10 hours', 'MLC 2006 compliant planning', '{"connected_modules":["Crew Management","Vessel Management","HR"],"automation_level":"semi","accuracy_rate":0.93,"decisions_per_day":20}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'cert-tracker', 'Certificate Tracker Agent', 'monitoring',
  'Certificate and document expiry tracking with renewal alerts',
  '["expiry_monitoring","renewal_alerting","compliance_tracking","document_management"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/cert-tracker/run',
  '{"connected_modules":["Vessel Management","Crew Management","Compliance"],"automation_level":"assisted","avg_processing_time_ms":1000,"accuracy_rate":0.99,"decisions_per_day":200}'::jsonb,
  2, 15000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '6 hours', 'Tracks vessel and crew certificates', '{"connected_modules":["Vessel Management","Crew Management","Compliance"],"automation_level":"assisted","accuracy_rate":0.99,"decisions_per_day":200}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'vendor-scorer', 'Vendor Scorer Agent', 'autonomous',
  'Supplier performance scoring based on quality, delivery, and cost metrics',
  '["performance_scoring","quality_tracking","delivery_monitoring","cost_analysis","recommendation"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/vendor-scorer/run',
  '{"connected_modules":["Procurement","Accounts Payable","Operations"],"automation_level":"full","avg_processing_time_ms":4000,"accuracy_rate":0.92,"decisions_per_day":50}'::jsonb,
  2, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '8 hours', 'Quarterly vendor scorecards', '{"connected_modules":["Procurement","Accounts Payable","Operations"],"automation_level":"full","accuracy_rate":0.92,"decisions_per_day":50}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'spend-analyzer', 'Spend Analyzer Agent', 'autonomous',
  'Procurement spend analytics with category and supplier insights',
  '["spend_categorization","savings_identification","contract_compliance","maverick_spend_detection"]'::jsonb,
  'openai', 'gpt-4o', '/api/v1/ai/agents/spend-analyzer/run',
  '{"connected_modules":["Procurement","Finance","Analytics"],"automation_level":"full","avg_processing_time_ms":8000,"accuracy_rate":0.91,"decisions_per_day":30}'::jsonb,
  1, 60000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '12 hours', 'Monthly spend analysis reports', '{"connected_modules":["Procurement","Finance","Analytics"],"automation_level":"full","accuracy_rate":0.91,"decisions_per_day":30}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'po-generator', 'PO Generator Agent', 'semi_autonomous',
  'Purchase order automation with approval workflow integration',
  '["po_creation","approval_routing","budget_check","vendor_selection","delivery_scheduling"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/po-generator/run',
  '{"connected_modules":["Procurement","Accounts Payable","Budgeting"],"automation_level":"semi","avg_processing_time_ms":3000,"accuracy_rate":0.96,"decisions_per_day":150}'::jsonb,
  3, 20000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '2 hours', 'Integrates with approval matrix', '{"connected_modules":["Procurement","Accounts Payable","Budgeting"],"automation_level":"semi","accuracy_rate":0.96,"decisions_per_day":150}'::jsonb
),

-- ============================================
-- PLATFORM (96-100)
-- ============================================
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'workflow-router', 'Workflow Router Agent', 'autonomous',
  'Intelligent task routing based on workload, expertise, and priority',
  '["task_routing","workload_balancing","priority_assessment","skill_matching","escalation_management"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/workflow-router/run',
  '{"connected_modules":["Workflow","Task Management","HR"],"automation_level":"full","avg_processing_time_ms":500,"accuracy_rate":0.94,"decisions_per_day":5000}'::jsonb,
  10, 10000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '1 minute', 'Core workflow orchestration engine', '{"connected_modules":["Workflow","Task Management","HR"],"automation_level":"full","accuracy_rate":0.94,"decisions_per_day":5000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'notification-optimizer', 'Notification Optimizer Agent', 'autonomous',
  'Smart alert prioritization and notification channel optimization',
  '["priority_scoring","channel_selection","batch_optimization","fatigue_prevention","delivery_timing"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/notification-optimizer/run',
  '{"connected_modules":["Notifications","Workflow","User Management"],"automation_level":"full","avg_processing_time_ms":200,"accuracy_rate":0.93,"decisions_per_day":10000}'::jsonb,
  10, 10000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '30 seconds', 'Reduces notification noise by 60%', '{"connected_modules":["Notifications","Workflow","User Management"],"automation_level":"full","accuracy_rate":0.93,"decisions_per_day":10000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'data-quality', 'Data Quality Agent', 'autonomous',
  'Master data validation, deduplication, and enrichment',
  '["data_validation","deduplication","enrichment","standardization","quality_scoring"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/data-quality/run',
  '{"connected_modules":["Master Data","Customer Management","Port Management"],"automation_level":"full","avg_processing_time_ms":1500,"accuracy_rate":0.97,"decisions_per_day":2000}'::jsonb,
  5, 15000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '1 hour', 'Continuous data quality monitoring', '{"connected_modules":["Master Data","Customer Management","Port Management"],"automation_level":"full","accuracy_rate":0.97,"decisions_per_day":2000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'integration-monitor', 'Integration Monitor Agent', 'monitoring',
  'API and EDI integration health monitoring with alerting',
  '["api_monitoring","edi_health_check","latency_tracking","error_detection","uptime_reporting"]'::jsonb,
  'internal', 'cs-erp-ml-v2', '/api/v1/ai/agents/integration-monitor/run',
  '{"connected_modules":["Integration","API Gateway","EDI"],"automation_level":"assisted","avg_processing_time_ms":500,"accuracy_rate":0.99,"decisions_per_day":8000}'::jsonb,
  5, 10000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'running',
  NOW() - INTERVAL '20 seconds', 'Monitors 200+ integration endpoints', '{"connected_modules":["Integration","API Gateway","EDI"],"automation_level":"assisted","accuracy_rate":0.99,"decisions_per_day":8000}'::jsonb
),
(
  '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'onboarding-agent', 'Onboarding Agent', 'assistive',
  'Guided setup and onboarding for new users and tenants',
  '["guided_setup","configuration_wizard","data_import_assistance","training_recommendation"]'::jsonb,
  'anthropic', 'claude-sonnet-4-5-20250514', '/api/v1/ai/agents/onboarding-agent/run',
  '{"connected_modules":["User Management","Configuration","Training"],"automation_level":"assisted","avg_processing_time_ms":3000,"accuracy_rate":0.95,"decisions_per_day":20}'::jsonb,
  2, 30000, '{"max_retries":3,"backoff_ms":1000}'::jsonb, true, 'idle',
  NOW() - INTERVAL '14 hours', 'Interactive onboarding workflow', '{"connected_modules":["User Management","Configuration","Training"],"automation_level":"assisted","accuracy_rate":0.95,"decisions_per_day":20}'::jsonb
);

COMMIT;
