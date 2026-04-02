import { z } from "zod";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Container Fleet schemas
// ==========================================
export const createContainerFleetSchema = z.object({
  containerNumber: z.string().min(1).max(20),
  isoTypeCode: z.string().max(10).optional(),
  sizeCode: z.string().min(1).max(10),
  typeCode: z.string().min(1).max(10),
  ownerCode: z.string().max(10).optional(),
  operatorCode: z.string().max(10).optional(),
  ownershipType: z.enum(["owned", "leased", "third_party"]).optional(),
  currentLocation: z.string().max(255).optional(),
  currentPort: z.string().max(10).optional(),
  currentStatus: z.enum(["available", "in_use", "under_repair", "off_hired", "scrapped"]).optional(),
  lastMovementDate: z.string().datetime().optional(),
  lastSurveyDate: z.string().datetime().optional(),
  buildDate: z.string().datetime().optional(),
  manufacturer: z.string().max(255).optional(),
  tareWeightKg: z.number().int().min(0).optional(),
  maxGrossWeightKg: z.number().int().min(0).optional(),
  capacityCbm: z.number().min(0).optional(),
  metadata: metadataSchema,
  status: z.enum(["active", "inactive", "retired"]).optional(),
  notes: z.string().optional(),
});
export const updateContainerFleetSchema = createContainerFleetSchema.partial();

// ==========================================
// Repositioning Plan schemas
// ==========================================
export const createRepositioningPlanSchema = z.object({
  planReference: z.string().min(1).max(50),
  containerFleetId: z.string().uuid().optional(),
  containerNumber: z.string().max(20).optional(),
  fromPort: z.string().min(1).max(255),
  toPort: z.string().min(1).max(255),
  tradeLane: z.string().max(100).optional(),
  estimatedCost: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  transportMode: z.enum(["vessel", "truck", "rail", "barge"]).optional(),
  scheduledDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
  reason: z.enum(["surplus", "demand", "repositioning", "repair"]).optional(),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  quantity: z.number().int().min(1).optional(),
  status: z.enum(["draft", "approved", "in_transit", "completed", "cancelled"]).optional(),
  notes: z.string().optional(),
});
export const updateRepositioningPlanSchema = createRepositioningPlanSchema.partial();

// ==========================================
// Reefer Container schemas
// ==========================================
export const createReeferContainerSchema = z.object({
  containerFleetId: z.string().uuid().optional(),
  containerNumber: z.string().min(1).max(20),
  reeferUnitModel: z.string().max(100).optional(),
  reeferUnitSerial: z.string().max(100).optional(),
  setTemperature: z.number().optional(),
  minTemperature: z.number().optional(),
  maxTemperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  ventilation: z.string().max(20).optional(),
  atmosphere: z.enum(["normal", "CA", "MA"]).optional(),
  lastPtiDate: z.string().datetime().optional(),
  nextPtiDue: z.string().datetime().optional(),
  powerStatus: z.enum(["on", "off", "standby"]).optional(),
  currentTemperature: z.number().optional(),
  fuelType: z.string().max(20).optional(),
  gensetRequired: z.boolean().optional(),
  metadata: metadataSchema,
  status: z.enum(["active", "standby", "under_repair", "off"]).optional(),
  notes: z.string().optional(),
});
export const updateReeferContainerSchema = createReeferContainerSchema.partial();

// ==========================================
// Maintenance Repair schemas
// ==========================================
export const createMaintenanceRepairSchema = z.object({
  containerFleetId: z.string().uuid().optional(),
  containerNumber: z.string().min(1).max(20),
  mnrReference: z.string().min(1).max(50),
  repairType: z.enum(["structural", "mechanical", "reefer", "cosmetic", "cleaning"]).optional(),
  damageCode: z.string().max(20).optional(),
  damageLocation: z.string().max(100).optional(),
  damageDescription: z.string().optional(),
  estimatedCost: z.number().int().min(0).optional(),
  actualCost: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  repairVendor: z.string().max(255).optional(),
  depotCode: z.string().max(20).optional(),
  depotName: z.string().max(255).optional(),
  inspectionDate: z.string().datetime().optional(),
  repairStartDate: z.string().datetime().optional(),
  repairCompleteDate: z.string().datetime().optional(),
  approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  metadata: metadataSchema,
  status: z.enum(["reported", "estimated", "approved", "in_progress", "completed", "billed"]).optional(),
  notes: z.string().optional(),
});
export const updateMaintenanceRepairSchema = createMaintenanceRepairSchema.partial();

