-- Migration 0090: Add UUID FK columns for data integrity
-- These columns will store proper UUID references alongside existing varchar columns.
-- Existing varchar columns are kept for backward compatibility.

-- csp_portal_bookings: add customer_uuid linking to mdm_customers.id
ALTER TABLE csp_portal_bookings ADD COLUMN IF NOT EXISTS customer_uuid UUID;

-- odm_bills_of_lading: add booking_uuid linking to csp_portal_bookings.id
ALTER TABLE odm_bills_of_lading ADD COLUMN IF NOT EXISTS booking_uuid UUID;

-- firm_freight_invoices: add bl_uuid linking to odm_bills_of_lading.id
ALTER TABLE firm_freight_invoices ADD COLUMN IF NOT EXISTS bl_uuid UUID;

-- firm_freight_invoices: add customer_uuid linking to mdm_customers.id
ALTER TABLE firm_freight_invoices ADD COLUMN IF NOT EXISTS customer_uuid UUID;

-- Create indexes on the new columns
CREATE INDEX IF NOT EXISTS idx_bookings_customer_uuid ON csp_portal_bookings(customer_uuid);
CREATE INDEX IF NOT EXISTS idx_bl_booking_uuid ON odm_bills_of_lading(booking_uuid);
CREATE INDEX IF NOT EXISTS idx_invoice_bl_uuid ON firm_freight_invoices(bl_uuid);
CREATE INDEX IF NOT EXISTS idx_invoice_customer_uuid ON firm_freight_invoices(customer_uuid);
