import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Demurrage Calculations
// ==========================================

export const createDemurrageCalculationSchema = z.object({
  containerNumber: z.string().min(1).max(20),
  containerSize: z.enum(["20", "40", "40HC", "45"]),
  containerType: z.enum(["dry", "reefer", "open_top", "flat_rack", "tank", "other"]),
  bookingRef: z.string().max(50).optional(),
  blNumber: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  portName: z.string().min(1).max(255),
  portCountry: z.string().max(100).optional(),
  terminalName: z.string().max(255).optional(),
  dischargeDate: z.coerce.date(),
  gateOutDate: z.coerce.date().optional(),
  freeTimeDays: z.number().int().min(0),
  freeTimeExpiry: z.coerce.date(),
  demurrageDays: z.number().int().optional(),
  dailyRate: z.string(),
  totalAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  tariffName: z.string().max(255).optional(),
  calculationBreakdown: z.record(z.string(), z.unknown()).optional(),
  autoCalculated: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDemurrageCalculationSchema = createDemurrageCalculationSchema.partial();

// ==========================================
// Free Time Rules
// ==========================================

export const createFreeTimeRuleSchema = z.object({
  ruleName: z.string().min(1).max(255),
  ruleType: z.enum(["demurrage", "detention", "combined"]),
  applicableTo: z.enum(["all", "port", "customer", "container_type", "trade_lane"]),
  portName: z.string().max(255).optional(),
  portCountry: z.string().max(100).optional(),
  containerSize: z.string().max(10).optional(),
  containerType: z.string().max(30).optional(),
  customerName: z.string().max(255).optional(),
  freeTimeDays: z.number().int().min(0),
  gracePeriodDays: z.number().int().optional(),
  weekendsExcluded: z.boolean().optional(),
  holidaysExcluded: z.boolean().optional(),
  holidayCalendar: z.array(z.record(z.string(), z.unknown())).optional(),
  tierStructure: z.array(z.record(z.string(), z.unknown())).optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  priority: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateFreeTimeRuleSchema = createFreeTimeRuleSchema.partial();

// ==========================================
// Detention Trackings
// ==========================================

export const createDetentionTrackingSchema = z.object({
  containerNumber: z.string().min(1).max(20),
  containerSize: z.enum(["20", "40", "40HC", "45"]),
  containerType: z.enum(["dry", "reefer", "open_top", "flat_rack", "tank", "other"]),
  bookingRef: z.string().max(50).optional(),
  blNumber: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  gateOutDate: z.coerce.date(),
  gateInDate: z.coerce.date().optional(),
  freeTimeDays: z.number().int().min(0),
  freeTimeExpiry: z.coerce.date(),
  detentionDays: z.number().int().optional(),
  dailyRate: z.string(),
  totalAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  depotName: z.string().max(255).optional(),
  depotLocation: z.string().max(255).optional(),
  containerCondition: z.enum(["good", "damaged", "needs_repair", "condemned"]).optional(),
  damageNotes: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDetentionTrackingSchema = createDetentionTrackingSchema.partial();

// ==========================================
// D&D Invoices
// ==========================================

export const createDdmInvoiceSchema = z.object({
  invoiceType: z.enum(["demurrage", "detention", "combined"]),
  customerName: z.string().min(1).max(255),
  customerCode: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  bookingRef: z.string().max(50).optional(),
  blNumber: z.string().max(50).optional(),
  demurrageAmount: z.string().optional(),
  detentionAmount: z.string().optional(),
  subtotal: z.string().optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
  totalAmount: z.string(),
  currency: z.string().max(3).optional(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  lineItems: z.array(z.record(z.string(), z.unknown())).optional(),
  dispatchMethod: z.enum(["email", "postal", "portal", "edi"]).optional(),
  customerEmail: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDdmInvoiceSchema = createDdmInvoiceSchema.partial();

// ==========================================
// D&D Disputes
// ==========================================

export const createDdmDisputeSchema = z.object({
  invoiceRef: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  containerNumber: z.string().max(20).optional(),
  disputeType: z.enum(["free_time", "calculation_error", "gate_date", "tariff_rate", "waiver_request", "other"]),
  disputeReason: z.string().min(1),
  disputedAmount: z.string(),
  originalAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  filedDate: z.coerce.date(),
  filedByName: z.string().max(255).optional(),
  assignedToName: z.string().max(255).optional(),
  supportingDocuments: z.array(z.record(z.string(), z.unknown())).optional(),
  resolutionNotes: z.string().optional(),
  resolvedAmount: z.string().optional(),
  resolvedDate: z.coerce.date().optional(),
  resolvedByName: z.string().max(255).optional(),
  escalationLevel: z.number().int().optional(),
  slaDeadline: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDdmDisputeSchema = createDdmDisputeSchema.partial();

// ==========================================
// D&D Waivers
// ==========================================

export const createDdmWaiverSchema = z.object({
  waiverType: z.enum(["full", "partial", "percentage", "time_extension"]),
  customerName: z.string().min(1).max(255),
  containerNumber: z.string().max(20).optional(),
  invoiceRef: z.string().max(50).optional(),
  originalAmount: z.string(),
  waivedAmount: z.string(),
  waiverPercent: z.string().optional(),
  remainingAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  reason: z.string().min(1),
  justification: z.string().optional(),
  requestedByName: z.string().max(255).optional(),
  requestedDate: z.coerce.date(),
  approvedByName: z.string().max(255).optional(),
  approvedDate: z.coerce.date().optional(),
  approvalLevel: z.number().int().optional(),
  conditions: z.string().optional(),
  expiryDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDdmWaiverSchema = createDdmWaiverSchema.partial();

// ==========================================
// D&D Predictions
// ==========================================

export const createDdmPredictionSchema = z.object({
  containerNumber: z.string().min(1).max(20),
  bookingRef: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  portName: z.string().max(255).optional(),
  predictionType: z.enum(["demurrage", "detention", "combined"]),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  predictedDemurrageDays: z.number().int().optional(),
  predictedDetentionDays: z.number().int().optional(),
  predictedAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  confidenceScore: z.string().optional(),
  modelVersion: z.string().max(50).optional(),
  inputFeatures: z.record(z.string(), z.unknown()).optional(),
  triggerFactors: z.array(z.record(z.string(), z.unknown())).optional(),
  recommendations: z.array(z.record(z.string(), z.unknown())).optional(),
  aiInsights: z.string().optional(),
  alertSent: z.boolean().optional(),
  alertSentAt: z.coerce.date().optional(),
  actualOutcome: z.string().optional(),
  accuracy: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDdmPredictionSchema = createDdmPredictionSchema.partial();

// ==========================================
// D&D Notifications
// ==========================================

export const createDdmNotificationSchema = z.object({
  notificationType: z.enum(["free_time_expiry", "demurrage_start", "detention_start", "invoice", "reminder", "escalation", "custom"]),
  channel: z.enum(["email", "sms", "portal", "whatsapp"]),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().max(255).optional(),
  customerPhone: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  bookingRef: z.string().max(50).optional(),
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  templateName: z.string().max(255).optional(),
  templateVariables: z.record(z.string(), z.unknown()).optional(),
  scheduledAt: z.coerce.date().optional(),
  relatedEntityType: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDdmNotificationSchema = createDdmNotificationSchema.partial();
