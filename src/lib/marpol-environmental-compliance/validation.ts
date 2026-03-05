import { z } from "zod/v4";

// ==========================================
// MARPOL Annex I to VI Compliance Tracking
// ==========================================
export const createAnnexComplianceSchema = z.object({
  complianceType: z.enum(["annex_i_oil", "annex_ii_nls", "annex_iii_harmful", "annex_iv_sewage", "annex_v_garbage", "annex_vi_air"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  inspectionDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  certificateNumber: z.string().max(100).optional(),
  issuingAuthority: z.string().max(255).optional(),
  isCompliant: z.boolean().optional(),
  findingsCount: z.number().int().optional(),
  correctiveActions: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateAnnexComplianceSchema = createAnnexComplianceSchema.partial();

// ==========================================
// Ballast Water Management BWM Convention
// ==========================================
export const createBallastWaterSchema = z.object({
  ballastType: z.enum(["exchange", "treatment", "discharge", "sampling", "compliance_check"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  treatmentSystem: z.string().max(255).optional(),
  operationDate: z.coerce.date().optional(),
  portName: z.string().max(255).optional(),
  volumeCubicMeters: z.string().optional(),
  exchangeLatitude: z.string().optional(),
  exchangeLongitude: z.string().optional(),
  isCompliant: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateBallastWaterSchema = createBallastWaterSchema.partial();

// ==========================================
// Anti-Fouling System AFS Compliance
// ==========================================
export const createAntiFoulingSchema = z.object({
  afsType: z.enum(["initial_survey", "renewal_survey", "endorsement", "declaration", "compliance_check"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  coatingType: z.string().max(255).optional(),
  applicationDate: z.coerce.date().optional(),
  surveyDate: z.coerce.date().optional(),
  certificateNumber: z.string().max(100).optional(),
  issuingAuthority: z.string().max(255).optional(),
  isTbtFree: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateAntiFoulingSchema = createAntiFoulingSchema.partial();

// ==========================================
// Vessel Waste Management MARPOL Annex V
// ==========================================
export const createWasteManagementSchema = z.object({
  wasteType: z.enum(["plastics", "food_waste", "domestic_waste", "cooking_oil", "operational_waste", "cargo_residues"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  disposalMethod: z.string().max(100).optional(),
  disposalDate: z.coerce.date().optional(),
  portName: z.string().max(255).optional(),
  quantityKg: z.string().optional(),
  receivingFacility: z.string().max(255).optional(),
  receiptNumber: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateWasteManagementSchema = createWasteManagementSchema.partial();

// ==========================================
// 0.5% Sulphur Fuel Cap Compliance
// ==========================================
export const createSulphurCapSchema = z.object({
  sulphurType: z.enum(["fuel_sample", "scrubber_report", "compliance_plan", "bunker_note", "eca_compliance"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  fuelType: z.string().max(100).optional(),
  sulphurContent: z.string().optional(),
  sampleDate: z.coerce.date().optional(),
  labReference: z.string().max(100).optional(),
  hasScrubber: z.boolean().optional(),
  isCompliant: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSulphurCapSchema = createSulphurCapSchema.partial();

// ==========================================
// CII Rating Tracking & Improvement Planning
// ==========================================
export const createCiiRatingSchema = z.object({
  ciiType: z.enum(["annual_rating", "quarterly_review", "improvement_plan", "corrective_action", "forecast"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  reportingYear: z.number().int().optional(),
  attainedCii: z.string().optional(),
  requiredCii: z.string().optional(),
  rating: z.string().max(1).optional(),
  improvementTarget: z.string().optional(),
  correctionPlan: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCiiRatingSchema = createCiiRatingSchema.partial();

// ==========================================
// Sea Cargo Charter Annual Disclosure
// ==========================================
export const createCargoCharterSchema = z.object({
  charterType: z.enum(["annual_disclosure", "voyage_report", "alignment_assessment", "trajectory_analysis", "benchmark"]),
  title: z.string().max(255).optional(),
  reportingYear: z.number().int().optional(),
  tradeLane: z.string().max(255).optional(),
  totalVoyages: z.number().int().optional(),
  totalCargoTonnes: z.string().optional(),
  totalCo2Tonnes: z.string().optional(),
  carbonIntensity: z.string().optional(),
  alignmentStatus: z.string().max(50).optional(),
  disclosureDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCargoCharterSchema = createCargoCharterSchema.partial();

// ==========================================
// Environmental Incident Reporting & Investigation
// ==========================================
export const createEnvironmentalIncidentSchema = z.object({
  incidentType: z.enum(["oil_spill", "chemical_release", "sewage_discharge", "garbage_violation", "air_emission", "ballast_violation"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  incidentDate: z.coerce.date().optional(),
  locationDescription: z.string().max(255).optional(),
  severity: z.string().max(20).optional(),
  quantitySpilled: z.string().optional(),
  rootCause: z.string().optional(),
  correctiveActions: z.string().optional(),
  reportedToAuthority: z.boolean().optional(),
  fineAmount: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateEnvironmentalIncidentSchema = createEnvironmentalIncidentSchema.partial();
