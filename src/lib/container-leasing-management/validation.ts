import { z } from "zod/v4";

// ==========================================
// Lease Agreement Lifecycle Management
// ==========================================
export const createLeaseAgreementSchema = z.object({
  agreementType: z.enum(["master_lease", "spot_lease", "long_term", "short_term", "sale_leaseback"]),
  lessorName: z.string().max(255).optional(),
  lessorCode: z.string().max(50).optional(),
  containerType: z.string().max(50).optional(),
  containerSize: z.string().max(20).optional(),
  quantity: z.number().int().optional(),
  dailyRate: z.string().optional(),
  rateCurrency: z.string().max(3).optional(),
  minimumLeaseDays: z.number().int().optional(),
  commencementDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  pickupLocation: z.string().max(255).optional(),
  dropoffLocation: z.string().max(255).optional(),
  depositAmount: z.string().optional(),
  insuranceRequired: z.boolean().optional(),
  autoRenewal: z.boolean().optional(),
  terminationNoticeDays: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateLeaseAgreementSchema = createLeaseAgreementSchema.partial();

// ==========================================
// On-Hire Off-Hire Event Tracking
// ==========================================
export const createOnhireOffhireSchema = z.object({
  eventType: z.enum(["on_hire", "off_hire", "interchange", "redelivery", "pickup"]),
  agreementId: z.string().max(100).optional(),
  containerNumber: z.string().max(20).optional(),
  containerType: z.string().max(50).optional(),
  containerSize: z.string().max(20).optional(),
  eventDate: z.coerce.date().optional(),
  eventLocation: z.string().max(255).optional(),
  depotName: z.string().max(255).optional(),
  conditionGrade: z.string().max(10).optional(),
  surveyRequired: z.boolean().optional(),
  surveyDate: z.coerce.date().optional(),
  dailyRate: z.string().optional(),
  daysOnHire: z.number().int().optional(),
  totalCost: z.string().optional(),
  interchangeRef: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateOnhireOffhireSchema = createOnhireOffhireSchema.partial();

// ==========================================
// MNR Damage Billing to Lessor
// ==========================================
export const createMnrDamageBillingSchema = z.object({
  billingType: z.enum(["mnr_estimate", "mnr_invoice", "damage_claim", "repair_authorization", "credit_note"]),
  containerNumber: z.string().max(20).optional(),
  agreementId: z.string().max(100).optional(),
  lessorName: z.string().max(255).optional(),
  damageDescription: z.string().optional(),
  damageLocation: z.string().max(100).optional(),
  repairType: z.string().max(50).optional(),
  materialCost: z.string().optional(),
  laborCost: z.string().optional(),
  totalRepairCost: z.string().optional(),
  billingCurrency: z.string().max(3).optional(),
  responsibleParty: z.string().max(100).optional(),
  disputeRaised: z.boolean().optional(),
  approvedAmount: z.string().optional(),
  invoiceDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateMnrDamageBillingSchema = createMnrDamageBillingSchema.partial();

// ==========================================
// Lease Cost Allocation per Trade
// ==========================================
export const createLeaseCostAllocationSchema = z.object({
  allocationType: z.enum(["trade_route", "voyage", "service_loop", "cost_center", "project"]),
  agreementId: z.string().max(100).optional(),
  tradeLane: z.string().max(100).optional(),
  voyageRef: z.string().max(100).optional(),
  allocationPeriod: z.string().max(50).optional(),
  containerCount: z.number().int().optional(),
  totalLeaseDays: z.number().int().optional(),
  dailyRate: z.string().optional(),
  totalCostAllocated: z.string().optional(),
  allocationCurrency: z.string().max(3).optional(),
  costPerTeu: z.string().optional(),
  revenueGenerated: z.string().optional(),
  profitMargin: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateLeaseCostAllocationSchema = createLeaseCostAllocationSchema.partial();

// ==========================================
// Lessor Statement Reconciliation
// ==========================================
export const createLessorReconciliationSchema = z.object({
  reconciliationType: z.enum(["monthly_statement", "quarterly_review", "annual_audit", "dispute_resolution", "final_settlement"]),
  lessorName: z.string().max(255).optional(),
  agreementId: z.string().max(100).optional(),
  statementPeriod: z.string().max(50).optional(),
  lessorAmount: z.string().optional(),
  internalAmount: z.string().optional(),
  differenceAmount: z.string().optional(),
  reconciliationCurrency: z.string().max(3).optional(),
  itemsMatched: z.number().int().optional(),
  itemsUnmatched: z.number().int().optional(),
  disputeCount: z.number().int().optional(),
  adjustmentAmount: z.string().optional(),
  reconciliationDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateLessorReconciliationSchema = createLessorReconciliationSchema.partial();

// ==========================================
// Container Return & Redelivery Management
// ==========================================
export const createContainerRedeliverySchema = z.object({
  redeliveryType: z.enum(["scheduled_return", "early_return", "late_return", "drop_off", "swap"]),
  agreementId: z.string().max(100).optional(),
  containerNumber: z.string().max(20).optional(),
  containerType: z.string().max(50).optional(),
  redeliveryLocation: z.string().max(255).optional(),
  depotName: z.string().max(255).optional(),
  scheduledDate: z.coerce.date().optional(),
  actualDate: z.coerce.date().optional(),
  conditionOnReturn: z.string().max(50).optional(),
  cleaningRequired: z.boolean().optional(),
  repairRequired: z.boolean().optional(),
  penaltyApplicable: z.boolean().optional(),
  penaltyAmount: z.string().optional(),
  dropoffCharges: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateContainerRedeliverySchema = createContainerRedeliverySchema.partial();

// ==========================================
// Lease vs Buy Financial Analysis
// ==========================================
export const createLeaseVsBuyAnalysisSchema = z.object({
  analysisType: z.enum(["npv_comparison", "break_even", "sensitivity", "scenario", "portfolio"]),
  containerType: z.string().max(50).optional(),
  containerSize: z.string().max(20).optional(),
  quantity: z.number().int().optional(),
  purchasePrice: z.string().optional(),
  leaseRate: z.string().optional(),
  leaseTerm: z.number().int().optional(),
  discountRate: z.string().optional(),
  npvLease: z.string().optional(),
  npvBuy: z.string().optional(),
  breakEvenMonths: z.number().int().optional(),
  recommendation: z.string().max(50).optional(),
  savingsAmount: z.string().optional(),
  analysisCurrency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateLeaseVsBuyAnalysisSchema = createLeaseVsBuyAnalysisSchema.partial();

// ==========================================
// AI Fleet Composition Optimizer
// ==========================================
export const createFleetOptimizerSchema = z.object({
  optimizerType: z.enum(["demand_forecast", "fleet_sizing", "type_mix", "regional_allocation", "cost_optimization"]),
  modelVersion: z.string().max(50).optional(),
  analysisDate: z.coerce.date().optional(),
  currentFleetSize: z.number().int().optional(),
  recommendedFleetSize: z.number().int().optional(),
  ownedContainers: z.number().int().optional(),
  leasedContainers: z.number().int().optional(),
  recommendedOwnedPct: z.string().optional(),
  recommendedLeasedPct: z.string().optional(),
  projectedSavings: z.string().optional(),
  utilizationTarget: z.string().optional(),
  confidenceScore: z.string().optional(),
  inputFeatures: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateFleetOptimizerSchema = createFleetOptimizerSchema.partial();
