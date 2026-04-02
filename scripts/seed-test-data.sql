-- =============================================================================
-- CS ERP - Realistic Container Shipping Demo Data Seed
-- =============================================================================
-- Tenant: 7f709f8d-ca75-4626-85ae-5501ddeea85e
-- User:   d2047326-1ef5-4a44-a6ec-a42785f197c5
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1a. SALES CRM - Customers (scm_customers) - 10 records
-- =============================================================================

INSERT INTO scm_customers (id, tenant_id, customer_code, company_name, trade_name, customer_type, tier, industry, country, city, address, phone, email, tax_registration_no, credit_limit_amount, credit_currency, payment_terms_days, status)
VALUES
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CUST-001', 'Al Futtaim Logistics LLC', 'Al Futtaim Logistics', 'shipper', 'gold', 'Automotive', 'ARE', 'Dubai', 'P.O. Box 152, Dubai, UAE', '+971-4-2135000', 'logistics@alfuttaim.ae', 'TRN100234567890', 500000, 'USD', 30, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CUST-002', 'Qatar Gas Transport Company', 'Nakilat', 'shipper', 'platinum', 'Energy', 'QAT', 'Doha', 'P.O. Box 22271, Doha, Qatar', '+974-4495-7777', 'operations@nakilat.com.qa', 'QA123456789', 2000000, 'USD', 45, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CUST-003', 'Tata International Limited', 'Tata International', 'consignee', 'gold', 'Manufacturing', 'IND', 'Mumbai', '31 Mumbai Samachar Marg, Fort, Mumbai 400001', '+91-22-6665-8282', 'shipping@tatainternational.com', 'GSTIN27AAACT2727Q1Z5', 750000, 'USD', 30, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CUST-004', 'DP World Trading LLC', 'DP World', 'freight_forwarder', 'platinum', 'Logistics', 'ARE', 'Dubai', 'LOB 17, Jebel Ali Free Zone, Dubai', '+971-4-881-5555', 'bookings@dpworld.com', 'TRN100345678901', 3000000, 'USD', 60, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CUST-005', 'Saudi Arabian Fertilizer Company', 'SAFCO', 'shipper', 'standard', 'Chemicals', 'SAU', 'Jubail', 'P.O. Box 11044, Jubail Industrial City 31961', '+966-13-346-1000', 'exports@safco.sa', 'SA310456789012345', 1000000, 'USD', 30, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CUST-006', 'Agility Public Warehousing KSC', 'Agility Logistics', 'freight_forwarder', 'gold', 'Logistics', 'KWT', 'Kuwait City', 'Sulaibiya, Block 1, Kuwait', '+965-1-808-222', 'sea.freight@agility.com', 'KW-FR-100234', 600000, 'USD', 30, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CUST-007', 'Reliance Industries Limited', 'Reliance Industries', 'shipper', 'platinum', 'Petrochemicals', 'IND', 'Mumbai', 'Maker Chambers IV, 222 Nariman Point, Mumbai', '+91-22-3555-5000', 'logistics@ril.com', 'GSTIN27AAACR5114Q1Z2', 5000000, 'USD', 45, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CUST-008', 'Emirates Trading Agency LLC', 'ETA', 'consignee', 'standard', 'Trading', 'ARE', 'Abu Dhabi', 'Khalifa Street, P.O. Box 5, Abu Dhabi', '+971-2-626-9000', 'imports@eta.ae', 'TRN100567890123', 250000, 'USD', 30, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CUST-009', 'Ooredoo Group', 'Ooredoo', 'consignee', 'gold', 'Telecom', 'QAT', 'Doha', 'P.O. Box 217, Doha, Qatar', '+974-4400-0000', 'procurement@ooredoo.qa', 'QA987654321', 400000, 'USD', 30, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CUST-010', 'Maersk Line Singapore Pte Ltd', 'Maersk Singapore', 'freight_forwarder', 'platinum', 'Shipping', 'SGP', 'Singapore', '50 Raffles Place #31-01, Singapore 048623', '+65-6320-8888', 'bookings.sgp@maersk.com', 'SG-T08FC5029K', 10000000, 'USD', 60, 'active');

-- =============================================================================
-- 1b. SALES CRM - Leads (scm_leads) - 10 records
-- =============================================================================

