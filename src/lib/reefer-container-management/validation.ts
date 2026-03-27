import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Reefer Bookings
// ==========================================

export const createReeferBookingSchema = z.object({
  customerName: z.string().min(1).max(255),
  customerCode: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  containerSize: z.string().min(1).max(10),
  containerType: z.string().min(1).max(30),
  commodityName: z.string().min(1).max(255),
  commodityCode: z.string().max(50).optional(),
  requiredTempC: z.string().min(1),
  requiredHumidity: z.string().optional(),
  ventilationSetting: z.string().max(50).optional(),
  atmosphereControl: z.string().max(30).optional(),
  o2Level: z.string().optional(),
  co2Level: z.string().optional(),
  originPort: z.string().min(1).max(255),
  destinationPort: z.string().min(1).max(255),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  loadDate: z.coerce.date().optional(),
  dischargeDate: z.coerce.date().optional(),
  transitDays: z.number().int().optional(),
  specialInstructions: z.string().optional(),
  acceptanceChecklist: z.array(z.record(z.string(), z.unknown())).optional(),
  acceptedByName: z.string().max(255).optional(),
  acceptedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateReeferBookingSchema = createReeferBookingSchema.partial();

// ==========================================
// Temperature Monitorings
// ==========================================

export const createTempMonitoringSchema = z.object({
  containerNumber: z.string().min(1).max(20),
  bookingRef: z.string().max(50).optional(),
  sensorId: z.string().max(50).optional(),
  sensorType: z.string().max(30).optional(),
  setPointTempC: z.string().min(1),
  actualTempC: z.string().optional(),
  setPointHumidity: z.string().optional(),
  actualHumidity: z.string().optional(),
  supplyAirTempC: z.string().optional(),
  returnAirTempC: z.string().optional(),
  o2Level: z.string().optional(),
  co2Level: z.string().optional(),
  powerStatus: z.string().max(20).optional(),
  compressorStatus: z.string().max(20).optional(),
  defrostCycleActive: z.boolean().optional(),
  readingTimestamp: z.coerce.date(),
  locationDescription: z.string().max(255).optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  alertTriggered: z.boolean().optional(),
  alertType: z.string().max(30).optional(),
  dataSource: z.string().max(30).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateTempMonitoringSchema = createTempMonitoringSchema.partial();

// ==========================================
// PTI Inspections
// ==========================================

export const createPtiInspectionSchema = z.object({
  containerNumber: z.string().min(1).max(20),
  bookingRef: z.string().max(50).optional(),
  inspectionType: z.enum(["pre_trip", "periodic", "post_trip", "emergency"]),
  inspectionDate: z.coerce.date(),
  depotName: z.string().max(255).optional(),
  depotLocation: z.string().max(255).optional(),
  inspectorName: z.string().max(255).optional(),
  setPointTempC: z.string().optional(),
  achievedTempC: z.string().optional(),
  cooldownMinutes: z.number().int().optional(),
  compressorOk: z.boolean().optional(),
  evaporatorOk: z.boolean().optional(),
  condenserOk: z.boolean().optional(),
  controllerOk: z.boolean().optional(),
  doorSealsOk: z.boolean().optional(),
  drainHolesOk: z.boolean().optional(),
  powerCableOk: z.boolean().optional(),
  cleanlinessOk: z.boolean().optional(),
  overallResult: z.enum(["pass", "fail", "conditional"]).optional(),
  defectsFound: z.array(z.record(z.string(), z.unknown())).optional(),
  repairsRequired: z.string().optional(),
  certificateNumber: z.string().max(50).optional(),
  certificateExpiry: z.coerce.date().optional(),
  photosUrls: z.array(z.string()).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePtiInspectionSchema = createPtiInspectionSchema.partial();

// ==========================================
// Power Management
// ==========================================

export const createPowerManagementSchema = z.object({
  containerNumber: z.string().min(1).max(20),
  locationName: z.string().min(1).max(255),
  locationType: z.enum(["terminal", "depot", "vessel", "rail", "truck"]),
  plugType: z.string().max(30).optional(),
  voltage: z.string().max(20).optional(),
  amperage: z.string().max(20).optional(),
  bayPosition: z.string().max(30).optional(),
  tierPosition: z.string().max(30).optional(),
  pluggedInAt: z.coerce.date().optional(),
  unpluggedAt: z.coerce.date().optional(),
  totalPlugHours: z.string().optional(),
  powerConsumptionKwh: z.string().optional(),
  costPerKwh: z.string().optional(),
  totalCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  powerInterruptions: z.number().int().optional(),
  lastInterruptionAt: z.coerce.date().optional(),
  gensetBackup: z.boolean().optional(),
  monitoredByName: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updatePowerManagementSchema = createPowerManagementSchema.partial();

// ==========================================
// Cold Chain Documents
// ==========================================

export const createColdChainDocSchema = z.object({
  documentType: z.enum(["temperature_log", "phytosanitary", "health_certificate", "fumigation", "compliance_report", "inspection_report"]),
  containerNumber: z.string().max(20).optional(),
  bookingRef: z.string().max(50).optional(),
  customerName: z.string().max(255).optional(),
  commodityName: z.string().max(255).optional(),
  originCountry: z.string().max(100).optional(),
  destinationCountry: z.string().max(100).optional(),
  phytosanitaryCert: z.string().max(100).optional(),
  healthCert: z.string().max(100).optional(),
  fumigationCert: z.string().max(100).optional(),
  temperatureLogUrl: z.string().max(500).optional(),
  complianceStandard: z.string().max(100).optional(),
  regulatoryBody: z.string().max(255).optional(),
  inspectionResult: z.enum(["pass", "fail", "conditional", "pending"]).optional(),
  inspectionDate: z.coerce.date().optional(),
  inspectorName: z.string().max(255).optional(),
  expiryDate: z.coerce.date().optional(),
  documentUrl: z.string().max(500).optional(),
  verifiedByName: z.string().max(255).optional(),
  verifiedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateColdChainDocSchema = createColdChainDocSchema.partial();

// ==========================================
// Breakdown Responses
// ==========================================

export const createBreakdownResponseSchema = z.object({
  containerNumber: z.string().min(1).max(20),
  bookingRef: z.string().max(50).optional(),
  breakdownType: z.enum(["compressor_failure", "refrigerant_leak", "electrical_fault", "controller_malfunction", "sensor_failure", "structural_damage", "other"]),
  severityLevel: z.enum(["minor", "moderate", "major", "critical"]),
  reportedAt: z.coerce.date(),
  locationDescription: z.string().max(500).optional(),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  faultDescription: z.string().min(1),
  faultCode: z.string().max(30).optional(),
  lastKnownTempC: z.string().optional(),
  cargoAtRisk: z.boolean().optional(),
  commodityName: z.string().max(255).optional(),
  immediateAction: z.string().optional(),
  technicianName: z.string().max(255).optional(),
  responseStartedAt: z.coerce.date().optional(),
  repairDescription: z.string().optional(),
  partsUsed: z.array(z.record(z.string(), z.unknown())).optional(),
  resolvedAt: z.coerce.date().optional(),
  totalDowntimeMinutes: z.number().int().optional(),
  repairCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  containerSwapped: z.boolean().optional(),
  swappedToContainer: z.string().max(20).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateBreakdownResponseSchema = createBreakdownResponseSchema.partial();

// ==========================================
// Temperature Alerts
// ==========================================

export const createTempAlertSchema = z.object({
  containerNumber: z.string().min(1).max(20),
  bookingRef: z.string().max(50).optional(),
  alertType: z.enum(["high_temp", "low_temp", "humidity", "power_loss", "door_open", "sensor_fault"]),
  alertSeverity: z.enum(["warning", "critical", "emergency"]),
  setPointTempC: z.string().min(1),
  actualTempC: z.string().min(1),
  deviationC: z.string().optional(),
  thresholdC: z.string().optional(),
  exceedanceDurationMinutes: z.number().int().optional(),
  triggeredAt: z.coerce.date(),
  acknowledgedAt: z.coerce.date().optional(),
  acknowledgedByName: z.string().max(255).optional(),
  escalationLevel: z.number().int().optional(),
  escalatedToName: z.string().max(255).optional(),
  escalatedAt: z.coerce.date().optional(),
  correctionAction: z.string().optional(),
  resolvedAt: z.coerce.date().optional(),
  resolvedByName: z.string().max(255).optional(),
  cargoImpact: z.string().max(30).optional(),
  notificationsSent: z.array(z.record(z.string(), z.unknown())).optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateTempAlertSchema = createTempAlertSchema.partial();

// ==========================================
// Claim Analytics
// ==========================================

export const createClaimAnalyticsSchema = z.object({
  containerNumber: z.string().max(20).optional(),
  bookingRef: z.string().max(50).optional(),
  customerName: z.string().max(255).optional(),
  commodityName: z.string().max(255).optional(),
  analysisType: z.enum(["predictive", "historical", "real_time", "post_voyage"]),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  riskScore: z.string().optional(),
  tempExceedanceCount: z.number().int().optional(),
  totalExceedanceMinutes: z.number().int().optional(),
  maxDeviationC: z.string().optional(),
  claimProbability: z.string().optional(),
  estimatedClaimAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  preventiveActions: z.array(z.record(z.string(), z.unknown())).optional(),
  aiRecommendations: z.string().optional(),
  modelVersion: z.string().max(50).optional(),
  confidenceScore: z.string().optional(),
  actualClaimFiled: z.boolean().optional(),
  actualClaimAmount: z.string().optional(),
  predictionAccuracy: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateClaimAnalyticsSchema = createClaimAnalyticsSchema.partial();
