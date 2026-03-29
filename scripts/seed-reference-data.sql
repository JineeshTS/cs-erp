-- ERP-108: Reference data seed for CS-ERP
-- Run per tenant: SET app.tenant_id = '<tenant-uuid>'; \i seed-reference-data.sql
-- Or pass tenant_id as psql variable: psql -v tenant_id="'<uuid>'" -f seed-reference-data.sql

DO $$
DECLARE
  tid UUID := current_setting('app.tenant_id')::uuid;
BEGIN

-- ══════════════════════════════════════════════════════
-- REGIONS (7 major shipping regions)
-- ══════════════════════════════════════════════════════
INSERT INTO mdm_regions (tenant_id, code, name, region_type) VALUES
  (tid, 'ME', 'Middle East', 'geographic'),
  (tid, 'ISC', 'Indian Subcontinent', 'geographic'),
  (tid, 'SEA', 'South East Asia', 'geographic'),
  (tid, 'FE', 'Far East', 'geographic'),
  (tid, 'EUR', 'Europe', 'geographic'),
  (tid, 'NAM', 'North America', 'geographic'),
  (tid, 'AFR', 'Africa', 'geographic'),
  (tid, 'SAM', 'South America', 'geographic'),
  (tid, 'OCE', 'Oceania', 'geographic'),
  (tid, 'MED', 'Mediterranean', 'geographic')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- ISO 4217 CURRENCIES (50 most used in shipping)
-- ══════════════════════════════════════════════════════
INSERT INTO mdm_currencies (tenant_id, code, name, symbol, decimal_places) VALUES
  (tid, 'USD', 'US Dollar', '$', 2),
  (tid, 'EUR', 'Euro', '€', 2),
  (tid, 'GBP', 'British Pound', '£', 2),
  (tid, 'AED', 'UAE Dirham', 'د.إ', 2),
  (tid, 'QAR', 'Qatari Riyal', 'ر.ق', 2),
  (tid, 'SAR', 'Saudi Riyal', 'ر.س', 2),
  (tid, 'OMR', 'Omani Rial', 'ر.ع', 3),
  (tid, 'BHD', 'Bahraini Dinar', 'د.ب', 3),
  (tid, 'KWD', 'Kuwaiti Dinar', 'د.ك', 3),
  (tid, 'INR', 'Indian Rupee', '₹', 2),
  (tid, 'PKR', 'Pakistani Rupee', '₨', 2),
  (tid, 'BDT', 'Bangladeshi Taka', '৳', 2),
  (tid, 'LKR', 'Sri Lankan Rupee', 'රු', 2),
  (tid, 'CNY', 'Chinese Yuan', '¥', 2),
  (tid, 'JPY', 'Japanese Yen', '¥', 0),
  (tid, 'KRW', 'South Korean Won', '₩', 0),
  (tid, 'SGD', 'Singapore Dollar', 'S$', 2),
  (tid, 'MYR', 'Malaysian Ringgit', 'RM', 2),
  (tid, 'THB', 'Thai Baht', '฿', 2),
  (tid, 'IDR', 'Indonesian Rupiah', 'Rp', 0),
  (tid, 'PHP', 'Philippine Peso', '₱', 2),
  (tid, 'VND', 'Vietnamese Dong', '₫', 0),
  (tid, 'TWD', 'Taiwan Dollar', 'NT$', 2),
  (tid, 'HKD', 'Hong Kong Dollar', 'HK$', 2),
  (tid, 'AUD', 'Australian Dollar', 'A$', 2),
  (tid, 'NZD', 'New Zealand Dollar', 'NZ$', 2),
  (tid, 'ZAR', 'South African Rand', 'R', 2),
  (tid, 'KES', 'Kenyan Shilling', 'KSh', 2),
  (tid, 'NGN', 'Nigerian Naira', '₦', 2),
  (tid, 'EGP', 'Egyptian Pound', 'E£', 2),
  (tid, 'TRY', 'Turkish Lira', '₺', 2),
  (tid, 'CHF', 'Swiss Franc', 'CHF', 2),
  (tid, 'NOK', 'Norwegian Krone', 'kr', 2),
  (tid, 'SEK', 'Swedish Krona', 'kr', 2),
  (tid, 'DKK', 'Danish Krone', 'kr', 2),
  (tid, 'CAD', 'Canadian Dollar', 'C$', 2),
  (tid, 'BRL', 'Brazilian Real', 'R$', 2),
  (tid, 'MXN', 'Mexican Peso', 'Mex$', 2),
  (tid, 'RUB', 'Russian Ruble', '₽', 2),
  (tid, 'IQD', 'Iraqi Dinar', 'ع.د', 3)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- ISO 3166-1 COUNTRIES (75 key shipping nations)