// ==========================================
// Yard Slot schemas
// ==========================================
export const createYardSlotSchema = z.object({
  yardCode: z.string().min(1).max(20),
  yardName: z.string().min(1).max(255),
  terminalCode: z.string().max(20).optional(),
  blockCode: z.string().max(20).optional(),
  bayCode: z.string().max(20).optional(),
  rowCode: z.string().max(20).optional(),
  tierCode: z.string().max(20).optional(),
  slotCapacity: z.number().int().min(1).optional(),
  currentOccupancy: z.number().int().min(0).optional(),
  slotType: z.enum(["dry", "reefer", "hazmat", "oog", "empty"]).optional(),
  assignedContainerNumber: z.string().max(20).optional(),
  assignedContainerId: z.string().uuid().optional(),
  reservedFor: z.string().max(255).optional(),
  reservedUntil: z.string().datetime().optional(),
  metadata: metadataSchema,
  status: z.enum(["available", "occupied", "reserved", "blocked", "maintenance"]).optional(),
  notes: z.string().optional(),
});
export const updateYardSlotSchema = createYardSlotSchema.partial();

// ==========================================
// Gate Movement schemas
// ==========================================
export const createGateMovementSchema = z.object({
  movementReference: z.string().min(1).max(50),
  movementType: z.enum(["gate_in", "gate_out"]),
  containerNumber: z.string().min(1).max(20),
  containerFleetId: z.string().uuid().optional(),
  vehiclePlate: z.string().max(20).optional(),
  driverName: z.string().max(255).optional(),
  transportCompany: z.string().max(255).optional(),
  sealNumber: z.string().max(50).optional(),
  vgmWeightKg: z.number().int().min(0).optional(),
  gateCode: z.string().max(20).optional(),
  laneNumber: z.string().max(10).optional(),
  inspectionResult: z.enum(["pending", "passed", "failed"]).optional(),
  codecoMessageId: z.string().max(50).optional(),
  ediReference: z.string().max(100).optional(),
  movementTimestamp: z.string().datetime().optional(),
  metadata: metadataSchema,
  status: z.enum(["pending", "completed", "rejected"]).optional(),
  notes: z.string().optional(),
});
export const updateGateMovementSchema = createGateMovementSchema.partial();

// ==========================================
// Equipment Interchange schemas
// ==========================================
export const createEquipmentInterchangeSchema = z.object({
  interchangeReference: z.string().min(1).max(50),
  interchangeType: z.enum(["pick_up", "drop_off", "transfer"]),
  containerNumber: z.string().min(1).max(20),
  containerFleetId: z.string().uuid().optional(),
  partyFrom: z.string().min(1).max(255),
  partyTo: z.string().min(1).max(255),
  locationCode: z.string().max(20).optional(),
  locationName: z.string().max(255).optional(),
  interchangeDate: z.string().datetime(),
  conditionIn: z.string().max(20).optional(),
  conditionOut: z.string().max(20).optional(),
  damageRemarks: z.string().optional(),
  liabilityParty: z.string().max(255).optional(),
  receiptNumber: z.string().max(50).optional(),
  metadata: metadataSchema,
  status: z.enum(["draft", "issued", "accepted", "disputed"]).optional(),
  notes: z.string().optional(),
});
export const updateEquipmentInterchangeSchema = createEquipmentInterchangeSchema.partial();

// ==========================================
// On-Hire Off-Hire schemas
// ==========================================
export const createOnHireOffHireSchema = z.object({
  contractReference: z.string().min(1).max(50),
  containerNumber: z.string().min(1).max(20),
  containerFleetId: z.string().uuid().optional(),
  lessorName: z.string().max(255).optional(),
  lesseeName: z.string().max(255).optional(),
  hireType: z.enum(["on_hire", "off_hire"]),
  onHireDate: z.string().datetime(),
  offHireDate: z.string().datetime().optional(),
  onHireLocation: z.string().max(255).optional(),
  offHireLocation: z.string().max(255).optional(),
  dailyRate: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  totalDays: z.number().int().min(0).optional(),
  totalCost: z.number().int().min(0).optional(),
  conditionOnHire: z.string().max(20).optional(),
  conditionOffHire: z.string().max(20).optional(),
  damageCharges: z.number().int().min(0).optional(),
  cleaningCharges: z.number().int().min(0).optional(),
  metadata: metadataSchema,
  status: z.enum(["active", "pending_off_hire", "off_hired", "disputed"]).optional(),
  notes: z.string().optional(),
});
export const updateOnHireOffHireSchema = createOnHireOffHireSchema.partial();