INSERT INTO scm_leads (id, tenant_id, company_name, contact_name, contact_email, contact_phone, job_title, country, city, industry, estimated_teu, estimated_revenue, trade_lane, source, assigned_to, qualification_score, status)
VALUES
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Al Jazeera Shipping Co.', 'Ahmed Al-Mansoor', 'ahmed@aljazeerashipping.qa', '+974-4412-3456', 'VP Operations', 'QAT', 'Doha', 'Shipping', 500, 250000, 'Middle East - Far East', 'referral', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 85, 'qualified'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Mumbai Container Freight Station', 'Rajesh Sharma', 'rsharma@mcfs.in', '+91-22-2567-8900', 'General Manager', 'IND', 'Mumbai', 'Logistics', 1200, 480000, 'India - Europe', 'trade_show', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 72, 'contacted'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Jeddah Industrial Supplies', 'Khalid bin Fahad', 'khalid@jis.sa', '+966-12-614-0000', 'Procurement Director', 'SAU', 'Jeddah', 'Industrial Supplies', 300, 120000, 'Middle East - Asia', 'website', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 60, 'new'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Singapore Petrochemicals Pte Ltd', 'Tan Wei Lin', 'weilin.tan@sgpetro.sg', '+65-6789-0123', 'Logistics Manager', 'SGP', 'Singapore', 'Petrochemicals', 800, 640000, 'Asia - Middle East', 'cold_call', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 90, 'qualified'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Dubai Steel Industries', 'Mohammed Al-Rashid', 'mrashid@dubaisteel.ae', '+971-4-338-0000', 'Export Manager', 'ARE', 'Dubai', 'Steel', 200, 160000, 'Middle East - India', 'email_campaign', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 55, 'new'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Rotterdam Import Services BV', 'Jan van der Berg', 'jvdberg@ris.nl', '+31-10-405-6789', 'Managing Director', 'NLD', 'Rotterdam', 'Freight Forwarding', 2000, 1600000, 'Europe - Middle East', 'partner_referral', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 95, 'qualified'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Chittagong Garment Exporters', 'Farhan Islam', 'farhan@cge.bd', '+880-31-2520000', 'Head of Shipping', 'BGD', 'Chittagong', 'Garments', 600, 180000, 'South Asia - Europe', 'website', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 40, 'new'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Los Angeles Cold Chain Inc', 'David Chen', 'dchen@lacoldchain.com', '+1-310-555-0199', 'Director of Operations', 'USA', 'Los Angeles', 'Cold Chain', 400, 520000, 'Americas - Asia', 'trade_show', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 78, 'contacted'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Shanghai Electronics Trading Co', 'Li Wei', 'liwei@shetc.cn', '+86-21-5888-0000', 'Import/Export Manager', 'CHN', 'Shanghai', 'Electronics', 1500, 1200000, 'Far East - Middle East', 'referral', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 88, 'qualified'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'Abu Dhabi Polymers LLC', 'Sultan Al Ameri', 'sultan@adpolymers.ae', '+971-2-507-0000', 'Supply Chain Head', 'ARE', 'Abu Dhabi', 'Polymers', 350, 280000, 'Middle East - Far East', 'cold_call', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 65, 'contacted');

-- =============================================================================
-- 1c. SALES CRM - Contracts (scm_contracts) - 5 records
-- =============================================================================

INSERT INTO scm_contracts (id, tenant_id, contract_number, contract_name, customer_id, contract_type, start_date, end_date, minimum_commitment_teu, maximum_commitment_teu, total_value, currency, payment_terms_days, trade_lane, sales_rep_id, status)
VALUES
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CTR-2025-001', 'Al Futtaim Annual Volume Contract',
    (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND customer_code = 'CUST-001' LIMIT 1),
    'volume', '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', 500, 2000, 1500000, 'USD', 30, 'Middle East - Far East', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CTR-2025-002', 'Nakilat Premium Service Agreement',
    (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND customer_code = 'CUST-002' LIMIT 1),
    'service', '2025-03-01T00:00:00Z', '2026-02-28T23:59:59Z', 1000, 5000, 8000000, 'USD', 45, 'Qatar - Asia Pacific', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CTR-2025-003', 'Tata International Inbound Contract',
    (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND customer_code = 'CUST-003' LIMIT 1),
    'standard', '2025-06-01T00:00:00Z', '2026-05-31T23:59:59Z', 200, 800, 600000, 'USD', 30, 'India - Middle East', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 'draft'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CTR-2025-004', 'DP World Consortium Agreement',
    (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND customer_code = 'CUST-004' LIMIT 1),
    'volume', '2025-01-01T00:00:00Z', '2026-12-31T23:59:59Z', 5000, 20000, 25000000, 'USD', 60, 'Global Multi-Trade', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CTR-2025-005', 'Reliance Petrochemical Exports',
    (SELECT id FROM scm_customers WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND customer_code = 'CUST-007' LIMIT 1),
    'volume', '2024-07-01T00:00:00Z', '2025-06-30T23:59:59Z', 3000, 10000, 12000000, 'USD', 45, 'India - Global', 'd2047326-1ef5-4a44-a6ec-a42785f197c5', 'completed');

-- =============================================================================
-- 2. OPERATIONS DOCUMENTATION - Bills of Lading (odm_bills_of_lading) - 15 records
-- =============================================================================

