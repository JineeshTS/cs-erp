import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Portal Bookings
// ==========================================

export const createBookingSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerName: z.string().min(1).max(255),
  originPort: z.string().min(1).max(20),
  destinationPort: z.string().min(1).max(20),
  cargoType: z.enum(["general", "reefer", "hazardous", "bulk", "breakbulk", "roro", "tank", "oversized"]),
  cargoDescription: z.string().optional(),
  containerType: z.string().max(10).optional(),
  containerCount: z.number().int().min(1).optional(),
  weight: z.number().int().optional(),
  volume: z.number().int().optional(),
  preferredVesselDate: z.coerce.date().optional(),
  specialRequirements: z.record(z.string(), z.unknown()).optional(),
  hazardous: z.boolean().optional(),
  temperature: z.number().int().optional(),
  incoterm: z.enum(["FOB", "CIF", "CFR", "EXW", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP"]).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateBookingSchema = createBookingSchema.partial();

export const cancelBookingSchema = z.object({
  reason: z.string().min(1),
});

// ==========================================
// Booking Containers
// ==========================================

export const createBookingContainerSchema = z.object({
  bookingId: z.string().uuid(),
  containerNumber: z.string().max(20).optional(),
  containerType: z.enum(["20GP", "40GP", "40HC", "20RF", "40RF", "20OT", "40OT", "20FR", "40FR"]),
  sealNumber: z.string().max(50).optional(),
  weight: z.number().int().optional(),
  volume: z.number().int().optional(),
  cargoDescription: z.string().optional(),
  hazardous: z.boolean().optional(),
  temperature: z.number().int().optional(),
  notes: z.string().optional(),
});

// ==========================================
// Shipment Tracking
// ==========================================

export const createTrackingSchema = z.object({
  bookingId: z.string().uuid().optional(),
  blNumber: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  originPort: z.string().min(1).max(20),
  destinationPort: z.string().min(1).max(20),
  currentPort: z.string().max(20).optional(),
  currentStatus: z.enum(["booked", "in_transit", "at_port", "customs_hold", "delivered", "returned"]).optional(),
  eta: z.coerce.date().optional(),
  etd: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateTrackingSchema = createTrackingSchema.partial();

// ==========================================
// Tracking Events
// ==========================================

export const createTrackingEventSchema = z.object({
  trackingId: z.string().uuid(),
  eventCode: z.enum(["BOOKED", "GATE_IN", "LOADED", "DEPARTED", "IN_TRANSIT", "ARRIVED", "DISCHARGED", "CUSTOMS_HOLD", "CUSTOMS_RELEASED", "GATE_OUT", "DELIVERED", "RETURNED"]),
  eventDescription: z.string().min(1),
  location: z.string().max(100).optional(),
  portCode: z.string().max(20).optional(),
  eventTime: z.coerce.date(),
  isPublic: z.boolean().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
});

// ==========================================
// Portal Documents
// ==========================================

export const createDocumentSchema = z.object({
  documentType: z.enum(["bill_of_lading", "commercial_invoice", "packing_list", "certificate_of_origin", "customs_declaration", "delivery_order", "freight_invoice", "insurance_cert", "inspection_cert", "other"]),
  documentName: z.string().min(1).max(255),
  bookingId: z.string().uuid().optional(),
  blNumber: z.string().max(50).optional(),
  fileUrl: z.string().max(500).optional(),
  fileSize: z.number().int().optional(),
  mimeType: z.string().max(100).optional(),
  status: z.enum(["pending", "available", "expired", "revoked"]).optional(),
  isCustomerVisible: z.boolean().optional(),
  expiresAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateDocumentSchema = createDocumentSchema.partial();

// ==========================================
// Portal Invoices
// ==========================================

export const createInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  bookingId: z.string().uuid().optional(),
  invoiceType: z.enum(["freight", "demurrage", "detention", "documentation", "surcharge", "credit_note", "debit_note"]),
  currency: z.string().max(3).optional(),
  subtotal: z.number().int(),
  taxAmount: z.number().int().optional(),
  totalAmount: z.number().int(),
  balanceDue: z.number().int(),
  dueDate: z.coerce.date().optional(),
  lineItems: z.array(z.record(z.string(), z.unknown())).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

// ==========================================
// Portal Payments
// ==========================================

export const createPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().int().min(1),
  currency: z.string().max(3).optional(),
  paymentMethod: z.enum(["credit_card", "bank_transfer", "wire", "cheque", "online_banking", "letter_of_credit"]),
  gatewayProvider: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