// ==========================================
// Container Survey schemas
// ==========================================
export const createContainerSurveySchema = z.object({
  surveyReference: z.string().min(1).max(50),
  containerNumber: z.string().min(1).max(20),
  containerFleetId: z.string().uuid().optional(),
  surveyType: z.enum(["condition", "damage", "pre_trip", "on_hire", "off_hire", "periodic"]).optional(),
  surveyorName: z.string().max(255).optional(),
  surveyCompany: z.string().max(255).optional(),
  surveyDate: z.string().datetime(),
  surveyLocation: z.string().max(255).optional(),
  overallCondition: z.enum(["good", "fair", "poor", "condemned"]).optional(),
  structuralGrade: z.string().max(5).optional(),
  floorGrade: z.string().max(5).optional(),
  roofGrade: z.string().max(5).optional(),
  doorGrade: z.string().max(5).optional(),
  damageFindings: z.array(z.record(z.string(), z.unknown())).optional(),
  photos: z.array(z.string()).optional(),
  nextSurveyDue: z.string().datetime().optional(),
  metadata: metadataSchema,
  status: z.enum(["scheduled", "in_progress", "completed", "reviewed"]).optional(),
  notes: z.string().optional(),
});
export const updateContainerSurveySchema = createContainerSurveySchema.partial();

// ==========================================
// Leased Container schemas
// ==========================================
export const createLeasedContainerSchema = z.object({
  leaseReference: z.string().min(1).max(50),
  containerFleetId: z.string().uuid().optional(),
  containerNumber: z.string().min(1).max(20),
  lessorName: z.string().min(1).max(255),
  lessorCode: z.string().max(20).optional(),
  leaseType: z.enum(["master", "spot", "long_term", "short_term"]).optional(),
  leaseStartDate: z.string().datetime(),
  leaseEndDate: z.string().datetime().optional(),
  dailyRate: z.number().int().min(0).optional(),
  monthlyRate: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  billingCycle: z.enum(["monthly", "quarterly"]).optional(),
  pickUpLocation: z.string().max(255).optional(),
  dropOffLocation: z.string().max(255).optional(),
  contractTerms: z.record(z.string(), z.unknown()).optional(),
  minimumLeaseDays: z.number().int().min(0).optional(),
  penaltyRate: z.number().int().min(0).optional(),
  metadata: metadataSchema,
  status: z.enum(["active", "expiring", "expired", "terminated"]).optional(),
  notes: z.string().optional(),
});
export const updateLeasedContainerSchema = createLeasedContainerSchema.partial();

// ==========================================
// Availability Plan schemas
// ==========================================
export const createAvailabilityPlanSchema = z.object({
  planReference: z.string().min(1).max(50),
  tradeLane: z.string().max(100).optional(),
  originPort: z.string().max(255).optional(),
  destinationPort: z.string().max(255).optional(),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  forecastPeriodStart: z.string().datetime(),
  forecastPeriodEnd: z.string().datetime(),
  availableUnits: z.number().int().min(0).optional(),
  demandForecast: z.number().int().min(0).optional(),
  surplusDeficit: z.number().int().optional(),
  recommendedAction: z.enum(["reposition", "lease_in", "lease_out", "hold"]).optional(),
  aiConfidence: z.number().min(0).max(100).optional(),
  aiModel: z.string().max(100).optional(),
  executedAction: z.string().max(30).optional(),
  executionDate: z.string().datetime().optional(),
  metadata: metadataSchema,
  status: z.enum(["forecast", "approved", "executing", "completed"]).optional(),
  notes: z.string().optional(),
});
export const updateAvailabilityPlanSchema = createAvailabilityPlanSchema.partial();

// ==========================================
// Repositioning Optimization schemas
// ==========================================
export const createRepositioningOptimizationSchema = z.object({
  optimizationRunId: z.string().max(50).optional(),
  planReference: z.string().max(50).optional(),
  originPort: z.string().min(1).max(255),
  destinationPort: z.string().min(1).max(255),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  quantity: z.number().int().min(1).optional(),
  transportMode: z.enum(["vessel", "truck", "rail", "barge"]).optional(),
  estimatedCost: z.number().int().min(0).optional(),
  estimatedDays: z.number().int().min(0).optional(),
  estimatedCarbon: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  aiScore: z.number().min(0).max(100).optional(),
  aiModel: z.string().max(100).optional(),
  algorithm: z.string().max(50).optional(),
  inputParameters: z.record(z.string(), z.unknown()).optional(),
  results: z.record(z.string(), z.unknown()).optional(),
  alternatives: z.array(z.record(z.string(), z.unknown())).optional(),
  selectedForExecution: z.boolean().optional(),
  executionDate: z.string().datetime().optional(),
  status: z.enum(["pending", "running", "completed", "failed", "approved"]).optional(),
  notes: z.string().optional(),
});
export const updateRepositioningOptimizationSchema = createRepositioningOptimizationSchema.partial();