INSERT INTO odm_bills_of_lading (id, tenant_id, bl_number, bl_type, bl_status, booking_reference, shipper_name, shipper_address, consignee_name, consignee_address, notify_party_name, vessel_name, voyage_number, port_of_loading, port_of_discharge, place_of_receipt, place_of_delivery, date_of_issue, on_board_date, freight_terms, container_count, gross_weight, weight_unit, cargo_description)
VALUES
  -- Draft BLs (30%)
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000001', 'original', 'draft', 'BKG-2025-0001',
    'Al Futtaim Logistics LLC', 'P.O. Box 152, Dubai, UAE',
    'Tata International Limited', '31 Mumbai Samachar Marg, Fort, Mumbai 400001',
    'Tata International Limited', 'MSC ANNA', 'MA2501E', 'AEDXB', 'INMUN',
    'Dubai, UAE', 'Mumbai, India', NULL, NULL, 'prepaid', 2, 28000, 'KG',
    'Automotive Parts - New, 250 Cartons'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000006', 'original', 'draft', 'BKG-2025-0006',
    'Agility Public Warehousing', 'Sulaibiya, Block 1, Kuwait',
    'Ooredoo Group', 'P.O. Box 217, Doha, Qatar',
    'Ooredoo Group', 'HMM ALGECIRAS', 'HA2506E', 'KWSAA', 'QADOH',
    'Kuwait City', 'Doha, Qatar', NULL, NULL, 'prepaid', 1, 12000, 'KG',
    'Telecom Equipment, 45 Pallets'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000011', 'original', 'draft', 'BKG-2025-0011',
    'DP World Trading LLC', 'Jebel Ali Free Zone, Dubai',
    'Reliance Industries Limited', 'Maker Chambers IV, Mumbai',
    'Reliance Industries Limited', 'CMA CGM JACQUES SAADE', 'CJ2511E', 'AEDXB', 'INMUN',
    'Dubai, UAE', 'Mumbai, India', NULL, NULL, 'prepaid', 2, 36000, 'KG',
    'Building Materials, 120 Pallets'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000015', 'original', 'draft', 'BKG-2025-0015',
    'Ooredoo Group', 'P.O. Box 217, Doha, Qatar',
    'Tata International Limited', '31 Mumbai Samachar Marg, Mumbai',
    'Tata International Limited', 'HAPAG LLOYD BRUSSELS EXPRESS', 'HB2515E', 'QADOH', 'INMUN',
    'Doha, Qatar', 'Mumbai, India', NULL, NULL, 'prepaid', 1, 8000, 'KG',
    'Telecom Network Infrastructure, 30 Crates'),

  -- Issued / Confirmed BLs (30%)
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000002', 'original', 'issued', 'BKG-2025-0002',
    'Qatar Gas Transport Company', 'P.O. Box 22271, Doha, Qatar',
    'Shanghai Electronics Trading Co', '888 Pudong Avenue, Shanghai 200120',
    'Shanghai Electronics Trading Co', 'EVER GIVEN', 'EG2502W', 'QADOH', 'CNSHA',
    'Doha, Qatar', 'Shanghai, China', '2025-02-15', '2025-02-16', 'prepaid', 4, 96000, 'KG',
    'Industrial Equipment, 180 Packages'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000005', 'original', 'issued', 'BKG-2025-0005',
    'DP World Trading LLC', 'Jebel Ali Free Zone, Dubai',
    'Los Angeles Cold Chain Inc', '1200 Harbor Blvd, Los Angeles CA 90731',
    'Los Angeles Cold Chain Inc', 'MSC GULSUN', 'MG2505W', 'AEDXB', 'USLAX',
    'Dubai, UAE', 'Los Angeles, USA', '2025-03-10', '2025-03-11', 'collect', 3, 45000, 'KG',
    'Dates and Dried Fruits, Reefer Cargo'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000009', 'express', 'issued', 'BKG-2025-0009',
    'Maersk Line Singapore Pte Ltd', '50 Raffles Place, Singapore',
    'Qatar Gas Transport Company', 'P.O. Box 22271, Doha, Qatar',
    'Nakilat Operations', 'MSC ISABELLA', 'MI2509E', 'SGSIN', 'QADOH',
    'Singapore', 'Doha, Qatar', '2025-03-05', '2025-03-06', 'prepaid', 10, 240000, 'KG',
    'Marine Spare Parts and Equipment, 500 Packages'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000012', 'original', 'issued', 'BKG-2025-0012',
    'Reliance Industries Limited', 'Maker Chambers IV, Mumbai',
    'Agility Public Warehousing', 'Sulaibiya, Block 1, Kuwait',
    'Agility Public Warehousing', 'COSCO SHIPPING ARIES', 'CA2512W', 'INMUN', 'KWSAA',
    'Mumbai, India', 'Kuwait City', '2025-02-28', '2025-03-01', 'prepaid', 6, 144000, 'KG',
    'Polypropylene Pellets, 6000 Bags'),

  -- Shipped BLs (20%)
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000003', 'original', 'shipped', 'BKG-2025-0003',
    'SAFCO - Saudi Arabian Fertilizer Co', 'P.O. Box 11044, Jubail 31961, KSA',
    'Mumbai Container Freight Station', 'JNPT, Nhava Sheva, Mumbai 400707',
    'Tata International Limited', 'CMA CGM MARCO POLO', 'MP2503E', 'SAJUB', 'INMUN',
    'Jubail, KSA', 'Mumbai, India', '2025-03-01', '2025-03-02', 'prepaid', 6, 150000, 'KG',
    'Urea Fertilizer in Bulk Bags, 600 Bags'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000007', 'original', 'shipped', 'BKG-2025-0007',
    'Shanghai Electronics Trading Co', '888 Pudong Avenue, Shanghai 200120',
    'Emirates Trading Agency LLC', 'Khalifa Street, Abu Dhabi',
    'Emirates Trading Agency LLC', 'ONE AQUILA', 'OA2507E', 'CNSHA', 'AEDXB',
    'Shanghai, China', 'Dubai, UAE', '2025-02-20', '2025-02-21', 'prepaid', 5, 65000, 'KG',
    'Consumer Electronics, 1200 Cartons'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000010', 'original', 'shipped', 'BKG-2025-0010',
    'Al Futtaim Logistics LLC', 'P.O. Box 152, Dubai, UAE',
    'Singapore Petrochemicals Pte Ltd', '1 Harbour Front, Singapore 098633',
    'Singapore Petrochemicals Pte Ltd', 'EVER ACE', 'EA2510W', 'AEDXB', 'SGSIN',
    'Dubai, UAE', 'Singapore', '2025-03-12', '2025-03-13', 'prepaid', 4, 88000, 'KG',
    'Aluminum Ingots, 220 Bundles'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000014', 'original', 'shipped', 'BKG-2025-0014',
    'Emirates Trading Agency LLC', 'Khalifa Street, Abu Dhabi',
    'Shanghai Electronics Trading Co', '888 Pudong Avenue, Shanghai',
    'Shanghai Electronics Trading Co', 'YANG MING WARRANT', 'YW2514E', 'AEAUH', 'CNSHA',
    'Abu Dhabi, UAE', 'Shanghai, China', '2025-03-08', '2025-03-09', 'collect', 2, 22000, 'KG',
    'Recycled Plastics, 400 Bales'),

  -- Delivered BLs (20%)
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000004', 'seaway_bill', 'delivered', 'BKG-2025-0004',
    'Reliance Industries Limited', 'Maker Chambers IV, Mumbai',
    'Rotterdam Import Services BV', 'Europoort 200, 3198 LH Rotterdam',
    'Rotterdam Import Services BV', 'COSCO SHIPPING UNIVERSE', 'CU2504W', 'INMUN', 'NLRTM',
    'Mumbai, India', 'Rotterdam, Netherlands', '2025-01-10', '2025-01-11', 'prepaid', 8, 192000, 'KG',
    'Polyethylene Granules, 8000 Bags'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000008', 'original', 'delivered', 'BKG-2025-0008',
    'Tata International Limited', '31 Mumbai Samachar Marg, Mumbai',
    'Al Futtaim Logistics LLC', 'P.O. Box 152, Dubai, UAE',
    'Al Futtaim Logistics LLC', 'MAERSK EDINBURGH', 'ME2508W', 'INMUN', 'AEDXB',
    'Mumbai, India', 'Dubai, UAE', '2025-01-05', '2025-01-06', 'prepaid', 3, 42000, 'KG',
    'Cotton Textiles, 900 Bales'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSBL2025000013', 'seaway_bill', 'delivered', 'BKG-2025-0013',
    'SAFCO - Saudi Arabian Fertilizer Co', 'P.O. Box 11044, Jubail 31961, KSA',
    'Rotterdam Import Services BV', 'Europoort 200, Rotterdam',
    'Rotterdam Import Services BV', 'MSC AMBRA', 'MA2513W', 'SAJUB', 'NLRTM',
    'Jubail, KSA', 'Rotterdam, Netherlands', '2025-01-20', '2025-01-21', 'prepaid', 12, 288000, 'KG',
    'Ammonia Solution, IMO Class 8');

