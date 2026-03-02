import { z } from "zod/v4";

// ==========================================
// Planned Maintenance Tasks
// ==========================================

export const createPlannedMaintenanceTaskSchema = z.object({
  vesselName: z.string().min(1).max(255),
  equipmentCode: z.string().min(1).max(50),
  equipmentName: z.string().min(1).max(255),
  componentName: z.string().max(255).optional(),
  maintenanceType: z.enum(["preventive", "corrective", "condition_based", "emergency"]),
  intervalType: z.enum(["running_hours", "calendar", "condition"]),
  intervalValue: z.number().int().positive(),
  lastDoneDate: z.coerce.date().optional(),
  lastDoneHours: z.number().int().optional(),
  nextDueDate: z.coerce.date().optional(),
  nextDueHours: z.number().int().optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  assignedToName: z.string().max(255).optional(),
  department: z.string().max(100).optional(),
  estimatedHours: z.number().int().optional(),
  actualHours: z.number().int().optional(),
  spareParts: z.record(z.string(), z.unknown()).optional(),
  instructions: z.string().optional(),
  completedAt: z.coerce.date().optional(),
  completedByName: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePlannedMaintenanceTaskSchema = createPlannedMaintenanceTaskSchema.partial();

// ==========================================
// Dry Dock Plans
// ==========================================

export const createDryDockPlanSchema = z.object({
  vesselName: z.string().min(1).max(255),
  dockYardName: z.string().min(1).max(255),
  dockYardLocation: z.string().max(255).optional(),
  dockYardCountry: z.string().max(100).optional(),
  plannedStartDate: z.coerce.date(),
  plannedEndDate: z.coerce.date(),
  actualStartDate: z.coerce.date().optional(),
  actualEndDate: z.coerce.date().optional(),
  scope: z.string().optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
  estimatedCost: z.number().int().optional(),
  actualCost: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  quotations: z.record(z.string(), z.unknown()).optional(),
  selectedContractor: z.string().max(255).optional(),
  className: z.string().max(100).optional(),
  classApproval: z.boolean().optional(),
  projectManagerName: z.string().max(255).optional(),
  workItems: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDryDockPlanSchema = createDryDockPlanSchema.partial();

// ==========================================
// Survey Trackings
// ==========================================

export const createSurveyTrackingSchema = z.object({
  vesselName: z.string().min(1).max(255),
  surveyType: z.enum(["annual", "intermediate", "special", "renewal", "docking", "bottom", "class_renewal", "flag_state"]),
  surveyAuthority: z.string().min(1).max(255),
  surveyorName: z.string().max(255).optional(),
  dueDate: z.coerce.date(),
  windowStartDate: z.coerce.date().optional(),
  windowEndDate: z.coerce.date().optional(),
  surveyDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  certificateName: z.string().max(255).optional(),
  certificateNumber: z.string().max(100).optional(),
  issuedBy: z.string().max(255).optional(),
  findings: z.record(z.string(), z.unknown()).optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  remediationRequired: z.boolean().optional(),
  remediationDeadline: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSurveyTrackingSchema = createSurveyTrackingSchema.partial();

// ==========================================
// Defect Repairs
// ==========================================

export const createDefectRepairSchema = z.object({
  vesselName: z.string().min(1).max(255),
  equipmentCode: z.string().max(50).optional(),
  equipmentName: z.string().max(255).optional(),
  defectCategory: z.enum(["structural", "mechanical", "electrical", "piping", "navigation", "safety", "other"]),
  severity: z.enum(["critical", "major", "minor", "observation"]),
  reportedDate: z.coerce.date(),
  reportedByName: z.string().max(255).optional(),
  description: z.string().min(1),
  rootCause: z.string().optional(),
  repairMethod: z.string().optional(),
  estimatedCost: z.number().int().optional(),
  actualCost: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  repairStartDate: z.coerce.date().optional(),
  repairEndDate: z.coerce.date().optional(),
  repairedByName: z.string().max(255).optional(),
  classNotificationRequired: z.boolean().optional(),
  classNotified: z.boolean().optional(),
  sparesUsed: z.record(z.string(), z.unknown()).optional(),
  photos: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDefectRepairSchema = createDefectRepairSchema.partial();

// ==========================================
// Spare Parts
// ==========================================

export const createSparePartSchema = z.object({
  vesselName: z.string().max(255).optional(),
  partNumber: z.string().min(1).max(100),
  partName: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(["engine", "deck", "electrical", "navigation", "safety", "piping", "other"]),
  manufacturer: z.string().max(255).optional(),
  modelNumber: z.string().max(100).optional(),
  unitOfMeasure: z.string().max(30).optional(),
  minimumStock: z.number().int().optional(),
  currentStock: z.number().int().optional(),
  reorderLevel: z.number().int().optional(),
  lastOrderDate: z.coerce.date().optional(),
  lastOrderQuantity: z.number().int().optional(),
  lastUnitPrice: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  storageLocation: z.string().max(255).optional(),
  criticalPart: z.boolean().optional(),
  leadTimeDays: z.number().int().optional(),
  preferredSupplierName: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSparePartSchema = createSparePartSchema.partial();

// ==========================================
// Technical Procurements
// ==========================================

export const createTechnicalProcurementSchema = z.object({
  vesselName: z.string().min(1).max(255),
  requestType: z.enum(["spare_parts", "services", "equipment", "consumables", "other"]),
  description: z.string().min(1),
  lineItems: z.record(z.string(), z.unknown()).optional(),
  requestedByName: z.string().max(255).optional(),
  department: z.string().max(100).optional(),
  urgency: z.enum(["emergency", "urgent", "routine", "planned"]).optional(),
  estimatedBudget: z.number().int().optional(),
  approvedBudget: z.number().int().optional(),
  actualCost: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  supplierName: z.string().max(255).optional(),
  quotations: z.record(z.string(), z.unknown()).optional(),
  purchaseOrderRef: z.string().max(100).optional(),
  deliveryDate: z.coerce.date().optional(),
  approvedByName: z.string().max(255).optional(),
  approvedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateTechnicalProcurementSchema = createTechnicalProcurementSchema.partial();

// ==========================================
// Compliance Records
// ==========================================

export const createComplianceRecordSchema = z.object({
  vesselName: z.string().min(1).max(255),
  complianceType: z.enum(["ism_audit", "solas", "marpol", "isps", "mlc", "ballast_water", "ems", "other"]),
  certificateName: z.string().max(255).optional(),
  certificateNumber: z.string().max(100).optional(),
  issuingAuthority: z.string().max(255).optional(),
  issuedDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  auditDate: z.coerce.date().optional(),
  auditorName: z.string().max(255).optional(),
  auditFindings: z.record(z.string(), z.unknown()).optional(),
  nonConformities: z.number().int().optional(),
  majorNc: z.number().int().optional(),
  minorNc: z.number().int().optional(),
  observations: z.number().int().optional(),
  correctiveActions: z.record(z.string(), z.unknown()).optional(),
  closureDeadline: z.coerce.date().optional(),
  lastInspectionDate: z.coerce.date().optional(),
  nextInspectionDate: z.coerce.date().optional(),
  documentRefs: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateComplianceRecordSchema = createComplianceRecordSchema.partial();

// ==========================================
// Predictive Maintenance
// ==========================================

export const createPredictiveMaintenanceSchema = z.object({
  vesselName: z.string().min(1).max(255),
  equipmentCode: z.string().min(1).max(50),
  equipmentName: z.string().min(1).max(255),
  modelType: z.enum(["vibration_analysis", "oil_analysis", "thermal", "performance_degradation", "pattern_recognition", "custom"]),
  inputParameters: z.record(z.string(), z.unknown()).optional(),
  modelVersion: z.string().max(50).optional(),
  predictionDate: z.coerce.date(),
  predictedFailureDate: z.coerce.date().optional(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  riskLevel: z.enum(["critical", "high", "medium", "low"]).optional(),
  currentCondition: z.string().optional(),
  degradationRate: z.number().int().optional(),
  recommendations: z.record(z.string(), z.unknown()).optional(),
  aiInsights: z.string().optional(),
  alertsGenerated: z.number().int().optional(),
  alertsSent: z.boolean().optional(),
  actionTaken: z.string().optional(),
  actionDate: z.coerce.date().optional(),
  accuracy: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePredictiveMaintenanceSchema = createPredictiveMaintenanceSchema.partial();
