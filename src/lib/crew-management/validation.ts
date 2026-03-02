import { z } from "zod/v4";

// ==========================================
// Crew Rotations
// ==========================================

export const createCrewRotationSchema = z.object({
  vesselName: z.string().min(1).max(255),
  crewMemberName: z.string().min(1).max(255),
  rank: z.string().min(1).max(100),
  nationality: z.string().max(100).optional(),
  joiningDate: z.coerce.date(),
  relievingDate: z.coerce.date().optional(),
  contractDuration: z.number().int().optional(),
  rotationType: z.enum(["joining", "relieving", "extension", "transfer"]),
  relievingCrewName: z.string().max(255).optional(),
  handoverNotes: z.string().optional(),
  travelArrangements: z.record(z.string(), z.unknown()).optional(),
  reliefPort: z.string().max(255).optional(),
  reliefCountry: z.string().max(100).optional(),
  approvedByName: z.string().max(255).optional(),
  approvedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCrewRotationSchema = createCrewRotationSchema.partial();

// ==========================================
// Certificate Trackings
// ==========================================

export const createCertificateTrackingSchema = z.object({
  crewMemberName: z.string().min(1).max(255),
  rank: z.string().max(100).optional(),
  certificateType: z.enum(["stcw", "flag_state", "medical", "passport", "endorsement", "goc", "tanker", "ism", "other"]),
  certificateName: z.string().min(1).max(255),
  certificateNumber: z.string().max(100).optional(),
  issuingAuthority: z.string().max(255).optional(),
  issuingCountry: z.string().max(100).optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  lastVerified: z.coerce.date().optional(),
  stcwRegulation: z.string().max(100).optional(),
  competencyLevel: z.string().max(50).optional(),
  revalidationRequired: z.boolean().optional(),
  revalidationDate: z.coerce.date().optional(),
  documentUrl: z.string().max(500).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCertificateTrackingSchema = createCertificateTrackingSchema.partial();

// ==========================================
// Payroll Allotments
// ==========================================

export const createPayrollAllotmentSchema = z.object({
  crewMemberName: z.string().min(1).max(255),
  rank: z.string().max(100).optional(),
  vesselName: z.string().min(1).max(255),
  payrollMonth: z.number().int().min(1).max(12),
  payrollYear: z.number().int().min(2000).max(2100),
  baseSalary: z.number().int().optional(),
  overtimeHours: z.number().int().optional(),
  overtimeRate: z.number().int().optional(),
  overtimeAmount: z.number().int().optional(),
  leavePay: z.number().int().optional(),
  bonuses: z.number().int().optional(),
  deductions: z.number().int().optional(),
  netPay: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  allotmentAmount: z.number().int().optional(),
  allotmentBeneficiary: z.string().max(255).optional(),
  allotmentBank: z.string().max(255).optional(),
  allotmentAccount: z.string().max(100).optional(),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.string().max(50).optional(),
  taxWithheld: z.number().int().optional(),
  socialSecurity: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePayrollAllotmentSchema = createPayrollAllotmentSchema.partial();

// ==========================================
// Flag State Compliance
// ==========================================

export const createFlagStateComplianceSchema = z.object({
  vesselName: z.string().min(1).max(255),
  flagState: z.string().min(1).max(100),
  inspectionType: z.enum(["port_state", "flag_state", "vetting", "class", "internal"]),
  inspectionDate: z.coerce.date(),
  inspectorName: z.string().max(255).optional(),
  inspectionPort: z.string().max(255).optional(),
  deficienciesFound: z.number().int().optional(),
  detainable: z.boolean().optional(),
  observations: z.record(z.string(), z.unknown()).optional(),
  findings: z.record(z.string(), z.unknown()).optional(),
  correctiveActions: z.record(z.string(), z.unknown()).optional(),
  rectificationDeadline: z.coerce.date().optional(),
  rectifiedDate: z.coerce.date().optional(),
  reportNumber: z.string().max(100).optional(),
  nextInspectionDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateFlagStateComplianceSchema = createFlagStateComplianceSchema.partial();

// ==========================================
// Manning Agencies
// ==========================================

export const createManningAgencySchema = z.object({
  agencyName: z.string().min(1).max(255),
  country: z.string().min(1).max(100),
  city: z.string().max(100).optional(),
  address: z.string().optional(),
  contactPerson: z.string().max(255).optional(),
  contactEmail: z.string().max(255).optional(),
  contactPhone: z.string().max(50).optional(),
  licenseNumber: z.string().max(100).optional(),
  licenseExpiry: z.coerce.date().optional(),
  flagStates: z.record(z.string(), z.unknown()).optional(),
  specializations: z.record(z.string(), z.unknown()).optional(),
  activeCrewCount: z.number().int().optional(),
  performanceRating: z.number().int().min(0).max(100).optional(),
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateManningAgencySchema = createManningAgencySchema.partial();

// ==========================================
// Visa Travel Records
// ==========================================

export const createVisaTravelRecordSchema = z.object({
  crewMemberName: z.string().min(1).max(255),
  nationality: z.string().max(100).optional(),
  recordType: z.enum(["visa", "travel", "repatriation"]),
  visaType: z.string().max(50).optional(),
  visaCountry: z.string().max(100).optional(),
  visaNumber: z.string().max(100).optional(),
  visaIssueDate: z.coerce.date().optional(),
  visaExpiryDate: z.coerce.date().optional(),
  travelDate: z.coerce.date().optional(),
  travelFrom: z.string().max(255).optional(),
  travelTo: z.string().max(255).optional(),
  flightNumber: z.string().max(50).optional(),
  airline: z.string().max(100).optional(),
  ticketNumber: z.string().max(100).optional(),
  ticketCost: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  repatriationReason: z.string().max(255).optional(),
  repatriationPort: z.string().max(255).optional(),
  arrangedByName: z.string().max(255).optional(),
  approvedByName: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateVisaTravelRecordSchema = createVisaTravelRecordSchema.partial();

// ==========================================
// Welfare Medical Records
// ==========================================

export const createWelfareMedicalRecordSchema = z.object({
  crewMemberName: z.string().min(1).max(255),
  rank: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  recordType: z.enum(["medical_exam", "injury", "illness", "welfare", "counseling", "dental", "eye"]),
  description: z.string().optional(),
  diagnosis: z.string().optional(),
  medicalProviderName: z.string().max(255).optional(),
  hospitalName: z.string().max(255).optional(),
  examinationDate: z.coerce.date().optional(),
  treatmentStartDate: z.coerce.date().optional(),
  treatmentEndDate: z.coerce.date().optional(),
  fitForDuty: z.boolean().optional(),
  restrictionNotes: z.string().optional(),
  costAmount: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  insuranceClaim: z.boolean().optional(),
  claimNumber: z.string().max(100).optional(),
  followUpDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateWelfareMedicalRecordSchema = createWelfareMedicalRecordSchema.partial();

// ==========================================
// MLC Compliance
// ==========================================

export const createMlcComplianceSchema = z.object({
  vesselName: z.string().min(1).max(255),
  flagState: z.string().min(1).max(100),
  mlcStandard: z.string().min(1).max(100),
  complianceArea: z.enum(["employment_agreements", "wages", "hours_rest", "repatriation", "recruitment", "accommodation", "food", "medical", "onboard_complaint", "social_security", "other"]),
  dmlcPartI: z.boolean().optional(),
  dmlcPartII: z.boolean().optional(),
  lastInspectionDate: z.coerce.date().optional(),
  nextInspectionDate: z.coerce.date().optional(),
  inspectorName: z.string().max(255).optional(),
  findings: z.record(z.string(), z.unknown()).optional(),
  correctiveActions: z.record(z.string(), z.unknown()).optional(),
  closureDeadline: z.coerce.date().optional(),
  certificateNumber: z.string().max(100).optional(),
  certificateIssueDate: z.coerce.date().optional(),
  certificateExpiryDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateMlcComplianceSchema = createMlcComplianceSchema.partial();