-- =============================================================================
-- 3a. CHARTERING & VESSEL - Charter Parties (cvm_charter_parties) - 5 records
-- =============================================================================

INSERT INTO cvm_charter_parties (id, tenant_id, cp_reference, charter_type, vessel_name, vessel_imo, charterer_name, owner_name, broker_name, hire_rate, hire_currency, hire_period_unit, delivery_port, redelivery_port, laycan_from, laycan_to, commenced_at, duration_days, commission_percent, status)
VALUES
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CP-2025-001', 'time_charter', 'MSC ANNA', '9839430',
    'CS Shipping Qatar WLL', 'Mediterranean Shipping Company SA', 'Clarksons PLC',
    35000, 'USD', 'day', 'Dubai, Jebel Ali', 'Singapore, PSA',
    '2025-01-01T00:00:00Z', '2025-01-05T00:00:00Z', '2025-01-03T08:00:00Z', 365, 3.75, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CP-2025-002', 'voyage_charter', 'EVER GIVEN', '9811000',
    'CS Shipping Qatar WLL', 'Evergreen Marine Corporation', 'SSY - Simpson Spence Young',
    28000, 'USD', 'day', 'Doha, Hamad Port', 'Shanghai, Yangshan',
    '2025-02-10T00:00:00Z', '2025-02-15T00:00:00Z', '2025-02-12T06:00:00Z', 42, 2.50, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CP-2025-003', 'time_charter', 'CMA CGM MARCO POLO', '9454436',
    'CS Shipping Qatar WLL', 'CMA CGM SA', 'Braemar Shipping Services',
    42000, 'USD', 'day', 'Jubail, King Fahd Port', 'Mumbai, JNPT',
    '2025-03-01T00:00:00Z', '2025-03-05T00:00:00Z', NULL, 180, 3.00, 'draft'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CP-2025-004', 'time_charter', 'COSCO SHIPPING UNIVERSE', '9795610',
    'CS Shipping Qatar WLL', 'COSCO Shipping Lines Co Ltd', 'Howe Robinson Partners',
    38000, 'USD', 'day', 'Mumbai, JNPT', 'Rotterdam, Europoort',
    '2024-10-01T00:00:00Z', '2024-10-05T00:00:00Z', '2024-10-03T10:00:00Z', 365, 3.50, 'completed'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CP-2025-005', 'bareboat', 'MSC GULSUN', '9839442',
    'CS Shipping Qatar WLL', 'Mediterranean Shipping Company SA', 'Fearnleys AS',
    18000, 'USD', 'day', 'Dubai, Jebel Ali', 'Dubai, Jebel Ali',
    '2025-04-01T00:00:00Z', '2025-04-10T00:00:00Z', NULL, 730, 1.25, 'draft');

-- =============================================================================
-- 3b. CHARTERING & VESSEL - Voyage Estimates (cvm_voyage_estimates) - 10 records
-- These also serve as vessel references across the system.
-- =============================================================================

