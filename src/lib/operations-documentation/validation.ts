import { z } from "zod/v4";

// ==========================================
// Bills of Lading
// ==========================================

export const createBillOfLadingSchema = z.object({
  blNumber: z.string().min(1).max(50),
  blType: z.enum(["original", "seaway", "switch", "express", "house"]).optional(),
  blStatus: z.enum(["draft", "confirmed", "printed", "released", "surrendered", "accomplished"]).optional(),
  bookingReference: z.string().max(50).optional(),
  shipperName: z.string().min(1).max(255),
  shipperAddress: z.string().optional(),
  consigneeName: z.string().min(1).max(255),
  consigneeAddress: z.string().optional(),
  notifyPartyName: z.string().max(255).optional(),
  notifyPartyAddress: z.string().optional(),
  vesselName: z.string().max(100).optional(),
  voyageNumber: z.string().max(50).optional(),
  portOfLoading: z.string().max(10).optional(),
  portOfDischarge: z.string().max(10).optional(),
  placeOfReceipt: z.string().max(100).optional(),
  placeOfDelivery: z.string().max(100).optional(),
  dateOfIssue: z.string().optional(),
  onBoardDate: z.string().optional(),
  freightTerms: z.enum(["prepaid", "collect"]).optional(),
  paymentTerms: z.string().max(30).optional(),
  numberOfOriginals: z.number().int().min(1).optional(),
  containerCount: z.number().int().min(0).optional(),
  grossWeight: z.number().int().optional(),
  weightUnit: z.string().max(5).optional(),
  volume: z.number().int().optional(),
  volumeUnit: z.string().max(5).optional(),
  cargoDescription: z.string().optional(),
  marksAndNumbers: z.string().optional(),
  specialInstructions: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateBillOfLadingSchema = createBillOfLadingSchema.partial();

// ==========================================
// BL Containers
// ==========================================

export const createBlContainerSchema = z.object({
  blId: z.string().uuid(),
  containerNumber: z.string().min(1).max(20),
  sealNumber: z.string().max(30).optional(),
  containerType: z.string().max(10).optional(),
  containerSize: z.string().max(5).optional(),
  grossWeight: z.number().int().optional(),
  tareWeight: z.number().int().optional(),
  netWeight: z.number().int().optional(),
  volumeCbm: z.number().int().optional(),
  packageCount: z.number().int().optional(),
  packageType: z.string().max(30).optional(),
  cargoDescription: z.string().optional(),
  hsCode: z.string().max(20).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateBlContainerSchema = createBlContainerSchema.partial();

// ==========================================
// BL Charges
// ==========================================

export const createBlChargeSchema = z.object({
  blId: z.string().uuid(),
  chargeCode: z.string().min(1).max(30),
  chargeName: z.string().min(1).max(255),
  chargeType: z.string().min(1).max(20),
  amount: z.number().int(),
  currency: z.string().max(3).optional(),
  prepaidCollect: z.enum(["prepaid", "collect"]).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateBlChargeSchema = createBlChargeSchema.partial();

// ==========================================
// Manifests
// ==========================================

export const createManifestSchema = z.object({
  manifestNumber: z.string().min(1).max(50),
  manifestType: z.enum(["export", "import", "transit", "transshipment"]).optional(),
  vesselName: z.string().min(1).max(100),
  voyageNumber: z.string().min(1).max(50),
  portOfLoading: z.string().max(10).optional(),
  portOfDischarge: z.string().max(10).optional(),
  estimatedDeparture: z.coerce.date().optional(),
  estimatedArrival: z.coerce.date().optional(),
  totalBls: z.number().int().optional(),
  totalContainers: z.number().int().optional(),
  totalWeight: z.number().int().optional(),
  weightUnit: z.string().max(5).optional(),
  submittedTo: z.string().max(100).optional(),
  status: z.enum(["draft", "prepared", "submitted", "acknowledged", "rejected", "amended"]).optional(),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateManifestSchema = createManifestSchema.partial();

// ==========================================
// Manifest Items
// ==========================================

export const createManifestItemSchema = z.object({
  manifestId: z.string().uuid(),
  blId: z.string().uuid().optional(),
  blNumber: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  shipperName: z.string().max(255).optional(),
  consigneeName: z.string().max(255).optional(),
  cargoDescription: z.string().optional(),
  hsCode: z.string().max(20).optional(),
  packageCount: z.number().int().optional(),
  packageType: z.string().max(30).optional(),
  grossWeight: z.number().int().optional(),
  volumeCbm: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateManifestItemSchema = createManifestItemSchema.partial();

// ==========================================
// Regulatory Filings
// ==========================================

export const createRegulatoryFilingSchema = z.object({
  filingReference: z.string().min(1).max(50),
  filingType: z.enum(["ams", "isf", "ics2", "ens", "edi", "customs_entry"]),
  regulatoryBody: z.string().min(1).max(50),
  country: z.string().min(2).max(3),
  blId: z.string().uuid().optional(),
  blNumber: z.string().max(50).optional(),
  vesselName: z.string().max(100).optional(),
  voyageNumber: z.string().max(50).optional(),
  portOfLoading: z.string().max(10).optional(),
  portOfDischarge: z.string().max(10).optional(),
  filingDeadline: z.coerce.date().optional(),
  status: z.enum(["pending", "filed", "accepted", "rejected", "amended", "cancelled"]).optional(),
  shipperName: z.string().max(255).optional(),
  consigneeName: z.string().max(255).optional(),
  sellerName: z.string().max(255).optional(),
  buyerName: z.string().max(255).optional(),
  manufacturerName: z.string().max(255).optional(),
  hsCode: z.string().max(20).optional(),
  cargoDescription: z.string().optional(),
  containerNumber: z.string().max(20).optional(),
  sealNumber: z.string().max(30).optional(),
  grossWeight: z.number().int().optional(),
  filingData: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateRegulatoryFilingSchema = createRegulatoryFilingSchema.partial();

// ==========================================
// VGM Records
// ==========================================

export const createVgmRecordSchema = z.object({
  vgmReference: z.string().min(1).max(50),
  containerNumber: z.string().min(1).max(20),
  blId: z.string().uuid().optional(),
  blNumber: z.string().max(50).optional(),
  bookingReference: z.string().max(50).optional(),
  weighingMethod: z.enum(["method1", "method2"]),
  verifiedGrossMass: z.number().int().min(1),
  tareWeight: z.number().int().optional(),
  cargoWeight: z.number().int().optional(),
  dunnageWeight: z.number().int().optional(),
  weightUnit: z.string().max(5).optional(),
  weighingDate: z.string().min(1),
  weighingLocation: z.string().max(255).optional(),
  weighbridgeId: z.string().max(50).optional(),
  certifiedBy: z.string().min(1).max(255),
  certificationNumber: z.string().max(100).optional(),
  shipperName: z.string().max(255).optional(),
  terminalName: z.string().max(255).optional(),
  status: z.enum(["pending", "submitted", "verified", "rejected", "discrepancy"]).optional(),
  discrepancyFlag: z.boolean().optional(),
  discrepancyNotes: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateVgmRecordSchema = createVgmRecordSchema.partial();

// ==========================================
// Shipping Instructions
// ==========================================

export const createShippingInstructionSchema = z.object({
  siReference: z.string().min(1).max(50),
  blId: z.string().uuid().optional(),
  bookingReference: z.string().max(50).optional(),
  customerId: z.string().uuid().optional(),
  customerName: z.string().max(255).optional(),
  shipperName: z.string().min(1).max(255),
  shipperAddress: z.string().optional(),
  consigneeName: z.string().min(1).max(255),
  consigneeAddress: z.string().optional(),
  notifyPartyName: z.string().max(255).optional(),
  cargoDescription: z.string().optional(),
  specialInstructions: z.string().optional(),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateShippingInstructionSchema = createShippingInstructionSchema.partial();

// ==========================================
// Cargo Tracking Events
// ==========================================

export const createCargoTrackingEventSchema = z.object({
  blId: z.string().uuid().optional(),
  containerNumber: z.string().max(20).optional(),
  eventType: z.string().min(1).max(30),
  eventCode: z.string().min(1).max(20),
  eventDescription: z.string().max(500).optional(),
  eventLocation: z.string().max(100).optional(),
  eventPort: z.string().max(10).optional(),
  eventDate: z.coerce.date(),
  reportedBy: z.string().max(255).optional(),
  vesselName: z.string().max(100).optional(),
  voyageNumber: z.string().max(50).optional(),
  isActual: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateCargoTrackingEventSchema = createCargoTrackingEventSchema.partial();

// ==========================================
// Document Amendments
// ==========================================

export const createDocumentAmendmentSchema = z.object({
  blId: z.string().uuid(),
  amendmentNumber: z.string().min(1).max(30),
  amendmentType: z.string().min(1).max(30),
  fieldChanged: z.string().min(1).max(100),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
  reason: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  fee: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateDocumentAmendmentSchema = createDocumentAmendmentSchema.partial();
