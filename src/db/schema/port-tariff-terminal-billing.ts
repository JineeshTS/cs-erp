import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Terminal Handling Charge THC Management
// ==========================================
export const pttTerminalHandlingCharges = pgTable("ptt_terminal_handling_charges", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  chargeRef: varchar("charge_ref", { length: 100 }).notNull(),
  chargeType: varchar("charge_type", { length: 50 }).notNull(), // origin_thc, destination_thc, transshipment_thc, reefer_thc, hazardous_thc
  portCode: varchar("port_code", { length: 20 }),
  portName: varchar("port_name", { length: 255 }),
  terminalName: varchar("terminal_name", { length: 255 }),
  terminalCode: varchar("terminal_code", { length: 50 }),
  containerSize: varchar("container_size", { length: 20 }),
  containerType: varchar("container_type", { length: 50 }),
  cargoCategory: varchar("cargo_category", { length: 50 }),
  chargeAmountBase: decimal("charge_amount_base", { precision: 14, scale: 2 }),
  chargeCurrency: varchar("charge_currency", { length: 3 }),
  chargePerUnit: varchar("charge_per_unit", { length: 20 }),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  surchargePercentage: decimal("surcharge_percentage", { precision: 8, scale: 4 }),
  peakSeasonMultiplier: decimal("peak_season_multiplier", { precision: 6, scale: 4 }),
  exemptionApplicable: boolean("exemption_applicable"),
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
// Port Dues & Wharfage Calculation
// ==========================================
export const pttPortDuesWharfages = pgTable("ptt_port_dues_wharfages", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  duesRef: varchar("dues_ref", { length: 100 }).notNull(),
  duesType: varchar("dues_type", { length: 50 }).notNull(), // port_dues, wharfage, anchorage, berth_hire, channel_dues
  portCode: varchar("port_code", { length: 20 }),
  portName: varchar("port_name", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  vesselGrt: decimal("vessel_grt", { precision: 12, scale: 2 }),
  vesselNrt: decimal("vessel_nrt", { precision: 12, scale: 2 }),
  vesselLoa: decimal("vessel_loa", { precision: 10, scale: 2 }),
  ratePerGrt: decimal("rate_per_grt", { precision: 12, scale: 4 }),
  ratePerNrt: decimal("rate_per_nrt", { precision: 12, scale: 4 }),
  calculatedAmount: decimal("calculated_amount", { precision: 14, scale: 2 }),
  duesCurrency: varchar("dues_currency", { length: 3 }),
  berthingHours: integer("berthing_hours"),
  discountPercentage: decimal("discount_percentage", { precision: 8, scale: 4 }),
  effectiveDate: timestamp("effective_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
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
// Pilotage Towage & Mooring Charges
// ==========================================
export const pttPilotageTowageCharges = pgTable("ptt_pilotage_towage_charges", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  chargeRef: varchar("charge_ref", { length: 100 }).notNull(),
  chargeType: varchar("charge_type", { length: 50 }).notNull(), // pilotage_inbound, pilotage_outbound, towage, mooring, unmooring
  portCode: varchar("port_code", { length: 20 }),
  portName: varchar("port_name", { length: 255 }),
  vesselName: varchar("vessel_name", { length: 255 }),
  vesselGrt: decimal("vessel_grt", { precision: 12, scale: 2 }),
  vesselLoa: decimal("vessel_loa", { precision: 10, scale: 2 }),
  numberOfTugs: integer("number_of_tugs"),
  tugHours: decimal("tug_hours", { precision: 8, scale: 2 }),
  pilotageDistance: decimal("pilotage_distance", { precision: 10, scale: 2 }),
  ratePerGrt: decimal("rate_per_grt", { precision: 12, scale: 4 }),
  baseCharge: decimal("base_charge", { precision: 14, scale: 2 }),
  calculatedAmount: decimal("calculated_amount", { precision: 14, scale: 2 }),
  chargeCurrency: varchar("charge_currency", { length: 3 }),
  nightSurcharge: boolean("night_surcharge"),
  weekendSurcharge: boolean("weekend_surcharge"),
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
// Storage & Demurrage Tariff
// ==========================================
export const pttStorageDemurrageTariffs = pgTable("ptt_storage_demurrage_tariffs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  tariffRef: varchar("tariff_ref", { length: 100 }).notNull(),
  tariffType: varchar("tariff_type", { length: 50 }).notNull(), // import_storage, export_storage, demurrage, detention, combined
  portCode: varchar("port_code", { length: 20 }),
  portName: varchar("port_name", { length: 255 }),
  terminalName: varchar("terminal_name", { length: 255 }),
  containerSize: varchar("container_size", { length: 20 }),
  containerType: varchar("container_type", { length: 50 }),
  freeDays: integer("free_days"),
  dailyRateTier1: decimal("daily_rate_tier1", { precision: 12, scale: 2 }),
  tier1DaysFrom: integer("tier1_days_from"),
  tier1DaysTo: integer("tier1_days_to"),
  dailyRateTier2: decimal("daily_rate_tier2", { precision: 12, scale: 2 }),
  tier2DaysFrom: integer("tier2_days_from"),
  tier2DaysTo: integer("tier2_days_to"),
  dailyRateTier3: decimal("daily_rate_tier3", { precision: 12, scale: 2 }),
  tariffCurrency: varchar("tariff_currency", { length: 3 }),
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
// Port Tariff Comparison & Benchmarking
// ==========================================
export const pttTariffComparisons = pgTable("ptt_tariff_comparisons", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  comparisonRef: varchar("comparison_ref", { length: 100 }).notNull(),
  comparisonType: varchar("comparison_type", { length: 50 }).notNull(), // port_vs_port, terminal_vs_terminal, historical_trend, regional_benchmark, global_index
  basePortCode: varchar("base_port_code", { length: 20 }),
  basePortName: varchar("base_port_name", { length: 255 }),
  comparePortCode: varchar("compare_port_code", { length: 20 }),
  comparePortName: varchar("compare_port_name", { length: 255 }),
  chargeCategory: varchar("charge_category", { length: 50 }),
  basePortCost: decimal("base_port_cost", { precision: 14, scale: 2 }),
  comparePortCost: decimal("compare_port_cost", { precision: 14, scale: 2 }),
  differenceAmount: decimal("difference_amount", { precision: 14, scale: 2 }),
  differencePercentage: decimal("difference_percentage", { precision: 8, scale: 4 }),
  benchmarkCurrency: varchar("benchmark_currency", { length: 3 }),
  periodFrom: timestamp("period_from", { withTimezone: true }),
  periodTo: timestamp("period_to", { withTimezone: true }),
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
// Terminal Invoice Validation & Dispute
// ==========================================
export const pttInvoiceValidations = pgTable("ptt_invoice_validations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  validationRef: varchar("validation_ref", { length: 100 }).notNull(),
  validationType: varchar("validation_type", { length: 50 }).notNull(), // auto_validation, manual_review, dispute_raised, dispute_resolved, credit_note
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  terminalName: varchar("terminal_name", { length: 255 }),
  portCode: varchar("port_code", { length: 20 }),
  invoiceDate: timestamp("invoice_date", { withTimezone: true }),
  invoiceAmountClaimed: decimal("invoice_amount_claimed", { precision: 14, scale: 2 }),
  calculatedAmount: decimal("calculated_amount", { precision: 14, scale: 2 }),
  varianceAmount: decimal("variance_amount", { precision: 14, scale: 2 }),
  variancePercentage: decimal("variance_percentage", { precision: 8, scale: 4 }),
  invoiceCurrency: varchar("invoice_currency", { length: 3 }),
  disputeReason: text("dispute_reason"),
  resolutionDate: timestamp("resolution_date", { withTimezone: true }),
  resolvedAmount: decimal("resolved_amount", { precision: 14, scale: 2 }),
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
// AI Port Cost Optimization Recommendations
// ==========================================
export const pttCostOptimizations = pgTable("ptt_cost_optimizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  optimizationRef: varchar("optimization_ref", { length: 100 }).notNull(),
  optimizationType: varchar("optimization_type", { length: 50 }).notNull(), // route_optimization, terminal_switch, timing_optimization, volume_discount, negotiation_leverage
  portCode: varchar("port_code", { length: 20 }),
  portName: varchar("port_name", { length: 255 }),
  currentCost: decimal("current_cost", { precision: 14, scale: 2 }),
  optimizedCost: decimal("optimized_cost", { precision: 14, scale: 2 }),
  projectedSavings: decimal("projected_savings", { precision: 14, scale: 2 }),
  savingsPercentage: decimal("savings_percentage", { precision: 8, scale: 4 }),
  optimizationCurrency: varchar("optimization_currency", { length: 3 }),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  implementationDifficulty: varchar("implementation_difficulty", { length: 20 }),
  timelineWeeks: integer("timeline_weeks"),
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
// Port Budget Planning & Control
// ==========================================
export const pttBudgetPlannings = pgTable("ptt_budget_plannings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  budgetRef: varchar("budget_ref", { length: 100 }).notNull(),
  budgetType: varchar("budget_type", { length: 50 }).notNull(), // annual_budget, quarterly_forecast, monthly_actual, variance_analysis, rolling_forecast
  portCode: varchar("port_code", { length: 20 }),
  portName: varchar("port_name", { length: 255 }),
  fiscalYear: integer("fiscal_year"),
  fiscalPeriod: varchar("fiscal_period", { length: 20 }),
  budgetedAmount: decimal("budgeted_amount", { precision: 14, scale: 2 }),
  actualAmount: decimal("actual_amount", { precision: 14, scale: 2 }),
  varianceAmount: decimal("variance_amount", { precision: 14, scale: 2 }),
  variancePercentage: decimal("variance_percentage", { precision: 8, scale: 4 }),
  budgetCurrency: varchar("budget_currency", { length: 3 }),
  costCategory: varchar("cost_category", { length: 50 }),
  forecastedAmount: decimal("forecasted_amount", { precision: 14, scale: 2 }),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvalDate: timestamp("approval_date", { withTimezone: true }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
