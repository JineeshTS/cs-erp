import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Lease Agreement Lifecycle Management
// ==========================================
export const clmLeaseAgreements = pgTable("clm_lease_agreements", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  agreementRef: varchar("agreement_ref", { length: 100 }).notNull(),
  agreementType: varchar("agreement_type", { length: 50 }).notNull(), // master_lease, spot_lease, long_term, short_term, sale_leaseback
  lessorName: varchar("lessor_name", { length: 255 }),
  lessorCode: varchar("lessor_code", { length: 50 }),
  containerType: varchar("container_type", { length: 50 }),
  containerSize: varchar("container_size", { length: 20 }),
  quantity: integer("quantity"),
  dailyRate: decimal("daily_rate", { precision: 12, scale: 4 }),
  rateCurrency: varchar("rate_currency", { length: 3 }),
  minimumLeaseDays: integer("minimum_lease_days"),
  commencementDate: timestamp("commencement_date", { withTimezone: true }),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  pickupLocation: varchar("pickup_location", { length: 255 }),
  dropoffLocation: varchar("dropoff_location", { length: 255 }),
  depositAmount: decimal("deposit_amount", { precision: 14, scale: 2 }),
  insuranceRequired: boolean("insurance_required"),
  autoRenewal: boolean("auto_renewal"),
  terminationNoticeDays: integer("termination_notice_days"),
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
// On-Hire Off-Hire Event Tracking
// ==========================================
export const clmOnhireOffhires = pgTable("clm_onhire_offhires", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  eventRef: varchar("event_ref", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(), // on_hire, off_hire, interchange, redelivery, pickup
  agreementId: varchar("agreement_id", { length: 100 }),
  containerNumber: varchar("container_number", { length: 20 }),
  containerType: varchar("container_type", { length: 50 }),
  containerSize: varchar("container_size", { length: 20 }),
  eventDate: timestamp("event_date", { withTimezone: true }),
  eventLocation: varchar("event_location", { length: 255 }),
  depotName: varchar("depot_name", { length: 255 }),
  conditionGrade: varchar("condition_grade", { length: 10 }),
  surveyRequired: boolean("survey_required"),
  surveyDate: timestamp("survey_date", { withTimezone: true }),
  dailyRate: decimal("daily_rate", { precision: 12, scale: 4 }),
  daysOnHire: integer("days_on_hire"),
  totalCost: decimal("total_cost", { precision: 14, scale: 2 }),
  interchangeRef: varchar("interchange_ref", { length: 100 }),
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
// MNR Damage Billing to Lessor
// ==========================================
export const clmMnrDamageBillings = pgTable("clm_mnr_damage_billings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  billingRef: varchar("billing_ref", { length: 100 }).notNull(),
  billingType: varchar("billing_type", { length: 50 }).notNull(), // mnr_estimate, mnr_invoice, damage_claim, repair_authorization, credit_note
  containerNumber: varchar("container_number", { length: 20 }),
  agreementId: varchar("agreement_id", { length: 100 }),
  lessorName: varchar("lessor_name", { length: 255 }),
  damageDescription: text("damage_description"),
  damageLocation: varchar("damage_location", { length: 100 }),
  repairType: varchar("repair_type", { length: 50 }),
  materialCost: decimal("material_cost", { precision: 14, scale: 2 }),
  laborCost: decimal("labor_cost", { precision: 14, scale: 2 }),
  totalRepairCost: decimal("total_repair_cost", { precision: 14, scale: 2 }),
  billingCurrency: varchar("billing_currency", { length: 3 }),
  responsibleParty: varchar("responsible_party", { length: 100 }),
  disputeRaised: boolean("dispute_raised"),
  approvedAmount: decimal("approved_amount", { precision: 14, scale: 2 }),
  invoiceDate: timestamp("invoice_date", { withTimezone: true }),
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
// Lease Cost Allocation per Trade
// ==========================================
export const clmLeaseCostAllocations = pgTable("clm_lease_cost_allocations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  allocationRef: varchar("allocation_ref", { length: 100 }).notNull(),
  allocationType: varchar("allocation_type", { length: 50 }).notNull(), // trade_route, voyage, service_loop, cost_center, project
  agreementId: varchar("agreement_id", { length: 100 }),
  tradeLane: varchar("trade_lane", { length: 100 }),
  voyageRef: varchar("voyage_ref", { length: 100 }),
  allocationPeriod: varchar("allocation_period", { length: 50 }),
  containerCount: integer("container_count"),
  totalLeaseDays: integer("total_lease_days"),
  dailyRate: decimal("daily_rate", { precision: 12, scale: 4 }),
  totalCostAllocated: decimal("total_cost_allocated", { precision: 14, scale: 2 }),
  allocationCurrency: varchar("allocation_currency", { length: 3 }),
  costPerTeu: decimal("cost_per_teu", { precision: 12, scale: 4 }),
  revenueGenerated: decimal("revenue_generated", { precision: 14, scale: 2 }),
  profitMargin: decimal("profit_margin", { precision: 8, scale: 4 }),
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
// Lessor Statement Reconciliation
// ==========================================
export const clmLessorReconciliations = pgTable("clm_lessor_reconciliations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  reconciliationRef: varchar("reconciliation_ref", { length: 100 }).notNull(),
  reconciliationType: varchar("reconciliation_type", { length: 50 }).notNull(), // monthly_statement, quarterly_review, annual_audit, dispute_resolution, final_settlement
  lessorName: varchar("lessor_name", { length: 255 }),
  agreementId: varchar("agreement_id", { length: 100 }),
  statementPeriod: varchar("statement_period", { length: 50 }),
  lessorAmount: decimal("lessor_amount", { precision: 14, scale: 2 }),
  internalAmount: decimal("internal_amount", { precision: 14, scale: 2 }),
  differenceAmount: decimal("difference_amount", { precision: 14, scale: 2 }),
  reconciliationCurrency: varchar("reconciliation_currency", { length: 3 }),
  itemsMatched: integer("items_matched"),
  itemsUnmatched: integer("items_unmatched"),
  disputeCount: integer("dispute_count"),
  adjustmentAmount: decimal("adjustment_amount", { precision: 14, scale: 2 }),
  reconciliationDate: timestamp("reconciliation_date", { withTimezone: true }),
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
// Container Return & Redelivery Management
// ==========================================
export const clmContainerRedeliveries = pgTable("clm_container_redeliveries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  redeliveryRef: varchar("redelivery_ref", { length: 100 }).notNull(),
  redeliveryType: varchar("redelivery_type", { length: 50 }).notNull(), // scheduled_return, early_return, late_return, drop_off, swap
  agreementId: varchar("agreement_id", { length: 100 }),
  containerNumber: varchar("container_number", { length: 20 }),
  containerType: varchar("container_type", { length: 50 }),
  redeliveryLocation: varchar("redelivery_location", { length: 255 }),
  depotName: varchar("depot_name", { length: 255 }),
  scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
  actualDate: timestamp("actual_date", { withTimezone: true }),
  conditionOnReturn: varchar("condition_on_return", { length: 50 }),
  cleaningRequired: boolean("cleaning_required"),
  repairRequired: boolean("repair_required"),
  penaltyApplicable: boolean("penalty_applicable"),
  penaltyAmount: decimal("penalty_amount", { precision: 14, scale: 2 }),
  dropoffCharges: decimal("dropoff_charges", { precision: 14, scale: 2 }),
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
// Lease vs Buy Financial Analysis
// ==========================================
export const clmLeaseVsBuyAnalyses = pgTable("clm_lease_vs_buy_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  analysisRef: varchar("analysis_ref", { length: 100 }).notNull(),
  analysisType: varchar("analysis_type", { length: 50 }).notNull(), // npv_comparison, break_even, sensitivity, scenario, portfolio
  containerType: varchar("container_type", { length: 50 }),
  containerSize: varchar("container_size", { length: 20 }),
  quantity: integer("quantity"),
  purchasePrice: decimal("purchase_price", { precision: 14, scale: 2 }),
  leaseRate: decimal("lease_rate", { precision: 12, scale: 4 }),
  leaseTerm: integer("lease_term"),
  discountRate: decimal("discount_rate", { precision: 8, scale: 4 }),
  npvLease: decimal("npv_lease", { precision: 14, scale: 2 }),
  npvBuy: decimal("npv_buy", { precision: 14, scale: 2 }),
  breakEvenMonths: integer("break_even_months"),
  recommendation: varchar("recommendation", { length: 50 }),
  savingsAmount: decimal("savings_amount", { precision: 14, scale: 2 }),
  analysisCurrency: varchar("analysis_currency", { length: 3 }),
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
// AI Fleet Composition Optimizer
// ==========================================
export const clmFleetOptimizers = pgTable("clm_fleet_optimizers", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  optimizerRef: varchar("optimizer_ref", { length: 100 }).notNull(),
  optimizerType: varchar("optimizer_type", { length: 50 }).notNull(), // demand_forecast, fleet_sizing, type_mix, regional_allocation, cost_optimization
  modelVersion: varchar("model_version", { length: 50 }),
  analysisDate: timestamp("analysis_date", { withTimezone: true }),
  currentFleetSize: integer("current_fleet_size"),
  recommendedFleetSize: integer("recommended_fleet_size"),
  ownedContainers: integer("owned_containers"),
  leasedContainers: integer("leased_containers"),
  recommendedOwnedPct: decimal("recommended_owned_pct", { precision: 5, scale: 2 }),
  recommendedLeasedPct: decimal("recommended_leased_pct", { precision: 5, scale: 2 }),
  projectedSavings: decimal("projected_savings", { precision: 14, scale: 2 }),
  utilizationTarget: decimal("utilization_target", { precision: 5, scale: 2 }),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 4 }),
  inputFeatures: jsonb("input_features"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
