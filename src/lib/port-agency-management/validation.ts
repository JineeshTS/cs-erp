import { z } from "zod/v4";

// ==========================================
// Port Call Planning & Coordination
// ==========================================
export const createPortCallPlanSchema = z.object({
  planType: z.enum(["scheduled", "unscheduled", "emergency", "bunker_only", "crew_change"]),
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  voyageRef: z.string().max(50).optional(),
  portName: z.string().min(1).max(255),
  portCode: z.string().max(10).optional(),
  berthName: z.string().max(100).optional(),
  terminalName: z.string().max(255).optional(),
  agentName: z.string().max(255).optional(),
  agentContactEmail: z.string().max(255).optional(),
  agentContactPhone: z.string().max(50).optional(),
  eta: z.coerce.date().optional(),
  etd: z.coerce.date().optional(),
  ata: z.coerce.date().optional(),
  atd: z.coerce.date().optional(),
  pilotRequired: z.boolean().optional(),
  tugRequired: z.boolean().optional(),
  tugsCount: z.number().int().optional(),
  cargoOpsPlanned: z.record(z.string(), z.unknown()).optional(),
  servicesRequired: z.array(z.string()).optional(),
  specialInstructions: z.string().optional(),
  portChargesEstimate: z.string().optional(),
  portChargesCurrency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePortCallPlanSchema = createPortCallPlanSchema.partial();

// ==========================================
// Husbandry & Crew Services
// ==========================================
export const createHusbandryServiceSchema = z.object({
  serviceType: z.enum(["provisions", "medical", "repairs", "stores", "crew_welfare", "launch_service", "garbage_removal", "fresh_water"]),
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  portCallRef: z.string().max(50).optional(),
  portName: z.string().max(255).optional(),
  supplierName: z.string().max(255).optional(),
  supplierContact: z.string().max(255).optional(),
  supplierPhone: z.string().max(50).optional(),
  requestedDate: z.coerce.date().optional(),
  deliveryDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
  description: z.string().optional(),
  quantity: z.number().int().optional(),
  unit: z.string().max(30).optional(),
  estimatedCost: z.string().optional(),
  actualCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  invoiceRef: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateHusbandryServiceSchema = createHusbandryServiceSchema.partial();

// ==========================================
// Pre-Arrival Checklist & Notifications
// ==========================================
export const createPreArrivalChecklistSchema = z.object({
  checklistType: z.enum(["standard", "hazmat", "tanker", "bulk", "passenger", "port_specific"]),
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  portCallRef: z.string().max(50).optional(),
  portName: z.string().max(255).optional(),
  arrivalDate: z.coerce.date().optional(),
  documentsDue: z.coerce.date().optional(),
  checklistItems: z.array(z.record(z.string(), z.unknown())).optional(),
  totalCount: z.number().int().optional(),
  portAuthorityNotified: z.boolean().optional(),
  customsNotified: z.boolean().optional(),
  immigrationNotified: z.boolean().optional(),
  healthAuthorityNotified: z.boolean().optional(),
  assignedTo: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePreArrivalChecklistSchema = createPreArrivalChecklistSchema.partial();

// ==========================================
// Port Authority Communications
// ==========================================
export const createPortAuthorityCommunicationSchema = z.object({
  commType: z.enum(["notice_arrival", "clearance_request", "berthing_request", "departure_notice", "safety_report", "incident_report", "general"]),
  authorityName: z.string().min(1).max(255),
  authorityDepartment: z.string().max(255).optional(),
  contactPerson: z.string().max(255).optional(),
  contactEmail: z.string().max(255).optional(),
  contactPhone: z.string().max(50).optional(),
  vesselName: z.string().max(255).optional(),
  imoNumber: z.string().max(20).optional(),
  portCallRef: z.string().max(50).optional(),
  portName: z.string().max(255).optional(),
  subject: z.string().min(1).max(500),
  messageBody: z.string().optional(),
  direction: z.enum(["inbound", "outbound"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  sentAt: z.coerce.date().optional(),
  receivedAt: z.coerce.date().optional(),
  responseRequired: z.boolean().optional(),
  responseDeadline: z.coerce.date().optional(),
  responseText: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePortAuthorityCommunicationSchema = createPortAuthorityCommunicationSchema.partial();

// ==========================================
// Crew Change Coordination & Logistics
// ==========================================
export const createCrewChangeCoordinationSchema = z.object({
  coordinationType: z.enum(["sign_on", "sign_off", "relief", "emergency", "medical_repatriation"]),
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  portCallRef: z.string().max(50).optional(),
  portName: z.string().max(255).optional(),
  crewMemberName: z.string().min(1).max(255),
  crewRank: z.string().max(100).optional(),
  nationality: z.string().max(100).optional(),
  passportNumber: z.string().max(50).optional(),
  seamanBookNumber: z.string().max(50).optional(),
  visaRequired: z.boolean().optional(),
  visaStatus: z.enum(["not_required", "pending", "approved", "rejected"]).optional(),
  flightDetails: z.record(z.string(), z.unknown()).optional(),
  hotelRequired: z.boolean().optional(),
  hotelDetails: z.record(z.string(), z.unknown()).optional(),
  transportArranged: z.boolean().optional(),
  transportDetails: z.string().optional(),
  scheduledDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
  estimatedCost: z.string().optional(),
  actualCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCrewChangeCoordinationSchema = createCrewChangeCoordinationSchema.partial();

// ==========================================
// Cash to Master & Petty Cash
// ==========================================
export const createCashToMasterSchema = z.object({
  transactionType: z.enum(["cash_advance", "petty_cash", "reimbursement", "settlement"]),
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  portCallRef: z.string().max(50).optional(),
  portName: z.string().max(255).optional(),
  masterName: z.string().max(255).optional(),
  requestedAmount: z.string().min(1),
  currency: z.string().max(3).optional(),
  exchangeRate: z.string().optional(),
  localCurrency: z.string().max(3).optional(),
  localAmount: z.string().optional(),
  purpose: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCashToMasterSchema = createCashToMasterSchema.partial();

// ==========================================
// Vessel Clearance Inward & Outward
// ==========================================
export const createVesselClearanceSchema = z.object({
  clearanceType: z.enum(["inward", "outward", "coastal", "transit"]),
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  portCallRef: z.string().max(50).optional(),
  portName: z.string().min(1).max(255),
  flagState: z.string().max(100).optional(),
  lastPort: z.string().max(255).optional(),
  nextPort: z.string().max(255).optional(),
  grossTonnage: z.string().optional(),
  netTonnage: z.string().optional(),
  crewCount: z.number().int().optional(),
  passengerCount: z.number().int().optional(),
  cargoDescription: z.string().optional(),
  healthDeclaration: z.boolean().optional(),
  customsClearance: z.boolean().optional(),
  immigrationClearance: z.boolean().optional(),
  portHealthClearance: z.boolean().optional(),
  quarantineClearance: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateVesselClearanceSchema = createVesselClearanceSchema.partial();

// ==========================================
// Disbursement Account Management
// ==========================================
export const createDisbursementAccountSchema = z.object({
  accountType: z.enum(["proforma", "final", "supplementary", "credit_note"]),
  vesselName: z.string().min(1).max(255),
  imoNumber: z.string().max(20).optional(),
  portCallRef: z.string().max(50).optional(),
  portName: z.string().max(255).optional(),
  voyageRef: z.string().max(50).optional(),
  principalName: z.string().max(255).optional(),
  principalRef: z.string().max(50).optional(),
  lineItems: z.array(z.record(z.string(), z.unknown())).optional(),
  subtotal: z.string().optional(),
  agencyFee: z.string().optional(),
  taxAmount: z.string().optional(),
  totalAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  advanceReceived: z.string().optional(),
  balanceDue: z.string().optional(),
  proformaRef: z.string().max(50).optional(),
  proformaAmount: z.string().optional(),
  varianceExplanation: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateDisbursementAccountSchema = createDisbursementAccountSchema.partial();
