import { z } from "zod/v4";

// ==========================================
// IMDG Compliance
// ==========================================

export const createImdgComplianceSchema = z.object({
  unNumber: z.string().min(1).max(10),
  properShippingName: z.string().min(1).max(500),
  technicalName: z.string().max(500).optional(),
  imdgClass: z.string().min(1).max(10),
  imdgSubsidiaryRisk: z.string().max(50).optional(),
  packingGroup: z.string().max(10).optional(),
  marinePollutant: z.boolean().optional(),
  emsNumber: z.string().max(20).optional(),
  flashPoint: z.string().max(20).optional(),
  limitedQuantity: z.boolean().optional(),
  exceptedQuantity: z.boolean().optional(),
  specialProvisions: z.array(z.record(z.string(), z.unknown())).optional(),
  stowageCategory: z.string().max(10).optional(),
  stowageRequirements: z.record(z.string(), z.unknown()).optional(),
  segregationGroup: z.string().max(50).optional(),
  imdgCodeEdition: z.string().max(20).optional(),
  amendmentNumber: z.string().max(20).optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateImdgComplianceSchema = createImdgComplianceSchema.partial();

// ==========================================
// Booking Screenings
// ==========================================

export const createBookingScreeningSchema = z.object({
  bookingRef: z.string().min(1).max(50),
  customerName: z.string().min(1).max(255),
  containerNumber: z.string().max(20).optional(),
  unNumber: z.string().min(1).max(10),
  properShippingName: z.string().min(1).max(500),
  imdgClass: z.string().min(1).max(10),
  packingGroup: z.string().max(10).optional(),
  grossWeight: z.string().optional(),
  netWeight: z.string().optional(),
  weightUnit: z.string().max(5).optional(),
  numberOfPackages: z.number().int().optional(),
  packageType: z.string().max(50).optional(),
  marinePollutant: z.boolean().optional(),
  limitedQuantity: z.boolean().optional(),
  innerPackagingDetails: z.string().optional(),
  originPort: z.string().max(255).optional(),
  destinationPort: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  screeningResult: z.enum(["approved", "rejected", "conditional", "pending"]).optional(),
  screeningNotes: z.string().optional(),
  riskScore: z.string().optional(),
  screenedByName: z.string().max(255).optional(),
  screenedAt: z.coerce.date().optional(),
  approvedByName: z.string().max(255).optional(),
  approvedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateBookingScreeningSchema = createBookingScreeningSchema.partial();

// ==========================================
// Segregation Rules
// ==========================================

export const createSegregationRuleSchema = z.object({
  ruleName: z.string().min(1).max(255),
  ruleType: z.enum(["imdg_standard", "company_specific", "port_authority", "custom"]),
  sourceClass: z.string().min(1).max(10),
  targetClass: z.string().min(1).max(10),
  segregationLevel: z.enum(["away_from", "separated_from", "separated_by_compartment", "separated_longitudinally", "prohibited"]),
  stowagePosition: z.enum(["on_deck", "under_deck", "either"]).optional(),
  stowageCategory: z.string().max(10).optional(),
  onDeck: z.boolean().optional(),
  underDeck: z.boolean().optional(),
  awayFromSources: z.array(z.record(z.string(), z.unknown())).optional(),
  minimumDistance: z.string().optional(),
  distanceUnit: z.string().max(5).optional(),
  closedVsClosed: z.string().max(30).optional(),
  closedVsOpen: z.string().max(30).optional(),
  openVsOpen: z.string().max(30).optional(),
  imdgReference: z.string().max(100).optional(),
  specialConditions: z.record(z.string(), z.unknown()).optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  priority: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSegregationRuleSchema = createSegregationRuleSchema.partial();

// ==========================================
// Placard Requirements
// ==========================================

export const createPlacardRequirementSchema = z.object({
  unNumber: z.string().max(10).optional(),
  imdgClass: z.string().min(1).max(10),
  subsidiaryRisk: z.string().max(50).optional(),
  placardType: z.enum(["primary_label", "subsidiary_label", "mark", "placard", "sign"]),
  labelCode: z.string().max(30).optional(),
  labelDescription: z.string().max(255).optional(),
  placementPosition: z.string().max(100).optional(),
  sizeRequirements: z.string().max(100).optional(),
  colorSpecification: z.string().max(100).optional(),
  symbolDescription: z.string().optional(),
  applicableToContainer: z.boolean().optional(),
  applicableToVehicle: z.boolean().optional(),
  applicableToPackage: z.boolean().optional(),
  marinePollutantMark: z.boolean().optional(),
  elevatedTemperature: z.boolean().optional(),
  fumigationWarning: z.boolean().optional(),
  orientationArrows: z.boolean().optional(),
  imdgReference: z.string().max(100).optional(),
  imageUrl: z.string().max(500).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePlacardRequirementSchema = createPlacardRequirementSchema.partial();

// ==========================================
// DG Manifests
// ==========================================

export const createManifestSchema = z.object({
  vesselName: z.string().min(1).max(255),
  voyageNumber: z.string().min(1).max(50),
  imoNumber: z.string().max(20).optional(),
  callSign: z.string().max(20).optional(),
  masterName: z.string().max(255).optional(),
  portOfLoading: z.string().min(1).max(255),
  portOfDischarge: z.string().min(1).max(255),
  departureDate: z.coerce.date().optional(),
  arrivalDate: z.coerce.date().optional(),
  totalDgContainers: z.number().int().optional(),
  totalDgWeight: z.string().optional(),
  weightUnit: z.string().max(5).optional(),
  dgItems: z.array(z.record(z.string(), z.unknown())).optional(),
  submittedToAuthority: z.string().max(255).optional(),
  submissionDate: z.coerce.date().optional(),
  submissionReference: z.string().max(100).optional(),
  preparedByName: z.string().max(255).optional(),
  approvedByName: z.string().max(255).optional(),
  approvedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateManifestSchema = createManifestSchema.partial();

// ==========================================
// Emergency Procedures
// ==========================================

export const createEmergencyProcedureSchema = z.object({
  procedureName: z.string().min(1).max(255),
  procedureType: z.enum(["fire", "spillage", "exposure", "general", "evacuation", "decontamination"]),
  emsNumber: z.string().max(20).optional(),
  mfagTableNumber: z.string().max(20).optional(),
  applicableClasses: z.array(z.string()).optional(),
  applicableUnNumbers: z.array(z.string()).optional(),
  fireResponse: z.string().optional(),
  spillageResponse: z.string().optional(),
  firstAidMeasures: z.string().optional(),
  personalProtection: z.string().optional(),
  evacuationProcedure: z.string().optional(),
  decontamination: z.string().optional(),
  specialEquipment: z.array(z.record(z.string(), z.unknown())).optional(),
  emergencyContacts: z.array(z.record(z.string(), z.unknown())).optional(),
  trainingRequirements: z.string().optional(),
  drillFrequency: z.string().max(30).optional(),
  lastDrillDate: z.coerce.date().optional(),
  nextDrillDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateEmergencyProcedureSchema = createEmergencyProcedureSchema.partial();

// ==========================================
// Chemical Safety Data
// ==========================================

export const createChemicalSafetyDataSchema = z.object({
  chemicalName: z.string().min(1).max(500),
  casNumber: z.string().max(30).optional(),
  unNumber: z.string().max(10).optional(),
  imdgClass: z.string().max(10).optional(),
  manufacturer: z.string().max(255).optional(),
  supplierName: z.string().max(255).optional(),
  sdsVersion: z.string().max(20).optional(),
  sdsDate: z.coerce.date().optional(),
  hazardIdentification: z.string().optional(),
  compositionInfo: z.record(z.string(), z.unknown()).optional(),
  firstAidMeasures: z.string().optional(),
  firefightingMeasures: z.string().optional(),
  accidentalRelease: z.string().optional(),
  handlingAndStorage: z.string().optional(),
  exposureControls: z.string().optional(),
  physicalProperties: z.record(z.string(), z.unknown()).optional(),
  stabilityReactivity: z.string().optional(),
  toxicologicalInfo: z.string().optional(),
  ecologicalInfo: z.string().optional(),
  disposalConsiderations: z.string().optional(),
  transportInfo: z.string().optional(),
  regulatoryInfo: z.string().optional(),
  sdsDocumentUrl: z.string().max(500).optional(),
  expiryDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateChemicalSafetyDataSchema = createChemicalSafetyDataSchema.partial();

// ==========================================
// Incident Reports
// ==========================================

export const createIncidentReportSchema = z.object({
  incidentType: z.enum(["leakage", "fire", "explosion", "contamination", "spill", "exposure", "structural_failure", "other"]),
  severityLevel: z.enum(["minor", "moderate", "major", "critical"]),
  incidentDate: z.coerce.date(),
  locationDescription: z.string().min(1).max(500),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  unNumber: z.string().max(10).optional(),
  properShippingName: z.string().max(500).optional(),
  imdgClass: z.string().max(10).optional(),
  description: z.string().min(1),
  immediateActions: z.string().optional(),
  casualties: z.number().int().optional(),
  injuries: z.number().int().optional(),
  environmentalImpact: z.string().optional(),
  propertyDamage: z.string().optional(),
  estimatedCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  reportedByName: z.string().max(255).optional(),
  reportedAt: z.coerce.date().optional(),
  investigatorName: z.string().max(255).optional(),
  investigationStarted: z.coerce.date().optional(),
  investigationFindings: z.string().optional(),
  rootCause: z.string().optional(),
  correctiveActions: z.array(z.record(z.string(), z.unknown())).optional(),
  preventiveMeasures: z.array(z.record(z.string(), z.unknown())).optional(),
  lessonsLearned: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateIncidentReportSchema = createIncidentReportSchema.partial();
