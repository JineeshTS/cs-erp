import { z } from "zod/v4";

// ==========================================
// Freight Invoices
// ==========================================

export const createFreightInvoiceSchema = z.object({
  invoiceType: z.enum(["freight", "demurrage", "detention", "surcharge", "combined", "other"]),
  voyageRef: z.string().max(50).optional(),
  bookingRef: z.string().max(50).optional(),
  blNumber: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  customerCode: z.string().max(50).optional(),
  billingAddress: z.string().optional(),
  currency: z.string().max(3).optional(),
  subtotal: z.number().int().optional(),
  taxAmount: z.number().int().optional(),
  discountAmount: z.number().int().optional(),
  totalAmount: z.number().int(),
  paymentTerms: z.string().max(50).optional(),
  dueDate: z.coerce.date().optional(),
  dispatchMethod: z.enum(["email", "post", "portal", "edi", "manual"]).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateFreightInvoiceSchema = createFreightInvoiceSchema.partial();

// ==========================================
// Invoice Line Items
// ==========================================

export const createInvoiceLineItemSchema = z.object({
  invoiceId: z.string().uuid(),
  lineNumber: z.number().int().min(1),
  chargeCode: z.string().min(1).max(30),
  description: z.string().min(1),
  containerNumber: z.string().max(20).optional(),
  containerType: z.string().max(30).optional(),
  quantity: z.number().int().min(1).optional(),
  unitPrice: z.number().int(),
  currency: z.string().max(3).optional(),
  amount: z.number().int(),
  taxRate: z.number().int().optional(),
  taxAmount: z.number().int().optional(),
  totalAmount: z.number().int(),
  tariffRef: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateInvoiceLineItemSchema = createInvoiceLineItemSchema.partial();

// ==========================================
// Debit/Credit Notes
// ==========================================

export const createDebitCreditNoteSchema = z.object({
  noteType: z.enum(["debit", "credit"]),
  invoiceId: z.string().uuid().optional(),
  invoiceNumber: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  customerCode: z.string().max(50).optional(),
  reason: z.string().min(1).max(100),
  description: z.string().optional(),
  currency: z.string().max(3).optional(),
  amount: z.number().int(),
  taxAmount: z.number().int().optional(),
  totalAmount: z.number().int(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDebitCreditNoteSchema = createDebitCreditNoteSchema.partial();

// ==========================================
// Invoice Amendments
// ==========================================

export const createInvoiceAmendmentSchema = z.object({
  originalInvoiceId: z.string().uuid(),
  originalInvoiceNumber: z.string().min(1).max(50),
  amendmentType: z.enum(["correction", "rate_change", "quantity_change", "charge_addition", "charge_removal", "full_reissue"]),
  reason: z.string().min(1).max(255),
  description: z.string().optional(),
  previousAmount: z.number().int(),
  newAmount: z.number().int(),
  adjustmentAmount: z.number().int(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateInvoiceAmendmentSchema = createInvoiceAmendmentSchema.partial();

// ==========================================
// Proforma Invoices
// ==========================================

export const createProformaInvoiceSchema = z.object({
  voyageRef: z.string().max(50).optional(),
  bookingRef: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  customerCode: z.string().max(50).optional(),
  currency: z.string().max(3).optional(),
  subtotal: z.number().int().optional(),
  taxAmount: z.number().int().optional(),
  totalAmount: z.number().int(),
  validUntil: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateProformaInvoiceSchema = createProformaInvoiceSchema.partial();

// ==========================================
// Revenue Accruals
// ==========================================

export const createRevenueAccrualSchema = z.object({
  voyageRef: z.string().max(50).optional(),
  invoiceId: z.string().uuid().optional(),
  accrualType: z.enum(["freight_accrual", "freight_deferral", "demurrage_accrual", "surcharge_accrual", "period_end_accrual", "reversal"]),
  accountingPeriod: z.string().min(1).max(20),
  currency: z.string().max(3).optional(),
  accrualAmount: z.number().int(),
  deferralAmount: z.number().int().optional(),
  recognizedAmount: z.number().int().optional(),
  remainingAmount: z.number().int(),
  journalEntryRef: z.string().max(50).optional(),
  glAccountCode: z.string().max(30).optional(),
  reversalDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateRevenueAccrualSchema = createRevenueAccrualSchema.partial();

// ==========================================
// Invoice Disputes
// ==========================================

export const createInvoiceDisputeSchema = z.object({
  invoiceId: z.string().uuid(),
  invoiceNumber: z.string().min(1).max(50),
  customerName: z.string().min(1).max(255),
  disputeType: z.enum(["rate_dispute", "quantity_dispute", "charge_dispute", "documentation_error", "service_issue", "duplicate_billing", "other"]),
  disputedAmount: z.number().int(),
  currency: z.string().max(3).optional(),
  reason: z.string().min(1),
  assignedToName: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateInvoiceDisputeSchema = createInvoiceDisputeSchema.partial();

// ==========================================
// Dunning Runs
// ==========================================

export const createDunningRunSchema = z.object({
  runType: z.enum(["automated", "manual", "ai_recommended", "escalation", "final_notice"]),
  targetSegment: z.string().max(50).optional(),
  currency: z.string().max(3).optional(),
  totalOutstanding: z.number().int().optional(),
  invoicesTargeted: z.number().int().optional(),
  customersTargeted: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDunningRunSchema = createDunningRunSchema.partial();

// ==========================================
// Dunning Actions
// ==========================================

export const createDunningActionSchema = z.object({
  runId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  invoiceNumber: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  actionType: z.enum(["reminder", "follow_up", "demand_letter", "phone_call", "legal_notice", "collection_agency", "write_off"]),
  dunningLevel: z.number().int().min(1).max(10).optional(),
  currency: z.string().max(3).optional(),
  outstandingAmount: z.number().int(),
  daysPastDue: z.number().int().optional(),
  contactMethod: z.enum(["email", "phone", "letter", "portal", "sms"]).optional(),
  contactDetails: z.string().optional(),
  messageTemplate: z.string().max(100).optional(),
  promisedDate: z.coerce.date().optional(),
  promisedAmount: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDunningActionSchema = createDunningActionSchema.partial();

// ==========================================
// Revenue Forecast Entries
// ==========================================

export const createRevenueForecastEntrySchema = z.object({
  forecastPeriod: z.string().min(1).max(20),
  forecastYear: z.number().int().min(2000).max(2100),
  forecastMonth: z.number().int().min(1).max(12).optional(),
  serviceRoute: z.string().max(100).optional(),
  customerSegment: z.string().max(50).optional(),
  currency: z.string().max(3).optional(),
  forecastRevenue: z.number().int(),
  pipelineValue: z.number().int().optional(),
  confirmedValue: z.number().int().optional(),
  probabilityPercent: z.number().int().min(0).max(100).optional(),
  forecastMethod: z.enum(["historical_trend", "ai_model", "manual", "bottom_up", "top_down", "weighted_pipeline"]).optional(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateRevenueForecastEntrySchema = createRevenueForecastEntrySchema.partial();
