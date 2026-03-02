import { z } from "zod/v4";

// ==========================================
// Pre-Load Cargo Survey Management
// ==========================================
export const createCargoSurveySchema = z.object({
  surveyType: z.enum(["pre_load", "loading", "discharge", "tally"]),
  bookingRef: z.string().max(50).optional(),
  blNumber: z.string().max(50).optional(),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  portName: z.string().max(255).optional(),
  terminalName: z.string().max(255).optional(),
  cargoDescription: z.string().optional(),
  hsCode: z.string().max(20).optional(),
  packageType: z.string().max(50).optional(),
  declaredQuantity: z.number().int().optional(),
  surveyedQuantity: z.number().int().optional(),
  declaredWeightKg: z.string().optional(),
  surveyedWeightKg: z.string().optional(),
  weightVarianceKg: z.string().optional(),
  cargoCondition: z.enum(["good", "damaged", "mixed", "wet"]).optional(),
  damageDescription: z.string().optional(),
  surveyorName: z.string().max(255).optional(),
  surveyorCompany: z.string().max(255).optional(),
  surveyorLicense: z.string().max(50).optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  clientName: z.string().max(255).optional(),
  clientRef: z.string().max(50).optional(),
  recommendations: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCargoSurveySchema = createCargoSurveySchema.partial();

// ==========================================
// Container Condition Survey & MNR
// ==========================================
export const createContainerSurveySchema = z.object({
  surveyType: z.enum(["on_hire", "off_hire", "periodic", "damage"]),
  containerNumber: z.string().min(1).max(20),
  containerType: z.string().max(30).optional(),
  containerSizeIso: z.string().max(10).optional(),
  ownerOperator: z.string().max(255).optional(),
  depotName: z.string().max(255).optional(),
  depotLocation: z.string().max(255).optional(),
  overallCondition: z.enum(["a_grade", "b_grade", "c_grade", "damaged"]).optional(),
  structuralCondition: z.enum(["good", "fair", "poor"]).optional(),
  floorCondition: z.enum(["good", "fair", "poor"]).optional(),
  roofCondition: z.enum(["good", "fair", "poor"]).optional(),
  doorCondition: z.enum(["good", "fair", "poor"]).optional(),
  paintCondition: z.enum(["good", "fair", "poor"]).optional(),
  cscPlateValid: z.boolean().optional(),
  cscExpiryDate: z.coerce.date().optional(),
  mnrRequired: z.boolean().optional(),
  mnrEstimateCost: z.string().optional(),
  mnrCurrency: z.string().max(3).optional(),
  mnrApproved: z.boolean().optional(),
  mnrCompletedAt: z.coerce.date().optional(),
  surveyorName: z.string().max(255).optional(),
  surveyorCompany: z.string().max(255).optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateContainerSurveySchema = createContainerSurveySchema.partial();

// ==========================================
// Draft Survey Coordination & Calculation
// ==========================================
export const createDraftSurveySchema = z.object({
  surveyType: z.enum(["initial", "intermediate", "final"]),
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  voyageNumber: z.string().max(50).optional(),
  portName: z.string().max(255).optional(),
  berthName: z.string().max(100).optional(),
  cargoType: z.string().max(100).optional(),
  draftFore: z.string().optional(),
  draftAft: z.string().optional(),
  draftMidPort: z.string().optional(),
  draftMidStarboard: z.string().optional(),
  meanDraft: z.string().optional(),
  trim: z.string().optional(),
  displacement: z.string().optional(),
  ballastWeight: z.string().optional(),
  constantsWeight: z.string().optional(),
  freshWaterWeight: z.string().optional(),
  fuelWeight: z.string().optional(),
  netCargoWeight: z.string().optional(),
  waterDensity: z.string().optional(),
  waterTemp: z.string().optional(),
  surveyorName: z.string().max(255).optional(),
  surveyorCompany: z.string().max(255).optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDraftSurveySchema = createDraftSurveySchema.partial();

// ==========================================
// On-Hire & Off-Hire Survey Management
// ==========================================
export const createHireSurveySchema = z.object({
  surveyType: z.enum(["on_hire", "off_hire"]),
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  chartererName: z.string().max(255).optional(),
  ownerName: z.string().max(255).optional(),
  charterPartyRef: z.string().max(50).optional(),
  portName: z.string().max(255).optional(),
  hullCondition: z.enum(["good", "fair", "poor"]).optional(),
  deckCondition: z.enum(["good", "fair", "poor"]).optional(),
  engineCondition: z.enum(["good", "fair", "poor"]).optional(),
  accommodationCondition: z.enum(["good", "fair", "poor"]).optional(),
  safetyEquipmentOk: z.boolean().optional(),
  bunkerRobFuel: z.string().optional(),
  bunkerRobDiesel: z.string().optional(),
  bunkerRobLubeOil: z.string().optional(),
  freshWaterRob: z.string().optional(),
  constantsWeight: z.string().optional(),
  surveyorName: z.string().max(255).optional(),
  surveyorCompany: z.string().max(255).optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  deliveryDate: z.coerce.date().optional(),
  redeliveryDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateHireSurveySchema = createHireSurveySchema.partial();

// ==========================================
// Hatch & Hold Inspection Management
// ==========================================
export const createHatchInspectionSchema = z.object({
  inspectionType: z.enum(["pre_loading", "intermediate", "final"]),
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  voyageNumber: z.string().max(50).optional(),
  portName: z.string().max(255).optional(),
  holdNumber: z.string().max(20).optional(),
  hatchCoverType: z.string().max(50).optional(),
  cleanliness: z.enum(["clean", "acceptable", "dirty", "contaminated"]).optional(),
  dryness: z.enum(["dry", "damp", "wet"]).optional(),
  odorFree: z.boolean().optional(),
  previousCargo: z.string().max(255).optional(),
  residueFound: z.boolean().optional(),
  residueDescription: z.string().optional(),
  hatchCoverSeal: z.enum(["good", "fair", "poor", "failed"]).optional(),
  waterTightness: z.enum(["pass", "fail"]).optional(),
  ventilationOk: z.boolean().optional(),
  bilgesClean: z.boolean().optional(),
  ladderCondition: z.enum(["good", "fair", "poor"]).optional(),
  lightingOk: z.boolean().optional(),
  cargoFitness: z.enum(["fit", "conditional", "unfit"]).optional(),
  inspectorName: z.string().max(255).optional(),
  inspectorCompany: z.string().max(255).optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateHatchInspectionSchema = createHatchInspectionSchema.partial();

// ==========================================
// Reefer PTI Survey Coordination
// ==========================================
export const createReeferPtiSurveySchema = z.object({
  surveyType: z.enum(["pti", "periodic", "complaint", "pre_trip"]),
  containerNumber: z.string().min(1).max(20),
  containerType: z.string().max(30).optional(),
  unitManufacturer: z.string().max(100).optional(),
  unitModel: z.string().max(100).optional(),
  unitSerialNumber: z.string().max(50).optional(),
  depotName: z.string().max(255).optional(),
  depotLocation: z.string().max(255).optional(),
  setPointTemp: z.string().optional(),
  supplyAirTemp: z.string().optional(),
  returnAirTemp: z.string().optional(),
  ambientTemp: z.string().optional(),
  humidityPercent: z.string().optional(),
  ventSetting: z.string().max(20).optional(),
  defrostOk: z.boolean().optional(),
  compressorOk: z.boolean().optional(),
  condenserOk: z.boolean().optional(),
  evaporatorOk: z.boolean().optional(),
  controllerOk: z.boolean().optional(),
  gasketOk: z.boolean().optional(),
  powerSupplyOk: z.boolean().optional(),
  dataLoggerDownloaded: z.boolean().optional(),
  overallResult: z.enum(["pass", "fail", "conditional"]).optional(),
  technicianName: z.string().max(255).optional(),
  technicianCompany: z.string().max(255).optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  nextPtiDue: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateReeferPtiSurveySchema = createReeferPtiSurveySchema.partial();

// ==========================================
// Classification Society Interface
// ==========================================
export const createClassificationSurveySchema = z.object({
  surveyType: z.enum(["annual", "special", "intermediate", "renewal", "bottom"]),
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  classificationSociety: z.string().min(1).max(255),
  classNotation: z.string().max(100).optional(),
  surveyorName: z.string().max(255).optional(),
  surveyorId: z.string().max(50).optional(),
  surveyLocation: z.string().max(255).optional(),
  certificateType: z.string().max(100).optional(),
  certificateNumber: z.string().max(100).optional(),
  certificateIssuedAt: z.coerce.date().optional(),
  certificateExpiresAt: z.coerce.date().optional(),
  windowStart: z.coerce.date().optional(),
  windowEnd: z.coerce.date().optional(),
  findingsCount: z.number().int().optional(),
  rectificationDeadline: z.coerce.date().optional(),
  rectifiedAt: z.coerce.date().optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  overallResult: z.enum(["passed", "conditional", "failed"]).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateClassificationSurveySchema = createClassificationSurveySchema.partial();

// ==========================================
// Survey Report Management & Archive
// ==========================================
export const createSurveyReportSchema = z.object({
  reportType: z.enum(["survey", "inspection", "audit", "certificate"]),
  sourceModule: z.string().max(50).optional(),
  sourceSurveyRef: z.string().max(50).optional(),
  title: z.string().min(1).max(500),
  vesselName: z.string().max(255).optional(),
  containerNumber: z.string().max(20).optional(),
  surveyorName: z.string().max(255).optional(),
  surveyorCompany: z.string().max(255).optional(),
  surveyDate: z.coerce.date().optional(),
  reportDate: z.coerce.date().optional(),
  documentUrl: z.string().max(500).optional(),
  documentFormat: z.enum(["pdf", "docx", "xlsx"]).optional(),
  fileSizeBytes: z.number().int().optional(),
  summary: z.string().optional(),
  retentionYears: z.number().int().optional(),
  expiresAt: z.coerce.date().optional(),
  archivedAt: z.coerce.date().optional(),
  approvedBy: z.string().max(255).optional(),
  approvedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSurveyReportSchema = createSurveyReportSchema.partial();
