import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Vendor Masters
// ==========================================

export const createVendorMasterSchema = z.object({
  vendorName: z.string().min(1).max(255),
  tradingName: z.string().max(255).optional(),
  vendorType: z.enum(["supplier", "contractor", "agent", "port_authority", "terminal", "carrier", "freight_forwarder", "other"]),
  registrationNumber: z.string().max(100).optional(),
  taxId: z.string().max(50).optional(),
  industry: z.string().max(100).optional(),
  country: z.string().max(3).optional(),
  currency: z.string().max(3).optional(),
  paymentTerms: z.string().max(50).optional(),
  bankName: z.string().max(255).optional(),
  bankAccountNumber: z.string().max(50).optional(),
  bankSwiftCode: z.string().max(20).optional(),
  bankIban: z.string().max(50).optional(),
  contactName: z.string().max(255).optional(),
  contactEmail: z.string().max(255).optional(),
  contactPhone: z.string().max(50).optional(),
  address: z.string().optional(),
  riskRating: z.enum(["low", "medium", "high", "critical"]).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateVendorMasterSchema = createVendorMasterSchema.partial();

// ==========================================
// Purchase Orders
// ==========================================

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().uuid().optional(),
  vendorCode: z.string().max(50).optional(),
  vendorName: z.string().min(1).max(255),
  poType: z.enum(["standard", "blanket", "contract", "emergency", "service", "other"]),
  description: z.string().optional(),
  currency: z.string().max(3).optional(),
  subtotal: z.number().int().optional(),
  taxAmount: z.number().int().optional(),
  totalAmount: z.number().int(),
  deliveryDate: z.coerce.date().optional(),
  deliveryAddress: z.string().optional(),
  lineItems: z.record(z.string(), z.unknown()).optional(),
  paymentTerms: z.string().max(50).optional(),
  budgetCode: z.string().max(50).optional(),
  costCentre: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePurchaseOrderSchema = createPurchaseOrderSchema.partial();

// ==========================================
// Vendor Invoices
// ==========================================

export const createVendorInvoiceSchema = z.object({
  vendorInvoiceRef: z.string().max(100).optional(),
  vendorId: z.string().uuid().optional(),
  vendorCode: z.string().max(50).optional(),
  vendorName: z.string().min(1).max(255),
  poId: z.string().uuid().optional(),
  poNumber: z.string().max(50).optional(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  currency: z.string().max(3).optional(),
  subtotal: z.number().int().optional(),
  taxAmount: z.number().int().optional(),
  totalAmount: z.number().int(),
  lineItems: z.record(z.string(), z.unknown()).optional(),
  exchangeRate: z.number().int().optional(),
  baseCurrencyAmount: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateVendorInvoiceSchema = createVendorInvoiceSchema.partial();

// ==========================================
// Three-Way Matches
// ==========================================

export const createThreeWayMatchSchema = z.object({
  invoiceId: z.string().uuid().optional(),
  invoiceNumber: z.string().max(50).optional(),
  poId: z.string().uuid().optional(),
  poNumber: z.string().max(50).optional(),
  vendorName: z.string().min(1).max(255),
  currency: z.string().max(3).optional(),
  poAmount: z.number().int(),
  grAmount: z.number().int(),
  invoiceAmount: z.number().int(),
  tolerancePercent: z.number().int().min(0).max(100).optional(),
  lineMatchDetails: z.record(z.string(), z.unknown()).optional(),
  exceptionReason: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateThreeWayMatchSchema = createThreeWayMatchSchema.partial();

// ==========================================
// Payment Schedules
// ==========================================

export const createPaymentScheduleSchema = z.object({
  vendorId: z.string().uuid().optional(),
  vendorName: z.string().min(1).max(255),
  invoiceId: z.string().uuid().optional(),
  invoiceNumber: z.string().max(50).optional(),
  currency: z.string().max(3).optional(),
  paymentAmount: z.number().int(),
  scheduledDate: z.coerce.date(),
  paymentMethod: z.enum(["bank_transfer", "cheque", "cash", "lc", "direct_debit", "wire", "other"]),
  bankAccount: z.string().max(50).optional(),
  beneficiaryAccount: z.string().max(50).optional(),
  exchangeRate: z.number().int().optional(),
  baseCurrencyAmount: z.number().int().optional(),
  batchId: z.string().max(50).optional(),
  priorityLevel: z.enum(["low", "normal", "high", "urgent"]).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePaymentScheduleSchema = createPaymentScheduleSchema.partial();

// ==========================================
// Vendor Reconciliations
// ==========================================

export const createVendorReconciliationSchema = z.object({
  vendorId: z.string().uuid().optional(),
  vendorName: z.string().min(1).max(255),
  reconciliationDate: z.coerce.date(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  currency: z.string().max(3).optional(),
  ourBalance: z.number().int(),
  vendorBalance: z.number().int(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateVendorReconciliationSchema = createVendorReconciliationSchema.partial();

// ==========================================
// OCR Extractions
// ==========================================

export const createOcrExtractionSchema = z.object({
  documentId: z.string().max(100).optional(),
  fileName: z.string().min(1).max(255),
  fileType: z.enum(["pdf", "jpg", "png", "tiff", "other"]),
  fileSize: z.number().int().optional(),
  vendorName: z.string().max(255).optional(),
  aiModelVersion: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateOcrExtractionSchema = createOcrExtractionSchema.partial();

// ==========================================
// Spend Analytics
// ==========================================

export const createSpendAnalyticSchema = z.object({
  reportType: z.enum(["monthly", "quarterly", "annual", "vendor", "category", "department", "custom"]),
  reportPeriod: z.string().min(1).max(10),
  reportYear: z.number().int().min(2020).max(2050),
  reportMonth: z.number().int().min(1).max(12),
  currency: z.string().max(3).optional(),
  aiModelVersion: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateSpendAnalyticSchema = createSpendAnalyticSchema.partial();