INSERT INTO cvm_voyage_estimates (id, tenant_id, voyage_number, vessel_name, origin_port, destination_port, cargo_type, cargo_quantity, cargo_unit, estimated_revenue, bunker_cost, port_cost, canal_cost, other_costs, total_cost, net_result, currency, voyage_days, sea_days, port_days, distance_nm, status)
VALUES
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'VOY-2025-001', 'MSC ANNA', 'AEDXB', 'INMUN',
    'General Cargo', 5200, 'TEU', 2600000, 450000, 120000, 0, 80000, 650000, 1950000,
    'USD', 8, 6, 2, 1200.0, 'approved'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'VOY-2025-002', 'EVER GIVEN', 'QADOH', 'CNSHA',
    'Industrial Equipment', 3800, 'TEU', 3800000, 820000, 180000, 280000, 120000, 1400000, 2400000,
    'USD', 22, 18, 4, 6800.0, 'approved'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'VOY-2025-003', 'CMA CGM MARCO POLO', 'SAJUB', 'INMUN',
    'Fertilizer', 4200, 'TEU', 1680000, 280000, 95000, 0, 55000, 430000, 1250000,
    'USD', 6, 4, 2, 900.0, 'draft'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'VOY-2025-004', 'COSCO SHIPPING UNIVERSE', 'INMUN', 'NLRTM',
    'Petrochemicals', 6500, 'TEU', 6500000, 1200000, 350000, 450000, 200000, 2200000, 4300000,
    'USD', 28, 24, 4, 8200.0, 'completed'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'VOY-2025-005', 'MSC GULSUN', 'AEDXB', 'USLAX',
    'Mixed Cargo', 8000, 'TEU', 12000000, 2400000, 520000, 800000, 350000, 4070000, 7930000,
    'USD', 35, 30, 5, 13500.0, 'approved'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'VOY-2025-006', 'HMM ALGECIRAS', 'KWSAA', 'QADOH',
    'Telecom Equipment', 1200, 'TEU', 360000, 45000, 30000, 0, 15000, 90000, 270000,
    'USD', 2, 1, 1, 250.0, 'approved'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'VOY-2025-007', 'ONE AQUILA', 'CNSHA', 'AEDXB',
    'Consumer Electronics', 4800, 'TEU', 4320000, 680000, 160000, 280000, 100000, 1220000, 3100000,
    'USD', 18, 15, 3, 5400.0, 'approved'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'VOY-2025-008', 'MAERSK EDINBURGH', 'INMUN', 'AEDXB',
    'Textiles', 3200, 'TEU', 1280000, 210000, 85000, 0, 45000, 340000, 940000,
    'USD', 5, 3, 2, 800.0, 'completed'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'VOY-2025-009', 'MSC ISABELLA', 'SGSIN', 'QADOH',
    'Marine Spare Parts', 5500, 'TEU', 3850000, 580000, 145000, 0, 95000, 820000, 3030000,
    'USD', 12, 10, 2, 3800.0, 'draft'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'VOY-2025-010', 'EVER ACE', 'AEDXB', 'SGSIN',
    'Metals', 6200, 'TEU', 4340000, 620000, 150000, 0, 85000, 855000, 3485000,
    'USD', 10, 8, 2, 3200.0, 'approved');

-- =============================================================================
-- 4. BUNKER FUEL - Bunker Orders (bfm_bunker_orders) - 10 records
-- =============================================================================

INSERT INTO bfm_bunker_orders (id, tenant_id, order_ref, vessel_name, vessel_imo, voyage_ref, supplier_name, supplier_code, port, delivery_date, fuel_type, fuel_grade, quantity_ordered, quantity_delivered, unit, price_per_unit, currency, total_amount, status, payment_terms)
VALUES
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'BNK-2025-001', 'MSC ANNA', '9839430', 'VOY-2025-001',
    'Gulf Petrochem FZC', 'GULFP', 'AEDXB',
    '2025-01-02T08:00:00Z', 'VLSFO', '0.5% S', 1200, 1180, 'MT', 580, 'USD', 684400, 'delivered', 'Net 30 days'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'BNK-2025-002', 'EVER GIVEN', '9811000', 'VOY-2025-002',
    'Qatar Fuel (WOQOD)', 'WOQOD', 'QADOH',
    '2025-02-11T06:00:00Z', 'VLSFO', '0.5% S', 2500, 2480, 'MT', 595, 'USD', 1475600, 'delivered', 'Net 30 days'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'BNK-2025-003', 'CMA CGM MARCO POLO', '9454436', 'VOY-2025-003',
    'Indian Oil Corporation', 'IOC', 'INMUN',
    '2025-03-01T10:00:00Z', 'HSFO', '3.5% S', 800, NULL, 'MT', 420, 'USD', 336000, 'confirmed', 'Net 15 days'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'BNK-2025-004', 'COSCO SHIPPING UNIVERSE', '9795610', 'VOY-2025-004',
    'Vitol Bunkers BV', 'VITOL', 'NLRTM',
    '2025-01-25T14:00:00Z', 'VLSFO', '0.5% S', 3500, 3500, 'MT', 612, 'USD', 2142000, 'delivered', 'Net 30 days'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'BNK-2025-005', 'MSC GULSUN', '9839442', 'VOY-2025-005',
    'Minerva Bunkering Ltd', 'MINBK', 'AEDXB',
    '2025-03-08T07:00:00Z', 'VLSFO', '0.5% S', 4000, NULL, 'MT', 588, 'USD', 2352000, 'confirmed', 'Net 30 days'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'BNK-2025-006', 'ONE AQUILA', '9880662', 'VOY-2025-007',
    'Chimbusco Pan Nation Petrochem', 'CHIMB', 'CNSHA',
    '2025-02-18T09:00:00Z', 'VLSFO', '0.5% S', 1800, 1790, 'MT', 565, 'USD', 1011350, 'delivered', 'Net 30 days'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'BNK-2025-007', 'MSC ISABELLA', '9839454', 'VOY-2025-009',
    'Singapore Petroleum Company', 'SPC', 'SGSIN',
    '2025-03-04T06:00:00Z', 'MGO', 'DMA', 500, 500, 'MT', 850, 'USD', 425000, 'delivered', 'Net 15 days'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'BNK-2025-008', 'EVER ACE', '9893890', 'VOY-2025-010',
    'ENOC Marine LLC', 'ENOC', 'AEDXB',
    '2025-03-11T08:00:00Z', 'VLSFO', '0.5% S', 2200, NULL, 'MT', 575, 'USD', 1265000, 'draft', 'Net 30 days'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'BNK-2025-009', 'MAERSK EDINBURGH', '9458094', 'VOY-2025-008',
    'Bharat Petroleum Corporation', 'BPCL', 'INMUN',
    '2025-01-04T10:00:00Z', 'VLSFO', '0.5% S', 900, 890, 'MT', 590, 'USD', 525100, 'delivered', 'Net 30 days'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'BNK-2025-010', 'HMM ALGECIRAS', '9863297', 'VOY-2025-006',
    'Kuwait National Petroleum Company', 'KNPC', 'KWSAA',
    '2025-02-25T12:00:00Z', 'MGO', 'DMA', 200, 200, 'MT', 870, 'USD', 174000, 'delivered', 'Net 15 days');