-- ══════════════════════════════════════════════════════
INSERT INTO mdm_countries (tenant_id, code, code3, name, phone_code, region_id) VALUES
  -- Middle East
  (tid, 'AE', 'ARE', 'United Arab Emirates', '+971', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME')),
  (tid, 'QA', 'QAT', 'Qatar', '+974', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME')),
  (tid, 'SA', 'SAU', 'Saudi Arabia', '+966', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME')),
  (tid, 'OM', 'OMN', 'Oman', '+968', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME')),
  (tid, 'BH', 'BHR', 'Bahrain', '+973', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME')),
  (tid, 'KW', 'KWT', 'Kuwait', '+965', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME')),
  (tid, 'IQ', 'IRQ', 'Iraq', '+964', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME')),
  (tid, 'IR', 'IRN', 'Iran', '+98', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME')),
  (tid, 'JO', 'JOR', 'Jordan', '+962', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME')),
  -- Indian Subcontinent
  (tid, 'IN', 'IND', 'India', '+91', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ISC')),
  (tid, 'PK', 'PAK', 'Pakistan', '+92', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ISC')),
  (tid, 'BD', 'BGD', 'Bangladesh', '+880', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ISC')),
  (tid, 'LK', 'LKA', 'Sri Lanka', '+94', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ISC')),
  -- South East Asia
  (tid, 'SG', 'SGP', 'Singapore', '+65', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='SEA')),
  (tid, 'MY', 'MYS', 'Malaysia', '+60', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='SEA')),
  (tid, 'TH', 'THA', 'Thailand', '+66', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='SEA')),
  (tid, 'ID', 'IDN', 'Indonesia', '+62', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='SEA')),
  (tid, 'PH', 'PHL', 'Philippines', '+63', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='SEA')),
  (tid, 'VN', 'VNM', 'Vietnam', '+84', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='SEA')),
  -- Far East
  (tid, 'CN', 'CHN', 'China', '+86', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='FE')),
  (tid, 'JP', 'JPN', 'Japan', '+81', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='FE')),
  (tid, 'KR', 'KOR', 'South Korea', '+82', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='FE')),
  (tid, 'TW', 'TWN', 'Taiwan', '+886', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='FE')),
  (tid, 'HK', 'HKG', 'Hong Kong', '+852', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='FE')),
  -- Europe
  (tid, 'GB', 'GBR', 'United Kingdom', '+44', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR')),
  (tid, 'DE', 'DEU', 'Germany', '+49', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR')),
  (tid, 'NL', 'NLD', 'Netherlands', '+31', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR')),
  (tid, 'FR', 'FRA', 'France', '+33', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR')),
  (tid, 'IT', 'ITA', 'Italy', '+39', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR')),
  (tid, 'ES', 'ESP', 'Spain', '+34', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR')),
  (tid, 'BE', 'BEL', 'Belgium', '+32', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR')),
  (tid, 'GR', 'GRC', 'Greece', '+30', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR')),
  (tid, 'TR', 'TUR', 'Turkey', '+90', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR')),
  (tid, 'NO', 'NOR', 'Norway', '+47', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR')),
  -- North America
  (tid, 'US', 'USA', 'United States', '+1', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='NAM')),
  (tid, 'CA', 'CAN', 'Canada', '+1', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='NAM')),
  (tid, 'MX', 'MEX', 'Mexico', '+52', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='NAM')),
  (tid, 'PA', 'PAN', 'Panama', '+507', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='NAM')),
  -- Africa
  (tid, 'ZA', 'ZAF', 'South Africa', '+27', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='AFR')),
  (tid, 'KE', 'KEN', 'Kenya', '+254', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='AFR')),
  (tid, 'NG', 'NGA', 'Nigeria', '+234', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='AFR')),
  (tid, 'EG', 'EGY', 'Egypt', '+20', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='AFR')),
  (tid, 'TZ', 'TZA', 'Tanzania', '+255', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='AFR')),
  (tid, 'DJ', 'DJI', 'Djibouti', '+253', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='AFR')),
  -- Oceania
  (tid, 'AU', 'AUS', 'Australia', '+61', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='OCE')),
  (tid, 'NZ', 'NZL', 'New Zealand', '+64', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='OCE')),
  -- South America
  (tid, 'BR', 'BRA', 'Brazil', '+55', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='SAM'))
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- TRADE LANES (12 major containerized trade lanes)
-- ══════════════════════════════════════════════════════
INSERT INTO mdm_trade_lanes (tenant_id, code, name, origin_region_id, destination_region_id, direction) VALUES
  (tid, 'TP-EB', 'Transpacific Eastbound', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='FE'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='NAM'), 'eastbound'),
  (tid, 'TP-WB', 'Transpacific Westbound', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='NAM'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='FE'), 'westbound'),
  (tid, 'AE-EB', 'Asia-Europe Eastbound', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='FE'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR'), 'eastbound'),
  (tid, 'AE-WB', 'Asia-Europe Westbound', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='FE'), 'westbound'),
  (tid, 'TA-EB', 'Transatlantic Eastbound', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='NAM'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR'), 'eastbound'),
  (tid, 'TA-WB', 'Transatlantic Westbound', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='NAM'), 'westbound'),
  (tid, 'IGX', 'Indo-Gulf Express', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ISC'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME'), 'both'),
  (tid, 'GIS', 'Gulf-ISC Service', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ISC'), 'both'),
  (tid, 'FEG', 'Far East-Gulf', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='FE'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME'), 'both'),
  (tid, 'IAS', 'Intra-Asia', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='SEA'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='FE'), 'both'),
  (tid, 'AFX', 'Africa Express', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='ME'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='AFR'), 'both'),
  (tid, 'MED', 'Mediterranean Loop', (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='MED'), (SELECT id FROM mdm_regions WHERE tenant_id=tid AND code='EUR'), 'both')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- VESSEL CLASSES (8 standard container vessel classes)
