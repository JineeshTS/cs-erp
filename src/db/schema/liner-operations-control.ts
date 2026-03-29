import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Cargo Cut-Off Management per Port
// ==========================================
export const locCargoCutoffs = pgTable("loc_cargo_cutoffs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  cutoffRef: varchar("cutoff_ref", { length: 100 }).notNull(),
  cutoffType: varchar("cutoff_type", { length: 50 }).notNull(), // documentation_cutoff, cargo_receiving_cutoff, vgm_cutoff, hazmat_cutoff, reefer_cutoff
  portCode: varchar("port_code", { length: 20 }),
  portName: varchar("port_name", { length: 255 }),
  terminalName: varchar("terminal_name", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageNumber: varchar("voyage_number", { length: 50 }),
  serviceName: varchar("service_name", { length: 100 }),
  cutoffDatetime: timestamp("cutoff_datetime", { withTimezone: true }),
  extensionGranted: boolean("extension_granted"),
  extensionUntil: timestamp("extension_until", { withTimezone: true }),
  extensionReason: text("extension_reason"),
  affectedBookings: integer("affected_bookings"),
  notificationSent: boolean("notification_sent"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Overbooking & Rollover Management
// ==========================================
export const locOverbookingRollovers = pgTable("loc_overbooking_rollovers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  rolloverRef: varchar("rollover_ref", { length: 100 }).notNull(),
  rolloverType: varchar("rollover_type", { length: 50 }).notNull(), // overbooking, rollover, short_shipment, shut_out, cargo_bump
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageNumber: varchar("voyage_number", { length: 50 }),
  portCode: varchar("port_code", { length: 20 }),
  portName: varchar("port_name", { length: 255 }),
  bookingRef: varchar("booking_ref", { length: 100 }),
  containerCount: integer("container_count"),
  teuCount: decimal("teu_count", { precision: 10, scale: 2 }),
  originalVessel: varchar("original_vessel", { length: 255 }),
  nextVessel: varchar("next_vessel", { length: 255 }),
  nextVoyage: varchar("next_voyage", { length: 50 }),
  rolloverReason: text("rollover_reason"),
  revenueImpact: decimal("revenue_impact", { precision: 14, scale: 2 }),
  impactCurrency: varchar("impact_currency", { length: 3 }),
  customerNotified: boolean("customer_notified"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Rolling & Upgrade Management
// ==========================================
export const locRollingUpgrades = pgTable("loc_rolling_upgrades", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  upgradeRef: varchar("upgrade_ref", { length: 100 }).notNull(),
  upgradeType: varchar("upgrade_type", { length: 50 }).notNull(), // container_upgrade, service_upgrade, equipment_swap, priority_loading, express_release
  bookingRef: varchar("booking_ref", { length: 100 }),
  customerName: varchar("customer_name", { length: 255 }),
  originalEquipment: varchar("original_equipment", { length: 50 }),
  upgradedEquipment: varchar("upgraded_equipment", { length: 50 }),
  originalService: varchar("original_service", { length: 100 }),
  upgradedService: varchar("upgraded_service", { length: 100 }),
  costDifference: decimal("cost_difference", { precision: 14, scale: 2 }),
  upgradeCurrency: varchar("upgrade_currency", { length: 3 }),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvalDate: timestamp("approval_date", { withTimezone: true }),
  upgradeReason: text("upgrade_reason"),
  revenueRecovered: decimal("revenue_recovered", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Revenue Integrity & Rate Audit
// ==========================================
export const locRevenueIntegrityAudits = pgTable("loc_revenue_integrity_audits", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  auditRef: varchar("audit_ref", { length: 100 }).notNull(),
  auditType: varchar("audit_type", { length: 50 }).notNull(), // rate_compliance, tariff_verification, surcharge_audit, discount_review, leakage_detection
  bookingRef: varchar("booking_ref", { length: 100 }),
  customerName: varchar("customer_name", { length: 255 }),
  contractedRate: decimal("contracted_rate", { precision: 14, scale: 2 }),
  appliedRate: decimal("applied_rate", { precision: 14, scale: 2 }),
  varianceAmount: decimal("variance_amount", { precision: 14, scale: 2 }),
  rateCurrency: varchar("rate_currency", { length: 3 }),
  tradeRoute: varchar("trade_route", { length: 100 }),
  containerType: varchar("container_type", { length: 50 }),
  containerSize: varchar("container_size", { length: 20 }),
  leakageAmount: decimal("leakage_amount", { precision: 14, scale: 2 }),
  correctionApplied: boolean("correction_applied"),
  correctionDate: timestamp("correction_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Slot Swap Coordination with Partners
// ==========================================
export const locSlotSwapCoordinations = pgTable("loc_slot_swap_coordinations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  swapRef: varchar("swap_ref", { length: 100 }).notNull(),
  swapType: varchar("swap_type", { length: 50 }).notNull(), // slot_purchase, slot_sale, slot_exchange, capacity_share, emergency_swap
  partnerName: varchar("partner_name", { length: 255 }),
  partnerCode: varchar("partner_code", { length: 50 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageNumber: varchar("voyage_number", { length: 50 }),
  tradeRoute: varchar("trade_route", { length: 100 }),
  slotsOffered: integer("slots_offered"),
  slotsReceived: integer("slots_received"),
  ratePerSlot: decimal("rate_per_slot", { precision: 14, scale: 2 }),
  totalValue: decimal("total_value", { precision: 14, scale: 2 }),
  swapCurrency: varchar("swap_currency", { length: 3 }),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Schedule Deviation & Recovery Management
// ==========================================
export const locScheduleDeviations = pgTable("loc_schedule_deviations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  deviationRef: varchar("deviation_ref", { length: 100 }).notNull(),
  deviationType: varchar("deviation_type", { length: 50 }).notNull(), // port_omission, schedule_delay, speed_change, bunker_diversion, weather_routing
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageNumber: varchar("voyage_number", { length: 50 }),
  serviceName: varchar("service_name", { length: 100 }),
  originalEta: timestamp("original_eta", { withTimezone: true }),
  revisedEta: timestamp("revised_eta", { withTimezone: true }),
  delayHours: decimal("delay_hours", { precision: 8, scale: 2 }),
  deviationReason: text("deviation_reason"),
  recoveryPlan: text("recovery_plan"),
  costImpact: decimal("cost_impact", { precision: 14, scale: 2 }),
  impactCurrency: varchar("impact_currency", { length: 3 }),
  affectedPorts: integer("affected_ports"),
  recoveryAchieved: boolean("recovery_achieved"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// AI Cargo Mix Optimization
// ==========================================
export const locCargoMixOptimizations = pgTable("loc_cargo_mix_optimizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  optimizationRef: varchar("optimization_ref", { length: 100 }).notNull(),
  optimizationType: varchar("optimization_type", { length: 50 }).notNull(), // weight_revenue_balance, reefer_dry_mix, hazmat_allocation, high_value_priority, deadweight_optimization
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageNumber: varchar("voyage_number", { length: 50 }),
  tradeRoute: varchar("trade_route", { length: 100 }),
  currentRevenue: decimal("current_revenue", { precision: 14, scale: 2 }),
  optimizedRevenue: decimal("optimized_revenue", { precision: 14, scale: 2 }),
  revenueUplift: decimal("revenue_uplift", { precision: 14, scale: 2 }),
  upliftPercentage: decimal("uplift_percentage", { precision: 8, scale: 4 }),
  revenueCurrency: varchar("revenue_currency", { length: 3 }),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  reeferSlots: integer("reefer_slots"),
  hazmatSlots: integer("hazmat_slots"),
  recommendation: text("recommendation"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ==========================================
// Load Factor & Utilization Reporting
// ==========================================
export const locLoadFactorReports = pgTable("loc_load_factor_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  reportRef: varchar("report_ref", { length: 100 }).notNull(),
  reportType: varchar("report_type", { length: 50 }).notNull(), // voyage_utilization, trade_lane_report, vessel_performance, seasonal_analysis, benchmark_comparison
  vesselName: varchar("vessel_name", { length: 255 }),
  voyageNumber: varchar("voyage_number", { length: 50 }),
  tradeRoute: varchar("trade_route", { length: 100 }),
  totalCapacityTeu: decimal("total_capacity_teu", { precision: 10, scale: 2 }),
  loadedTeu: decimal("loaded_teu", { precision: 10, scale: 2 }),
  loadFactorPercentage: decimal("load_factor_percentage", { precision: 8, scale: 4 }),
  weightUtilization: decimal("weight_utilization", { precision: 8, scale: 4 }),
  revenuePerTeu: decimal("revenue_per_teu", { precision: 14, scale: 2 }),
  reportCurrency: varchar("report_currency", { length: 3 }),
  periodFrom: timestamp("period_from", { withTimezone: true }),
  periodTo: timestamp("period_to", { withTimezone: true }),
  emptyRepositioning: integer("empty_repositioning"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