-- =============================================================================
-- 5. FREIGHT INVOICING - Invoices (firm_freight_invoices) - 15 records
-- =============================================================================

INSERT INTO firm_freight_invoices (id, tenant_id, invoice_number, invoice_type, voyage_ref, booking_ref, bl_number, customer_name, customer_code, currency, subtotal, tax_amount, discount_amount, total_amount, paid_amount, outstanding_amount, payment_terms, due_date, issued_at, status)
VALUES
  -- Draft invoices (3)
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0001', 'freight', 'VOY-2025-001', 'BKG-2025-0001', 'CSBL2025000001',
    'Al Futtaim Logistics LLC', 'CUST-001', 'USD', 4200, 0, 0, 4200, 0, 4200,
    'Net 30', '2025-04-10T00:00:00Z', NULL, 'draft'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0006', 'local_charges', 'VOY-2025-006', 'BKG-2025-0006', 'CSBL2025000006',
    'Agility Public Warehousing', 'CUST-006', 'USD', 1800, 0, 0, 1800, 0, 1800,
    'Net 30', '2025-04-15T00:00:00Z', NULL, 'draft'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0015', 'detention', NULL, 'BKG-2025-0008', 'CSBL2025000008',
    'Tata International Limited', 'CUST-003', 'USD', 3200, 0, 0, 3200, 0, 3200,
    'Net 30', '2025-03-20T00:00:00Z', NULL, 'draft'),

  -- Issued invoices (6)
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0003', 'freight', 'VOY-2025-003', 'BKG-2025-0003', 'CSBL2025000003',
    'SAFCO - Saudi Arabian Fertilizer Co', 'CUST-005', 'USD', 12600, 0, 0, 12600, 0, 12600,
    'Net 30', '2025-04-01T00:00:00Z', '2025-03-01T12:00:00Z', 'issued'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0005', 'freight', 'VOY-2025-005', 'BKG-2025-0005', 'CSBL2025000005',
    'DP World Trading LLC', 'CUST-004', 'USD', 10500, 0, 0, 10500, 0, 10500,
    'Net 60', '2025-05-10T00:00:00Z', '2025-03-10T09:00:00Z', 'issued'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0009', 'freight', 'VOY-2025-009', 'BKG-2025-0009', 'CSBL2025000009',
    'Maersk Line Singapore Pte Ltd', 'CUST-010', 'USD', 45000, 0, 2250, 42750, 0, 42750,
    'Net 60', '2025-05-05T00:00:00Z', '2025-03-05T08:00:00Z', 'issued'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0010', 'freight', 'VOY-2025-010', 'BKG-2025-0010', 'CSBL2025000010',
    'Al Futtaim Logistics LLC', 'CUST-001', 'USD', 11200, 0, 0, 11200, 0, 11200,
    'Net 30', '2025-04-12T00:00:00Z', '2025-03-12T10:00:00Z', 'issued'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0012', 'local_charges', 'VOY-2025-003', 'BKG-2025-0003', 'CSBL2025000003',
    'SAFCO - Saudi Arabian Fertilizer Co', 'CUST-005', 'USD', 2400, 0, 0, 2400, 0, 2400,
    'Net 30', '2025-04-01T00:00:00Z', '2025-03-01T13:00:00Z', 'issued'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0013', 'freight', 'VOY-2025-002', 'BKG-2025-0012', 'CSBL2025000012',
    'Reliance Industries Limited', 'CUST-007', 'USD', 14400, 0, 720, 13680, 0, 13680,
    'Net 45', '2025-04-15T00:00:00Z', '2025-02-28T16:00:00Z', 'issued'),

  -- Paid invoices (6)
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0002', 'freight', 'VOY-2025-002', 'BKG-2025-0002', 'CSBL2025000002',
    'Qatar Gas Transport Company', 'CUST-002', 'USD', 18400, 0, 500, 17900, 17900, 0,
    'Net 45', '2025-04-01T00:00:00Z', '2025-02-15T10:00:00Z', 'paid'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0004', 'freight', 'VOY-2025-004', 'BKG-2025-0004', 'CSBL2025000004',
    'Reliance Industries Limited', 'CUST-007', 'USD', 32000, 0, 1600, 30400, 30400, 0,
    'Net 45', '2025-02-25T00:00:00Z', '2025-01-10T14:00:00Z', 'paid'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0007', 'freight', 'VOY-2025-007', 'BKG-2025-0007', 'CSBL2025000007',
    'Shanghai Electronics Trading Co', 'CUST-EXT', 'USD', 15000, 0, 750, 14250, 14250, 0,
    'Net 30', '2025-03-22T00:00:00Z', '2025-02-20T11:00:00Z', 'paid'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0008', 'freight', 'VOY-2025-008', 'BKG-2025-0008', 'CSBL2025000008',
    'Tata International Limited', 'CUST-003', 'USD', 7200, 0, 0, 7200, 7200, 0,
    'Net 30', '2025-02-05T00:00:00Z', '2025-01-05T15:00:00Z', 'paid'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0011', 'demurrage', NULL, 'BKG-2025-0004', 'CSBL2025000004',
    'Reliance Industries Limited', 'CUST-007', 'USD', 5600, 0, 0, 5600, 5600, 0,
    'Net 45', '2025-03-10T00:00:00Z', '2025-01-25T09:00:00Z', 'paid'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'INV-2025-0014', 'freight', NULL, 'BKG-2025-0013', 'CSBL2025000013',
    'SAFCO - Saudi Arabian Fertilizer Co', 'CUST-005', 'USD', 38400, 0, 1920, 36480, 36480, 0,
    'Net 30', '2025-02-20T00:00:00Z', '2025-01-20T12:00:00Z', 'paid');

