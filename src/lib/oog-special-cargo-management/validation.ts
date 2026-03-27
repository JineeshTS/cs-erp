import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Cargo Acceptances
// ==========================================

export const createCargoAcceptanceSchema = z.object({
  bookingRef: z.string().max(50).optional(),
  customerName: z.string().min(1).max(255),
  customerCode: z.string().max(50).optional(),
  cargoDescription: z.string().min(1),
  cargoType: z.enum(["over_length", "over_width", "over_height", "over_weight", "break_bulk", "project_cargo"]),
  containerType: z.enum(["flat_rack", "open_top", "platform", "bolster", "mafi_trailer"]),
  containerNumber: z.string().max(20).optional(),
  lengthCm: z.string().optional(),
  widthCm: z.string().optional(),
  heightCm: z.string().optional(),
  grossWeightKg: z.string().min(1),
  overLengthCm: z.string().optional(),
  overWidthCm: z.string().optional(),
  overHeightCm: z.string().optional(),
  measurementValidated: z.boolean().optional(),
  validatedByName: z.string().max(255).optional(),
  validatedAt: z.coerce.date().optional(),
  originPort: z.string().min(1).max(255),
  destinationPort: z.string().min(1).max(255),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  specialHandling: z.array(z.record(z.string(), z.unknown())).optional(),
  hazardous: z.boolean().optional(),
  photosUrls: z.array(z.string()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCargoAcceptanceSchema = createCargoAcceptanceSchema.partial();

// ==========================================
// Stowage Plans
// ==========================================

export const createStowagePlanSchema = z.object({
  vesselName: z.string().min(1).max(255),
  voyageNumber: z.string().min(1).max(50),
  containerNumber: z.string().max(20).optional(),
  containerType: z.enum(["flat_rack", "open_top", "platform", "bolster", "mafi_trailer"]),
  bayPosition: z.string().max(30).optional(),
  rowPosition: z.string().max(30).optional(),
  tierPosition: z.string().max(30).optional(),
  weightKg: z.string().optional(),
  overLengthFore: z.string().optional(),
  overLengthAft: z.string().optional(),
  overWidthPort: z.string().optional(),
  overWidthStarboard: z.string().optional(),
  overHeight: z.string().optional(),
  stackable: z.boolean().optional(),
  adjacentSlots: z.array(z.record(z.string(), z.unknown())).optional(),
  clearanceRequired: z.boolean().optional(),
  lashingPoints: z.number().int().optional(),
  stowageConstraints: z.record(z.string(), z.unknown()).optional(),
  planApproved: z.boolean().optional(),
  approvedByName: z.string().max(255).optional(),
  approvedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateStowagePlanSchema = createStowagePlanSchema.partial();

// ==========================================
// Special Equipment
// ==========================================

export const createSpecialEquipmentSchema = z.object({
  equipmentType: z.enum(["flat_rack", "open_top", "platform", "bolster", "mafi_trailer", "tweendecks", "cradle", "spreader"]),
  equipmentNumber: z.string().max(30).optional(),
  equipmentName: z.string().min(1).max(255),
  manufacturer: z.string().max(255).optional(),
  modelNumber: z.string().max(100).optional(),
  maxLoadCapacityKg: z.string().optional(),
  tareWeightKg: z.string().optional(),
  internalLengthCm: z.string().optional(),
  internalWidthCm: z.string().optional(),
  internalHeightCm: z.string().optional(),
  doorOpeningWidthCm: z.string().optional(),
  doorOpeningHeightCm: z.string().optional(),
  certificationNumber: z.string().max(100).optional(),
  certificationExpiry: z.coerce.date().optional(),
  lastInspectionDate: z.coerce.date().optional(),
  nextInspectionDate: z.coerce.date().optional(),
  currentLocation: z.string().max(255).optional(),
  ownershipType: z.enum(["owned", "leased", "third_party"]).optional(),
  leaseReference: z.string().max(100).optional(),
  availableFrom: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateSpecialEquipmentSchema = createSpecialEquipmentSchema.partial();

// ==========================================
// Securing Plans
// ==========================================

export const createSecuringPlanSchema = z.object({
  acceptanceRef: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  cargoDescription: z.string().min(1),
  grossWeightKg: z.string().min(1),
  centerOfGravityX: z.string().optional(),
  centerOfGravityY: z.string().optional(),
  centerOfGravityZ: z.string().optional(),
  lashingMethod: z.enum(["chain", "wire_rope", "webbing", "turnbuckle", "combination"]).optional(),
  lashingMaterial: z.string().max(100).optional(),
  numberOfLashings: z.number().int().optional(),
  blockingMethod: z.string().max(50).optional(),
  bracingMethod: z.string().max(50).optional(),
  dunnageRequired: z.boolean().optional(),
  dunnageMaterial: z.string().max(100).optional(),
  accelerationForces: z.record(z.string(), z.unknown()).optional(),
  calculationStandard: z.enum(["css_code", "imo_msc", "ctus", "company"]).optional(),
  diagramUrl: z.string().max(500).optional(),
  verifiedByName: z.string().max(255).optional(),
  verifiedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateSecuringPlanSchema = createSecuringPlanSchema.partial();

// ==========================================
// Heavy Lifts
// ==========================================

export const createHeavyLiftSchema = z.object({
  projectName: z.string().min(1).max(255),
  customerName: z.string().min(1).max(255),
  cargoDescription: z.string().min(1),
  numberOfPieces: z.number().int().min(1),
  totalWeightKg: z.string().min(1),
  heaviestPieceKg: z.string().optional(),
  longestPieceCm: z.string().optional(),
  widestPieceCm: z.string().optional(),
  tallestPieceCm: z.string().optional(),
  liftingMethod: z.enum(["shore_crane", "ship_crane", "floating_crane", "roll_on", "skidding"]).optional(),
  craneCapacityTons: z.string().optional(),
  riggingPlan: z.record(z.string(), z.unknown()).optional(),
  originPort: z.string().min(1).max(255),
  destinationPort: z.string().min(1).max(255),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  estimatedLoadDate: z.coerce.date().optional(),
  estimatedDischargeDate: z.coerce.date().optional(),
  coordinatorName: z.string().max(255).optional(),
  surveyorName: z.string().max(255).optional(),
  surveyReportUrl: z.string().max(500).optional(),
  insuranceCoverage: z.string().max(100).optional(),
  estimatedCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateHeavyLiftSchema = createHeavyLiftSchema.partial();

// ==========================================
// Multi-Modal Logistics
// ==========================================

export const createMultiModalLogisticsSchema = z.object({
  acceptanceRef: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  cargoDescription: z.string().optional(),
  transportMode: z.enum(["road", "rail", "barge", "sea", "multimodal"]),
  carrierName: z.string().max(255).optional(),
  vehicleId: z.string().max(50).optional(),
  originLocation: z.string().min(1).max(255),
  destinationLocation: z.string().min(1).max(255),
  transitPoints: z.array(z.record(z.string(), z.unknown())).optional(),
  routeRestrictions: z.array(z.record(z.string(), z.unknown())).optional(),
  permitRequired: z.boolean().optional(),
  permitNumber: z.string().max(100).optional(),
  escortRequired: z.boolean().optional(),
  estimatedDepartureAt: z.coerce.date().optional(),
  estimatedArrivalAt: z.coerce.date().optional(),
  actualDepartureAt: z.coerce.date().optional(),
  actualArrivalAt: z.coerce.date().optional(),
  transportCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateMultiModalLogisticsSchema = createMultiModalLogisticsSchema.partial();

// ==========================================
// Documentation & Permits
// ==========================================

export const createDocPermitSchema = z.object({
  documentType: z.enum(["transport_permit", "port_permit", "road_permit", "survey_report", "lashing_certificate", "cargo_plan", "insurance_certificate"]),
  acceptanceRef: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  documentTitle: z.string().min(1).max(255),
  issuingAuthority: z.string().max(255).optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  permitNumber: z.string().max(100).optional(),
  permitScope: z.string().max(100).optional(),
  portOfApplicability: z.string().max(255).optional(),
  countryOfApplicability: z.string().max(100).optional(),
  conditionsOfApproval: z.string().optional(),
  documentUrl: z.string().max(500).optional(),
  verifiedByName: z.string().max(255).optional(),
  verifiedAt: z.coerce.date().optional(),
  renewalRequired: z.boolean().optional(),
  renewalDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateDocPermitSchema = createDocPermitSchema.partial();

// ==========================================
// Port Authority Approvals
// ==========================================

export const createPortApprovalSchema = z.object({
  acceptanceRef: z.string().max(50).optional(),
  portName: z.string().min(1).max(255),
  portAuthority: z.string().min(1).max(255),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  cargoDescription: z.string().optional(),
  oogDimensions: z.record(z.string(), z.unknown()).optional(),
  grossWeightKg: z.string().optional(),
  approvalType: z.enum(["loading", "discharge", "transit", "storage", "transport"]),
  submittedAt: z.coerce.date().optional(),
  submittedByName: z.string().max(255).optional(),
  applicationNumber: z.string().max(100).optional(),
  approvalConditions: z.array(z.record(z.string(), z.unknown())).optional(),
  approvedAt: z.coerce.date().optional(),
  approvedByAuthority: z.string().max(255).optional(),
  rejectionReason: z.string().optional(),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional(),
  fees: z.string().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePortApprovalSchema = createPortApprovalSchema.partial();
