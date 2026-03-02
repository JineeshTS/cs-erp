import { z } from "zod/v4";

// ==========================================
// Import Customs Clearance Management
// ==========================================
export const createImportClearanceSchema = z.object({
  declarationType: z.enum(["import", "temporary_import", "re_import", "warehousing"]),
  declarationNumber: z.string().max(50).optional(),
  customsOffice: z.string().max(255).optional(),
  importerName: z.string().min(1).max(255),
  importerCode: z.string().max(50).optional(),
  importerTaxId: z.string().max(50).optional(),
  consignmentRef: z.string().max(50).optional(),
  blNumber: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  portOfOrigin: z.string().max(255).optional(),
  portOfEntry: z.string().min(1).max(255),
  cargoDescription: z.string().optional(),
  hsCode: z.string().max(20).optional(),
  grossWeightKg: z.string().optional(),
  numberOfPackages: z.number().int().optional(),
  invoiceValue: z.string().optional(),
  invoiceCurrency: z.string().max(3).optional(),
  customsValue: z.string().optional(),
  dutyAmount: z.string().optional(),
  vatAmount: z.string().optional(),
  totalTaxes: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank_transfer", "guarantee", "deferred"]).optional(),
  filedAt: z.coerce.date().optional(),
  clearedAt: z.coerce.date().optional(),
  releaseOrderNumber: z.string().max(50).optional(),
  inspectionRequired: z.boolean().optional(),
  inspectionResult: z.enum(["passed", "failed", "pending"]).optional(),
  brokerName: z.string().max(255).optional(),
  brokerLicense: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateImportClearanceSchema = createImportClearanceSchema.partial();

// ==========================================
// Export Customs Filing & Submission
// ==========================================
export const createExportFilingSchema = z.object({
  declarationType: z.enum(["export", "re_export", "temporary_export"]),
  declarationNumber: z.string().max(50).optional(),
  customsOffice: z.string().max(255).optional(),
  exporterName: z.string().min(1).max(255),
  exporterCode: z.string().max(50).optional(),
  exporterTaxId: z.string().max(50).optional(),
  consigneeName: z.string().max(255).optional(),
  consigneeCountry: z.string().max(100).optional(),
  blNumber: z.string().max(50).optional(),
  containerNumber: z.string().max(20).optional(),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  portOfLoading: z.string().min(1).max(255),
  portOfDischarge: z.string().max(255).optional(),
  cargoDescription: z.string().optional(),
  hsCode: z.string().max(20).optional(),
  grossWeightKg: z.string().optional(),
  numberOfPackages: z.number().int().optional(),
  fobValue: z.string().optional(),
  currency: z.string().max(3).optional(),
  exportLicenseRequired: z.boolean().optional(),
  exportLicenseNumber: z.string().max(50).optional(),
  filedAt: z.coerce.date().optional(),
  approvedAt: z.coerce.date().optional(),
  brokerName: z.string().max(255).optional(),
  brokerLicense: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateExportFilingSchema = createExportFilingSchema.partial();

// ==========================================
// Transit & Re-Export Procedures
// ==========================================
export const createTransitProcedureSchema = z.object({
  procedureType: z.enum(["transit", "re_export", "transshipment", "bonded_movement"]),
  declarationNumber: z.string().max(50).optional(),
  customsOfficeOrigin: z.string().max(255).optional(),
  customsOfficeDestination: z.string().max(255).optional(),
  principalName: z.string().min(1).max(255),
  principalCode: z.string().max(50).optional(),
  guaranteeType: z.enum(["bank_guarantee", "cash_deposit", "customs_bond", "waiver"]).optional(),
  guaranteeAmount: z.string().optional(),
  guaranteeCurrency: z.string().max(3).optional(),
  guaranteeReference: z.string().max(100).optional(),
  containerNumber: z.string().max(20).optional(),
  sealNumber: z.string().max(30).optional(),
  cargoDescription: z.string().optional(),
  hsCode: z.string().max(20).optional(),
  grossWeightKg: z.string().optional(),
  originCountry: z.string().max(100).optional(),
  destinationCountry: z.string().max(100).optional(),
  routeDescription: z.string().optional(),
  transitStartAt: z.coerce.date().optional(),
  transitDeadlineAt: z.coerce.date().optional(),
  transitCompletedAt: z.coerce.date().optional(),
  discharged: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateTransitProcedureSchema = createTransitProcedureSchema.partial();

// ==========================================
// Customs Duty & Tax Calculation
// ==========================================
export const createDutyCalculationSchema = z.object({
  clearanceRef: z.string().max(50).optional(),
  hsCode: z.string().min(1).max(20),
  hsDescription: z.string().optional(),
  originCountry: z.string().max(100).optional(),
  destinationCountry: z.string().max(100).optional(),
  valuationMethod: z.enum(["transaction_value", "deductive", "computed", "fallback"]).optional(),
  cifValue: z.string().min(1),
  cifCurrency: z.string().min(1).max(3),
  exchangeRate: z.string().optional(),
  dutyRate: z.string().optional(),
  dutyAmount: z.string().optional(),
  vatRate: z.string().optional(),
  vatAmount: z.string().optional(),
  exciseRate: z.string().optional(),
  exciseAmount: z.string().optional(),
  antidumpingDuty: z.string().optional(),
  safeguardDuty: z.string().optional(),
  totalDutyTax: z.string().optional(),
  preferentialTariff: z.boolean().optional(),
  ftaReference: z.string().max(100).optional(),
  exemptionCode: z.string().max(30).optional(),
  exemptionReason: z.string().optional(),
  calculatedByName: z.string().max(255).optional(),
  calculatedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDutyCalculationSchema = createDutyCalculationSchema.partial();

// ==========================================
// AEO Authorized Economic Operator Compliance
// ==========================================
export const createAeoComplianceSchema = z.object({
  aeoType: z.enum(["aeo_c", "aeo_s", "aeo_f", "trusted_trader"]),
  companyName: z.string().min(1).max(255),
  companyRegistration: z.string().max(100).optional(),
  authorityName: z.string().max(255).optional(),
  certificateNumber: z.string().max(100).optional(),
  certificateIssuedAt: z.coerce.date().optional(),
  certificateExpiresAt: z.coerce.date().optional(),
  auditFrequency: z.enum(["annual", "biannual", "triennial"]).optional(),
  lastAuditDate: z.coerce.date().optional(),
  nextAuditDate: z.coerce.date().optional(),
  auditResult: z.enum(["passed", "conditional", "failed"]).optional(),
  complianceScore: z.string().optional(),
  riskCategory: z.enum(["low", "medium", "high"]).optional(),
  contactName: z.string().max(255).optional(),
  contactEmail: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateAeoComplianceSchema = createAeoComplianceSchema.partial();

// ==========================================
// ISPS Maritime Security Compliance
// ==========================================
export const createIspsComplianceSchema = z.object({
  facilityType: z.enum(["port_facility", "vessel", "terminal", "offshore"]),
  facilityName: z.string().min(1).max(255),
  facilityCode: z.string().max(50).optional(),
  imoNumber: z.string().max(20).optional(),
  securityLevel: z.enum(["1", "2", "3"]),
  pfsoName: z.string().max(255).optional(),
  pfsoContact: z.string().max(100).optional(),
  ssoName: z.string().max(255).optional(),
  securityPlanRef: z.string().max(100).optional(),
  securityPlanApprovedAt: z.coerce.date().optional(),
  lastDrillDate: z.coerce.date().optional(),
  nextDrillDate: z.coerce.date().optional(),
  lastAuditDate: z.coerce.date().optional(),
  nextAuditDate: z.coerce.date().optional(),
  auditResult: z.enum(["compliant", "non_compliant", "observation"]).optional(),
  isscNumber: z.string().max(50).optional(),
  isscExpiresAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateIspsComplianceSchema = createIspsComplianceSchema.partial();

// ==========================================
// Port State Control PSC Preparation
// ==========================================
export const createPscPreparationSchema = z.object({
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  flagState: z.string().max(100).optional(),
  classificationSociety: z.string().max(255).optional(),
  inspectionPort: z.string().min(1).max(255),
  inspectionDate: z.coerce.date().optional(),
  inspectorName: z.string().max(255).optional(),
  inspectionType: z.enum(["initial", "expanded", "detailed", "follow_up"]).optional(),
  mouRegime: z.enum(["paris_mou", "tokyo_mou", "indian_ocean_mou", "riyadh_mou"]).optional(),
  targetFactor: z.string().optional(),
  deficienciesFound: z.number().int().optional(),
  detentionIssued: z.boolean().optional(),
  detentionReason: z.string().optional(),
  rectifiedAt: z.coerce.date().optional(),
  overallResult: z.enum(["clear", "deficiency", "detention"]).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePscPreparationSchema = createPscPreparationSchema.partial();

// ==========================================
// IMO Circular & Regulation Tracking
// ==========================================
export const createImoRegulationSchema = z.object({
  regulationType: z.enum(["circular", "resolution", "amendment", "guideline", "convention"]),
  imoReference: z.string().max(100).optional(),
  title: z.string().min(1).max(500),
  issuingBody: z.enum(["MSC", "MEPC", "FAL", "LEG", "TC"]).optional(),
  conventionName: z.string().max(255).optional(),
  publishedAt: z.coerce.date().optional(),
  effectiveAt: z.coerce.date().optional(),
  complianceDeadline: z.coerce.date().optional(),
  summary: z.string().optional(),
  impactAssessment: z.string().optional(),
  implementationProgress: z.string().optional(),
  responsiblePerson: z.string().max(255).optional(),
  documentUrl: z.string().max(500).optional(),
  supersedes: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateImoRegulationSchema = createImoRegulationSchema.partial();
