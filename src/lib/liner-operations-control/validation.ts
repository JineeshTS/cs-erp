import { z } from "zod/v4";
import { metadataSchema } from "@/lib/validation";

// ==========================================
// Cargo Cut-Off Management per Port
// ==========================================
export const createCargoCutoffSchema = z.object({
  cutoffType: z.enum(["documentation_cutoff", "cargo_receiving_cutoff", "vgm_cutoff", "hazmat_cutoff", "reefer_cutoff"]),
  portCode: z.string().max(20).optional(),
  portName: z.string().max(255).optional(),
  terminalName: z.string().max(255).optional(),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  serviceName: z.string().max(100).optional(),
  cutoffDatetime: z.coerce.date().optional(),
  extensionGranted: z.boolean().optional(),
  extensionUntil: z.coerce.date().optional(),
  extensionReason: z.string().optional(),
  affectedBookings: z.number().int().optional(),
  notificationSent: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCargoCutoffSchema = createCargoCutoffSchema.partial();

// ==========================================
// Overbooking & Rollover Management
// ==========================================
export const createOverbookingRolloverSchema = z.object({
  rolloverType: z.enum(["overbooking", "rollover", "short_shipment", "shut_out", "cargo_bump"]),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  portCode: z.string().max(20).optional(),
  portName: z.string().max(255).optional(),
  bookingRef: z.string().max(100).optional(),
  containerCount: z.number().int().optional(),
  teuCount: z.string().optional(),
  originalVessel: z.string().max(255).optional(),
  nextVessel: z.string().max(255).optional(),
  nextVoyage: z.string().max(50).optional(),
  rolloverReason: z.string().optional(),
  revenueImpact: z.string().optional(),
  impactCurrency: z.string().max(3).optional(),
  customerNotified: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateOverbookingRolloverSchema = createOverbookingRolloverSchema.partial();

// ==========================================
// Rolling & Upgrade Management
// ==========================================
export const createRollingUpgradeSchema = z.object({
  upgradeType: z.enum(["container_upgrade", "service_upgrade", "equipment_swap", "priority_loading", "express_release"]),
  bookingRef: z.string().max(100).optional(),
  customerName: z.string().max(255).optional(),
  originalEquipment: z.string().max(50).optional(),
  upgradedEquipment: z.string().max(50).optional(),
  originalService: z.string().max(100).optional(),
  upgradedService: z.string().max(100).optional(),
  costDifference: z.string().optional(),
  upgradeCurrency: z.string().max(3).optional(),
  approvedBy: z.string().max(255).optional(),
  approvalDate: z.coerce.date().optional(),
  upgradeReason: z.string().optional(),
  revenueRecovered: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateRollingUpgradeSchema = createRollingUpgradeSchema.partial();

// ==========================================
// Revenue Integrity & Rate Audit
// ==========================================
export const createRevenueIntegrityAuditSchema = z.object({
  auditType: z.enum(["rate_compliance", "tariff_verification", "surcharge_audit", "discount_review", "leakage_detection"]),
  bookingRef: z.string().max(100).optional(),
  customerName: z.string().max(255).optional(),
  contractedRate: z.string().optional(),
  appliedRate: z.string().optional(),
  varianceAmount: z.string().optional(),
  rateCurrency: z.string().max(3).optional(),
  tradeRoute: z.string().max(100).optional(),
  containerType: z.string().max(50).optional(),
  containerSize: z.string().max(20).optional(),
  leakageAmount: z.string().optional(),
  correctionApplied: z.boolean().optional(),
  correctionDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateRevenueIntegrityAuditSchema = createRevenueIntegrityAuditSchema.partial();

// ==========================================
// Slot Swap Coordination with Partners
// ==========================================
export const createSlotSwapCoordinationSchema = z.object({
  swapType: z.enum(["slot_purchase", "slot_sale", "slot_exchange", "capacity_share", "emergency_swap"]),
  partnerName: z.string().max(255).optional(),
  partnerCode: z.string().max(50).optional(),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  tradeRoute: z.string().max(100).optional(),
  slotsOffered: z.number().int().optional(),
  slotsReceived: z.number().int().optional(),
  ratePerSlot: z.string().optional(),
  totalValue: z.string().optional(),
  swapCurrency: z.string().max(3).optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateSlotSwapCoordinationSchema = createSlotSwapCoordinationSchema.partial();

// ==========================================
// Schedule Deviation & Recovery Management
// ==========================================
export const createScheduleDeviationSchema = z.object({
  deviationType: z.enum(["port_omission", "schedule_delay", "speed_change", "bunker_diversion", "weather_routing"]),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  serviceName: z.string().max(100).optional(),
  originalEta: z.coerce.date().optional(),
  revisedEta: z.coerce.date().optional(),
  delayHours: z.string().optional(),
  deviationReason: z.string().optional(),
  recoveryPlan: z.string().optional(),
  costImpact: z.string().optional(),
  impactCurrency: z.string().max(3).optional(),
  affectedPorts: z.number().int().optional(),
  recoveryAchieved: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateScheduleDeviationSchema = createScheduleDeviationSchema.partial();

// ==========================================
// AI Cargo Mix Optimization
// ==========================================
export const createCargoMixOptimizationSchema = z.object({
  optimizationType: z.enum(["weight_revenue_balance", "reefer_dry_mix", "hazmat_allocation", "high_value_priority", "deadweight_optimization"]),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  tradeRoute: z.string().max(100).optional(),
  currentRevenue: z.string().optional(),
  optimizedRevenue: z.string().optional(),
  revenueUplift: z.string().optional(),
  upliftPercentage: z.string().optional(),
  revenueCurrency: z.string().max(3).optional(),
  confidenceScore: z.string().optional(),
  reeferSlots: z.number().int().optional(),
  hazmatSlots: z.number().int().optional(),
  recommendation: z.string().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateCargoMixOptimizationSchema = createCargoMixOptimizationSchema.partial();

// ==========================================
// Load Factor & Utilization Reporting
// ==========================================
export const createLoadFactorReportSchema = z.object({
  reportType: z.enum(["voyage_utilization", "trade_lane_report", "vessel_performance", "seasonal_analysis", "benchmark_comparison"]),
  vesselName: z.string().max(255).optional(),
  voyageNumber: z.string().max(50).optional(),
  tradeRoute: z.string().max(100).optional(),
  totalCapacityTeu: z.string().optional(),
  loadedTeu: z.string().optional(),
  loadFactorPercentage: z.string().optional(),
  weightUtilization: z.string().optional(),
  revenuePerTeu: z.string().optional(),
  reportCurrency: z.string().max(3).optional(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  emptyRepositioning: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: metadataSchema,
});
export const updateLoadFactorReportSchema = createLoadFactorReportSchema.partial();