-- ══════════════════════════════════════════════════════
INSERT INTO mdm_vessel_classes (tenant_id, code, name, min_teu, max_teu, min_dwt, max_dwt, description) VALUES
  (tid, 'FEEDER', 'Feeder', 100, 999, 3000, 14000, 'Small vessels for feeder/short-sea routes'),
  (tid, 'FEEDRMAX', 'Feedermax', 1000, 2999, 14000, 35000, 'Larger feeder vessels for regional services'),
  (tid, 'HANDY', 'Handysize', 3000, 4999, 35000, 50000, 'Handysize container vessels'),
  (tid, 'SUBPMAX', 'Sub-Panamax', 5000, 7999, 50000, 80000, 'Below old Panama Canal maximum'),
  (tid, 'PANAMAX', 'Panamax', 8000, 11999, 80000, 100000, 'Maximum size for old Panama Canal locks'),
  (tid, 'NEOPMAX', 'Neo-Panamax', 12000, 16999, 100000, 160000, 'Maximum for new Panama Canal locks'),
  (tid, 'ULCV', 'Ultra Large Container Vessel', 17000, 23999, 160000, 230000, 'ULCV class for major trunk routes'),
  (tid, 'MEGAMAX', 'Megamax-24', 24000, 99999, 230000, 300000, 'Largest container vessels in service')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════
-- DEFAULT TAX RATES
-- ══════════════════════════════════════════════════════
INSERT INTO mdm_tax_rates (tenant_id, jurisdiction, tax_type, rate_percent, description) VALUES
  (tid, 'AE', 'VAT', 5.00, 'UAE VAT (standard rate)'),
  (tid, 'SA', 'VAT', 15.00, 'KSA VAT (standard rate)'),
  (tid, 'QA', 'VAT', 0.00, 'Qatar — no VAT'),
  (tid, 'OM', 'VAT', 5.00, 'Oman VAT (standard rate)'),
  (tid, 'BH', 'VAT', 10.00, 'Bahrain VAT (2025 rate)'),
  (tid, 'KW', 'VAT', 0.00, 'Kuwait — no VAT yet'),
  (tid, 'IN', 'GST', 18.00, 'India GST (standard rate)'),
  (tid, 'GB', 'VAT', 20.00, 'UK VAT (standard rate)'),
  (tid, 'US', 'NONE', 0.00, 'US — no federal VAT'),
  (tid, 'SG', 'GST', 9.00, 'Singapore GST (2024 rate)')
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Reference data seeded for tenant %', tid;
END;
$$;
