import { z } from "zod/v4";

// ==========================================
// Transshipment Cargo Planning & Coordination
// ==========================================
export const createCargoPlanSchema = z.object({
  planType: z.enum(["inbound_planning", "outbound_planning", "cross_dock", "consolidation", "deconsolidation"]),
  hubPort: z.string().max(100).optional(),
  originPort: z.string().max(100).optional(),
  destinationPort: z.string().max(100).optional(),
  motherVessel: z.string().max(255).optional(),
  feederVessel: z.string().max(255).optional(),
  containerCount: z.number().int().optional(),
  teuVolume: z.string().optional(),
  plannedTransferDate: z.coerce.date().optional(),
  dwellTimeDays: z.string().optional(),
  priority: z.string().max(20).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCargoPlanSchema = createCargoPlanSchema.partial();

// ==========================================
// Feeder Vessel & Connecting Service Coordination
// ==========================================
export const createFeederCoordinationSchema = z.object({
  coordinationType: z.enum(["feeder_arrival", "feeder_departure", "relay_connection", "barge_transfer", "intermodal_link"]),
  feederVessel: z.string().max(255).optional(),
  feederService: z.string().max(100).optional(),
  motherVessel: z.string().max(255).optional(),
  hubPort: z.string().max(100).optional(),
  etaFeeder: z.coerce.date().optional(),
  etdFeeder: z.coerce.date().optional(),
  connectionWindowHours: z.string().optional(),
  cargoUnits: z.number().int().optional(),
  bufferHours: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateFeederCoordinationSchema = createFeederCoordinationSchema.partial();

// ==========================================
// T/S Cargo Tracking Through Hub
// ==========================================
export const createCargoTrackingSchema = z.object({
  trackingType: z.enum(["discharge_tracking", "yard_movement", "load_tracking", "gate_passage", "milestone_update"]),
  containerNumber: z.string().max(20).optional(),
  bookingRef: z.string().max(100).optional(),
  hubPort: z.string().max(100).optional(),
  currentLocation: z.string().max(255).optional(),
  inboundVessel: z.string().max(255).optional(),
  outboundVessel: z.string().max(255).optional(),
  dischargeTime: z.coerce.date().optional(),
  loadTime: z.coerce.date().optional(),
  yardPosition: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateCargoTrackingSchema = createCargoTrackingSchema.partial();

// ==========================================
// Missed Connection & Recovery Management
// ==========================================
export const createMissedConnectionSchema = z.object({
  connectionType: z.enum(["vessel_delay", "port_congestion", "equipment_failure", "weather_disruption", "operational_error"]),
  containerNumber: z.string().max(20).optional(),
  hubPort: z.string().max(100).optional(),
  originalVessel: z.string().max(255).optional(),
  recoveryVessel: z.string().max(255).optional(),
  missedDate: z.coerce.date().optional(),
  recoveryDate: z.coerce.date().optional(),
  delayDays: z.string().optional(),
  additionalCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  recovered: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateMissedConnectionSchema = createMissedConnectionSchema.partial();

// ==========================================
// T/S Revenue Attribution & Profitability
// ==========================================
export const createRevenueAttributionSchema = z.object({
  attributionType: z.enum(["leg_allocation", "hub_cost_sharing", "feeder_revenue", "mother_revenue", "margin_analysis"]),
  bookingRef: z.string().max(100).optional(),
  hubPort: z.string().max(100).optional(),
  legFrom: z.string().max(100).optional(),
  legTo: z.string().max(100).optional(),
  freightRevenue: z.string().optional(),
  handlingCost: z.string().optional(),
  hubCost: z.string().optional(),
  netMargin: z.string().optional(),
  currency: z.string().max(3).optional(),
  marginPct: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateRevenueAttributionSchema = createRevenueAttributionSchema.partial();

// ==========================================
// Hub Efficiency & Productivity Analytics
// ==========================================
export const createHubEfficiencySchema = z.object({
  efficiencyType: z.enum(["throughput_analysis", "dwell_time_report", "crane_productivity", "berth_utilization", "yard_capacity"]),
  hubPort: z.string().max(100).optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  throughputTeu: z.string().optional(),
  avgDwellHours: z.string().optional(),
  craneMovesPerHour: z.string().optional(),
  berthUtilizationPct: z.string().optional(),
  yardOccupancyPct: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateHubEfficiencySchema = createHubEfficiencySchema.partial();

// ==========================================
// AI Transshipment Optimization Engine
// ==========================================
export const createOptimizationEngineSchema = z.object({
  engineType: z.enum(["connection_optimizer", "yard_allocation", "vessel_pairing", "load_sequencing", "dwell_minimizer"]),
  hubPort: z.string().max(100).optional(),
  scenarioName: z.string().max(255).optional(),
  currentCost: z.string().optional(),
  optimizedCost: z.string().optional(),
  savingsAmount: z.string().optional(),
  savingsPct: z.string().optional(),
  currency: z.string().max(3).optional(),
  modelVersion: z.string().max(50).optional(),
  confidenceScore: z.string().optional(),
  accepted: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateOptimizationEngineSchema = createOptimizationEngineSchema.partial();

// ==========================================
// Long Transshipment Penalty Tracking
// ==========================================
export const createPenaltyTrackingSchema = z.object({
  penaltyType: z.enum(["dwell_penalty", "late_delivery", "missed_cutoff", "storage_charge", "demurrage_charge"]),
  containerNumber: z.string().max(20).optional(),
  bookingRef: z.string().max(100).optional(),
  hubPort: z.string().max(100).optional(),
  dwellDays: z.string().optional(),
  thresholdDays: z.string().optional(),
  penaltyAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  chargedTo: z.string().max(255).optional(),
  waived: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePenaltyTrackingSchema = createPenaltyTrackingSchema.partial();