-- =============================================================================
-- 6. EQUIPMENT & YARD - Container Fleet (eqy_container_fleet) - 20 records
-- =============================================================================

INSERT INTO eqy_container_fleet (id, tenant_id, container_number, iso_type_code, size_code, type_code, owner_code, operator_code, ownership_type, current_location, current_port, current_status, last_movement_date, tare_weight_kg, max_gross_weight_kg, capacity_cbm, status)
VALUES
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'MSCU1234567', '22G1', '20', 'GP', 'MSC', 'CSQT', 'owned',
    'Jebel Ali Terminal 2, Bay A12', 'AEDXB', 'available', '2025-03-01T06:00:00Z', 2300, 30480, 33.20, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'MSCU2345678', '42G1', '40', 'GP', 'MSC', 'CSQT', 'owned',
    'Jebel Ali Terminal 1, Bay C05', 'AEDXB', 'in_use', '2025-03-10T14:00:00Z', 3800, 30480, 67.70, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CMAU3456789', '45G1', '40', 'HC', 'CMA', 'CSQT', 'leased',
    'Hamad Port Terminal, Block B', 'QADOH', 'available', '2025-02-28T10:00:00Z', 3900, 30480, 76.40, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CMAU4567890', '22G1', '20', 'GP', 'CMA', 'CSQT', 'leased',
    'JNPT Terminal, Yard D', 'INMUN', 'in_use', '2025-03-05T08:00:00Z', 2300, 30480, 33.20, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSLU5678901', '42R1', '40', 'RF', 'CSL', 'CSQT', 'owned',
    'Jebel Ali Reefer Yard', 'AEDXB', 'available', '2025-03-08T12:00:00Z', 4200, 30480, 59.30, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'EGLV6789012', '42G1', '40', 'GP', 'EGL', 'CSQT', 'leased',
    'Singapore PSA Terminal, Block 7', 'SGSIN', 'in_use', '2025-03-12T16:00:00Z', 3800, 30480, 67.70, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'HLXU7890123', '45G1', '40', 'HC', 'HLC', 'CSQT', 'owned',
    'London Gateway Terminal', 'GBLGP', 'available', '2025-02-20T09:00:00Z', 3900, 30480, 76.40, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'MSCU8901234', '22G1', '20', 'GP', 'MSC', 'CSQT', 'owned',
    'Yangshan Deep Water Port', 'CNSHA', 'in_use', '2025-03-02T07:00:00Z', 2300, 30480, 33.20, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CMAU9012345', '42U1', '40', 'OT', 'CMA', 'CSQT', 'leased',
    'Europoort Terminal Rotterdam', 'NLRTM', 'available', '2025-01-15T11:00:00Z', 3600, 30480, 67.70, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSLU0123456', '22R1', '20', 'RF', 'CSL', 'CSQT', 'owned',
    'Hamad Port Reefer Yard', 'QADOH', 'under_repair', '2025-02-10T08:00:00Z', 2650, 30480, 28.30, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'EGLV1234560', '42G1', '40', 'GP', 'EGL', 'CSQT', 'leased',
    'Jubail Commercial Port', 'SAJUB', 'available', '2025-03-06T13:00:00Z', 3800, 30480, 67.70, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'HLXU2345670', '45G1', '40', 'HC', 'HLC', 'CSQT', 'owned',
    'LA/Long Beach Container Terminal', 'USLAX', 'in_use', '2025-03-14T18:00:00Z', 3900, 30480, 76.40, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'MSCU3456780', '22T6', '20', 'TK', 'MSC', 'CSQT', 'owned',
    'JNPT CFS Yard', 'INMUN', 'available', '2025-02-25T10:00:00Z', 2500, 30480, 24.00, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CMAU4567801', '42P1', '40', 'FR', 'CMA', 'CSQT', 'leased',
    'Jebel Ali Terminal 3', 'AEDXB', 'available', '2025-03-09T07:00:00Z', 4800, 45000, 0.00, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSLU5678012', '42G1', '40', 'GP', 'CSL', 'CSQT', 'owned',
    'Shuwaikh Port, Kuwait', 'KWSAA', 'in_use', '2025-03-11T15:00:00Z', 3800, 30480, 67.70, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'EGLV6789023', '22G1', '20', 'GP', 'EGL', 'CSQT', 'leased',
    'Abu Dhabi Khalifa Port', 'AEAUH', 'available', '2025-02-18T12:00:00Z', 2300, 30480, 33.20, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'HLXU7890134', '42R1', '40', 'RF', 'HLC', 'CSQT', 'owned',
    'Dubai World Central Logistics', 'AEDXB', 'available', '2025-03-07T09:00:00Z', 4200, 30480, 59.30, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'MSCU8901245', '45G1', '40', 'HC', 'MSC', 'CSQT', 'owned',
    'On vessel EVER ACE', NULL, 'in_transit', '2025-03-13T00:00:00Z', 3900, 30480, 76.40, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CMAU9012356', '22G1', '20', 'GP', 'CMA', 'CSQT', 'leased',
    'On vessel MSC ANNA', NULL, 'in_transit', '2025-03-10T00:00:00Z', 2300, 30480, 33.20, 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CSLU0123467', '42G1', '40', 'GP', 'CSL', 'CSQT', 'owned',
    'Awaiting survey at Doha depot', 'QADOH', 'under_repair', '2025-01-30T14:00:00Z', 3800, 30480, 67.70, 'active');

