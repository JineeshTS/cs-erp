import { z } from "zod/v4";

// ==========================================
// Voyage Close Procedure & Sign-Off
// ==========================================
export const createVoyageCloseSchema = z.object({
  closeType: z.enum(["preliminary", "final", "interim", "reopened", "cancelled"]),
  title: z.string().max(255).optional(),
  voyageNumber: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  voyageStartDate: z.coerce.date().optional(),
  voyageEndDate: z.coerce.date().optional(),
  signOffBy: z.string().max(255).optional(),
  signOffDate: z.coerce.date().optional(),
  totalRevenue: z.string().optional(),
  totalCost: z.string().optional(),
  netResult: z.string().optional(),
  isSignedOff: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateVoyageCloseSchema = createVoyageCloseSchema.partial();

// ==========================================
// Time Charter TA Settlement
// ==========================================
export const createTcSettlementSchema = z.object({
  settlementType: z.enum(["hire_payment", "ballast_bonus", "redelivery", "bunker_adjustment", "off_hire_deduction"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  charterParty: z.string().max(100).optional(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  hireRate: z.string().optional(),
  totalHireDays: z.string().optional(),
  offHireDays: z.string().optional(),
  grossHire: z.string().optional(),
  deductions: z.string().optional(),
  netPayable: z.string().optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateTcSettlementSchema = createTcSettlementSchema.partial();

// ==========================================
// Voyage P&L Finalization & Approval
// ==========================================
export const createVoyagePnlSchema = z.object({
  pnlType: z.enum(["preliminary", "final", "restated", "audited", "management"]),
  title: z.string().max(255).optional(),
  voyageNumber: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  freightRevenue: z.string().optional(),
  demurrageRevenue: z.string().optional(),
  otherRevenue: z.string().optional(),
  portCosts: z.string().optional(),
  bunkerCosts: z.string().optional(),
  canalCosts: z.string().optional(),
  otherCosts: z.string().optional(),
  totalRevenue: z.string().optional(),
  totalCosts: z.string().optional(),
  netPnl: z.string().optional(),
  marginPct: z.string().optional(),
  approvedBy: z.string().max(255).optional(),
  approvedDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateVoyagePnlSchema = createVoyagePnlSchema.partial();

// ==========================================
// Hire Statement Reconciliation & Dispute
// ==========================================
export const createHireReconciliationSchema = z.object({
  reconciliationType: z.enum(["owner_statement", "charterer_statement", "dispute_resolution", "final_settlement", "interim_reconciliation"]),
  title: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  charterParty: z.string().max(100).optional(),
  ownerAmount: z.string().optional(),
  chartererAmount: z.string().optional(),
  differenceAmount: z.string().optional(),
  resolvedAmount: z.string().optional(),
  disputeItems: z.number().int().optional(),
  resolvedItems: z.number().int().optional(),
  isReconciled: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateHireReconciliationSchema = createHireReconciliationSchema.partial();

// ==========================================
// Voyage Result Workflow & Audit
// ==========================================
export const createResultWorkflowSchema = z.object({
  workflowType: z.enum(["approval_chain", "audit_review", "variance_review", "exception_handling", "escalation"]),
  title: z.string().max(255).optional(),
  voyageNumber: z.string().max(100).optional(),
  currentStep: z.string().max(100).optional(),
  totalSteps: z.number().int().optional(),
  completedSteps: z.number().int().optional(),
  assignedTo: z.string().max(255).optional(),
  dueDate: z.coerce.date().optional(),
  completedDate: z.coerce.date().optional(),
  varianceAmount: z.string().optional(),
  variancePct: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateResultWorkflowSchema = createResultWorkflowSchema.partial();

// ==========================================
// Intercompany Voyage Cost Settlement
// ==========================================
export const createIntercoSettlementSchema = z.object({
  intercoType: z.enum(["cost_sharing", "revenue_sharing", "management_fee", "bunker_allocation", "overhead_allocation"]),
  title: z.string().max(255).optional(),
  voyageNumber: z.string().max(100).optional(),
  fromEntity: z.string().max(255).optional(),
  toEntity: z.string().max(255).optional(),
  settlementAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  allocationBasis: z.string().max(100).optional(),
  allocationPct: z.string().optional(),
  invoiceRef: z.string().max(100).optional(),
  settledDate: z.coerce.date().optional(),
  isSettled: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateIntercoSettlementSchema = createIntercoSettlementSchema.partial();

// ==========================================
// AI Voyage Profitability Benchmarking
// ==========================================
export const createProfitBenchmarkSchema = z.object({
  benchmarkType: z.enum(["vessel_comparison", "route_comparison", "period_comparison", "peer_comparison", "ai_recommendation"]),
  title: z.string().max(255).optional(),
  voyageNumber: z.string().max(100).optional(),
  vesselName: z.string().max(255).optional(),
  tradeLane: z.string().max(255).optional(),
  actualTce: z.string().optional(),
  benchmarkTce: z.string().optional(),
  varianceTce: z.string().optional(),
  actualMargin: z.string().optional(),
  benchmarkMargin: z.string().optional(),
  performanceScore: z.string().optional(),
  aiInsights: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateProfitBenchmarkSchema = createProfitBenchmarkSchema.partial();

// ==========================================
// Historical Voyage Analytics Dashboard
// ==========================================
export const createVoyageAnalyticsSchema = z.object({
  analyticsType: z.enum(["trend_analysis", "seasonal_analysis", "kpi_dashboard", "fleet_summary", "route_analysis"]),
  title: z.string().max(255).optional(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  totalVoyages: z.number().int().optional(),
  avgTce: z.string().optional(),
  avgMargin: z.string().optional(),
  totalRevenue: z.string().optional(),
  totalCosts: z.string().optional(),
  topPerformer: z.string().max(255).optional(),
  reportUrl: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateVoyageAnalyticsSchema = createVoyageAnalyticsSchema.partial();