-- =============================================================================
-- 7a. CAPACITY & VOYAGE - Vessel Schedules (cap_vessel_schedules) - 10 records
-- =============================================================================

INSERT INTO cap_vessel_schedules (id, tenant_id, vessel_name, vessel_imo, service_name, trade_lane, schedule_type, validity_from, validity_to, frequency, total_capacity_teu, total_weight_mt, operator_name, status)
VALUES
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'MSC ANNA', '9839430',
    'Gulf Express 1 (GEX1)', 'Middle East - Indian Subcontinent', 'regular',
    '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', 'weekly', 14000, 150000,
    'CS Shipping Qatar WLL', 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'EVER GIVEN', '9811000',
    'Asia Gulf Express (AGX)', 'Middle East - Far East', 'regular',
    '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', 'weekly', 20124, 200000,
    'CS Shipping Qatar WLL', 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'CMA CGM MARCO POLO', '9454436',
    'Gulf India Express (GIX)', 'Arabian Gulf - India', 'regular',
    '2025-03-01T00:00:00Z', '2025-12-31T23:59:59Z', 'fortnightly', 16020, 170000,
    'CS Shipping Qatar WLL', 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'COSCO SHIPPING UNIVERSE', '9795610',
    'Europe Middle East India (EMI)', 'Europe - Middle East - India', 'regular',
    '2025-01-01T00:00:00Z', '2025-06-30T23:59:59Z', 'weekly', 21237, 210000,
    'CS Shipping Qatar WLL', 'completed'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'MSC GULSUN', '9839442',
    'Americas Express (AMX)', 'Middle East - Americas', 'regular',
    '2025-03-01T00:00:00Z', '2026-02-28T23:59:59Z', 'fortnightly', 23756, 240000,
    'CS Shipping Qatar WLL', 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'HMM ALGECIRAS', '9863297',
    'Gulf Feeder 1 (GF1)', 'Intra-Gulf', 'regular',
    '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', 'weekly', 23964, 250000,
    'CS Shipping Qatar WLL', 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'ONE AQUILA', '9880662',
    'Far East Gulf (FEG)', 'Far East - Middle East', 'regular',
    '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', 'weekly', 14052, 150000,
    'CS Shipping Qatar WLL', 'active'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'MAERSK EDINBURGH', '9458094',
    'India Gulf Shuttle (IGS)', 'India - Arabian Gulf', 'regular',
    '2025-01-01T00:00:00Z', '2025-06-30T23:59:59Z', 'weekly', 8500, 90000,
    'CS Shipping Qatar WLL', 'completed'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'MSC ISABELLA', '9839454',
    'SE Asia Gulf (SAG)', 'SE Asia - Middle East', 'regular',
    '2025-03-01T00:00:00Z', '2025-12-31T23:59:59Z', 'weekly', 19462, 200000,
    'CS Shipping Qatar WLL', 'draft'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e', 'EVER ACE', '9893890',
    'Gulf Singapore Direct (GSD)', 'Arabian Gulf - Singapore', 'extra_loader',
    '2025-03-10T00:00:00Z', '2025-04-30T23:59:59Z', 'monthly', 23992, 240000,
    'CS Shipping Qatar WLL', 'active');

-- =============================================================================
-- 7b. CAPACITY & VOYAGE - Port Rotations (cap_port_rotations) - 5 records
-- Port rotation for GEX1 service (MSC ANNA)
-- =============================================================================

INSERT INTO cap_port_rotations (id, tenant_id, vessel_schedule_id, port_code, port_name, sequence_number, arrival_eta, departure_etd, terminal_name, call_purpose, status)
VALUES
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e',
    (SELECT id FROM cap_vessel_schedules WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND service_name = 'Gulf Express 1 (GEX1)' LIMIT 1),
    'AEDXB', 'Dubai, Jebel Ali', 1,
    '2025-03-15T06:00:00Z', '2025-03-16T18:00:00Z',
    'DP World Jebel Ali T2', 'both', 'scheduled'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e',
    (SELECT id FROM cap_vessel_schedules WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND service_name = 'Gulf Express 1 (GEX1)' LIMIT 1),
    'QADOH', 'Doha, Hamad Port', 2,
    '2025-03-17T08:00:00Z', '2025-03-18T14:00:00Z',
    'QTerminals Hamad Port', 'both', 'scheduled'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e',
    (SELECT id FROM cap_vessel_schedules WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND service_name = 'Gulf Express 1 (GEX1)' LIMIT 1),
    'INMUN', 'Mumbai, JNPT', 3,
    '2025-03-22T06:00:00Z', '2025-03-23T20:00:00Z',
    'APM Terminals Mumbai', 'both', 'scheduled'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e',
    (SELECT id FROM cap_vessel_schedules WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND service_name = 'Gulf Express 1 (GEX1)' LIMIT 1),
    'INNSA', 'Nhava Sheva', 4,
    '2025-03-24T06:00:00Z', '2025-03-25T12:00:00Z',
    'NSIGT Terminal', 'loading', 'scheduled'),
  (gen_random_uuid(), '7f709f8d-ca75-4626-85ae-5501ddeea85e',
    (SELECT id FROM cap_vessel_schedules WHERE tenant_id = '7f709f8d-ca75-4626-85ae-5501ddeea85e' AND service_name = 'Gulf Express 1 (GEX1)' LIMIT 1),
    'AEDXB', 'Dubai, Jebel Ali', 5,
    '2025-03-29T06:00:00Z', '2025-03-30T18:00:00Z',
    'DP World Jebel Ali T2', 'both', 'scheduled');

COMMIT;
