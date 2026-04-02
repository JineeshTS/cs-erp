import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Asset Registry — Containers, Vessels, Equipment
// ==========================================
export const famAssetRegistries = pgTable(
  "fam_asset_registries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    assetRef: varchar("asset_ref", { length: 50 }).notNull(),
    assetType: varchar("asset_type", { length: 30 }).notNull(), // vessel, container, equipment, vehicle, building, land, furniture, it_equipment
    assetName: varchar("asset_name", { length: 255 }).notNull(),
    description: text("description"),
    serialNumber: varchar("serial_number", { length: 100 }),
    barcode: varchar("barcode", { length: 100 }),
    category: varchar("category", { length: 255 }),
    subCategory: varchar("sub_category", { length: 255 }),
    location: varchar("location", { length: 255 }),
    department: varchar("department", { length: 255 }),
    custodian: varchar("custodian", { length: 255 }),
    acquisitionDate: timestamp("acquisition_date", { withTimezone: true }),
    acquisitionCost: decimal("acquisition_cost", { precision: 14, scale: 2 }),
    residualValue: decimal("residual_value", { precision: 14, scale: 2 }),
    usefulLifeMonths: integer("useful_life_months"),
    currentBookValue: decimal("current_book_value", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    depreciationMethod: varchar("depreciation_method", { length: 30 }), // straight_line, declining_balance, units_of_production, sum_of_years
    warrantyExpiry: timestamp("warranty_expiry", { withTimezone: true }),
    condition: varchar("condition", { length: 30 }), // new, good, fair, poor, decommissioned
    tags: jsonb("tags"), // ["marine", "leased", ...]
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("fam_registry_tenant_idx").on(t.tenantId),
    index("fam_registry_ref_idx").on(t.assetRef),
    index("fam_registry_status_idx").on(t.status),
    index("fam_registry_type_idx").on(t.assetType),
    index("fam_registry_category_idx").on(t.category),
  ]
);

// ==========================================
// Depreciation Schedule Management
// ==========================================
export const famDepreciationSchedules = pgTable(
  "fam_depreciation_schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    scheduleRef: varchar("schedule_ref", { length: 50 }).notNull(),
    scheduleType: varchar("schedule_type", { length: 30 }).notNull(), // straight_line, declining_balance, units_of_production, sum_of_years, custom
    assetRef: varchar("asset_ref", { length: 50 }),
    assetName: varchar("asset_name", { length: 255 }),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    originalCost: decimal("original_cost", { precision: 14, scale: 2 }),
    residualValue: decimal("residual_value", { precision: 14, scale: 2 }),
    depreciableAmount: decimal("depreciable_amount", { precision: 14, scale: 2 }),
    usefulLifeMonths: integer("useful_life_months"),
    monthlyDepreciation: decimal("monthly_depreciation", { precision: 14, scale: 2 }),
    annualDepreciation: decimal("annual_depreciation", { precision: 14, scale: 2 }),
    accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 14, scale: 2 }),
    currentBookValue: decimal("current_book_value", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    depreciationRate: decimal("depreciation_rate", { precision: 6, scale: 4 }),
    lastCalculatedDate: timestamp("last_calculated_date", { withTimezone: true }),
    entries: jsonb("entries"), // [{ period, amount, accumulatedAmount, bookValue }]
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("fam_depreciation_tenant_idx").on(t.tenantId),
    index("fam_depreciation_ref_idx").on(t.scheduleRef),
    index("fam_depreciation_status_idx").on(t.status),
    index("fam_depreciation_asset_idx").on(t.assetRef),
  ]
);

// ==========================================
// Asset Disposal & Write-Off
// ==========================================
export const famAssetDisposals = pgTable(
  "fam_asset_disposals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    disposalRef: varchar("disposal_ref", { length: 50 }).notNull(),
    disposalType: varchar("disposal_type", { length: 30 }).notNull(), // sale, scrap, donation, trade_in, write_off, theft_loss
    assetRef: varchar("asset_ref", { length: 50 }),
    assetName: varchar("asset_name", { length: 255 }),
    disposalDate: timestamp("disposal_date", { withTimezone: true }),
    bookValueAtDisposal: decimal("book_value_at_disposal", { precision: 14, scale: 2 }),
    saleProceeds: decimal("sale_proceeds", { precision: 14, scale: 2 }),
    gainLoss: decimal("gain_loss", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    buyerName: varchar("buyer_name", { length: 255 }),
    buyerContact: varchar("buyer_contact", { length: 255 }),
    disposalReason: text("disposal_reason"),
    approvedBy: varchar("approved_by", { length: 255 }),
    approvalDate: timestamp("approval_date", { withTimezone: true }),
    certificateRef: varchar("certificate_ref", { length: 100 }),
    environmentalCompliance: boolean("environmental_compliance").default(false),
    journalEntryRef: varchar("journal_entry_ref", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("fam_disposal_tenant_idx").on(t.tenantId),
    index("fam_disposal_ref_idx").on(t.disposalRef),
    index("fam_disposal_status_idx").on(t.status),
    index("fam_disposal_asset_idx").on(t.assetRef),
  ]
);

// ==========================================
// Asset Insurance & Valuation Tracking
// ==========================================
export const famInsuranceValuations = pgTable(
  "fam_insurance_valuations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    recordRef: varchar("record_ref", { length: 50 }).notNull(),
    recordType: varchar("record_type", { length: 30 }).notNull(), // insurance_policy, revaluation, appraisal, market_value, replacement_cost
    assetRef: varchar("asset_ref", { length: 50 }),
    assetName: varchar("asset_name", { length: 255 }),
    insurer: varchar("insurer", { length: 255 }),
    policyNumber: varchar("policy_number", { length: 100 }),
    coverageType: varchar("coverage_type", { length: 100 }),
    coverageAmount: decimal("coverage_amount", { precision: 14, scale: 2 }),
    premiumAmount: decimal("premium_amount", { precision: 14, scale: 2 }),
    deductible: decimal("deductible", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    policyStartDate: timestamp("policy_start_date", { withTimezone: true }),
    policyEndDate: timestamp("policy_end_date", { withTimezone: true }),
    valuationDate: timestamp("valuation_date", { withTimezone: true }),
    valuationAmount: decimal("valuation_amount", { precision: 14, scale: 2 }),
    valuedBy: varchar("valued_by", { length: 255 }),
    valuationMethod: varchar("valuation_method", { length: 100 }),
    nextReviewDate: timestamp("next_review_date", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("fam_insurance_tenant_idx").on(t.tenantId),
    index("fam_insurance_ref_idx").on(t.recordRef),
    index("fam_insurance_status_idx").on(t.status),
    index("fam_insurance_asset_idx").on(t.assetRef),
  ]
);

// ==========================================
// Asset Maintenance Schedule Integration
// ==========================================
export const famMaintenanceSchedules = pgTable(
  "fam_maintenance_schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    maintenanceRef: varchar("maintenance_ref", { length: 50 }).notNull(),
    maintenanceType: varchar("maintenance_type", { length: 30 }).notNull(), // preventive, corrective, predictive, condition_based, overhaul
    assetRef: varchar("asset_ref", { length: 50 }),
    assetName: varchar("asset_name", { length: 255 }),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
    completedDate: timestamp("completed_date", { withTimezone: true }),
    frequency: varchar("frequency", { length: 30 }), // daily, weekly, monthly, quarterly, annually, ad_hoc
    assignedTo: varchar("assigned_to", { length: 255 }),
    vendor: varchar("vendor", { length: 255 }),
    estimatedCost: decimal("estimated_cost", { precision: 14, scale: 2 }),
    actualCost: decimal("actual_cost", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    workDescription: text("work_description"),
    partsUsed: jsonb("parts_used"), // [{ partName, quantity, cost }]
    downtime: decimal("downtime", { precision: 8, scale: 2 }), // hours
    nextScheduledDate: timestamp("next_scheduled_date", { withTimezone: true }),
    priority: varchar("priority", { length: 20 }), // low, medium, high, critical
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("fam_maintenance_tenant_idx").on(t.tenantId),
    index("fam_maintenance_ref_idx").on(t.maintenanceRef),
    index("fam_maintenance_status_idx").on(t.status),
    index("fam_maintenance_asset_idx").on(t.assetRef),
  ]
);

// ==========================================
// CAPEX vs OPEX Classification
// ==========================================
export const famCapexOpexClassifications = pgTable(
  "fam_capex_opex_classifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    classificationRef: varchar("classification_ref", { length: 50 }).notNull(),
    classificationType: varchar("classification_type", { length: 30 }).notNull(), // capex, opex, mixed, reclassification
    title: varchar("title", { length: 255 }).notNull(),
    expenditureDate: timestamp("expenditure_date", { withTimezone: true }),
    amount: decimal("amount", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    assetRef: varchar("asset_ref", { length: 50 }),
    assetName: varchar("asset_name", { length: 255 }),
    costCenter: varchar("cost_center", { length: 100 }),
    glAccountCode: varchar("gl_account_code", { length: 50 }),
    justification: text("justification"),
    capitalizationThreshold: decimal("capitalization_threshold", { precision: 14, scale: 2 }),
    usefulLifeExtension: integer("useful_life_extension"), // months
    improvementValue: decimal("improvement_value", { precision: 14, scale: 2 }),
    classifiedBy: varchar("classified_by", { length: 255 }),
    approvedBy: varchar("approved_by", { length: 255 }),
    approvalDate: timestamp("approval_date", { withTimezone: true }),
    journalEntryRef: varchar("journal_entry_ref", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("fam_capex_opex_tenant_idx").on(t.tenantId),
    index("fam_capex_opex_ref_idx").on(t.classificationRef),
    index("fam_capex_opex_status_idx").on(t.status),
    index("fam_capex_opex_type_idx").on(t.classificationType),
  ]
);

// ==========================================
// Asset Impairment Testing IFRS
// ==========================================
export const famImpairmentTests = pgTable(
  "fam_impairment_tests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    testRef: varchar("test_ref", { length: 50 }).notNull(),
    testType: varchar("test_type", { length: 30 }).notNull(), // annual, triggered, interim, goodwill, cgu
    assetRef: varchar("asset_ref", { length: 50 }),
    assetName: varchar("asset_name", { length: 255 }),
    testDate: timestamp("test_date", { withTimezone: true }),
    carryingAmount: decimal("carrying_amount", { precision: 14, scale: 2 }),
    recoverableAmount: decimal("recoverable_amount", { precision: 14, scale: 2 }),
    fairValueLessCosts: decimal("fair_value_less_costs", { precision: 14, scale: 2 }),
    valueInUse: decimal("value_in_use", { precision: 14, scale: 2 }),
    impairmentLoss: decimal("impairment_loss", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    discountRate: decimal("discount_rate", { precision: 6, scale: 4 }),
    cashFlowProjections: jsonb("cash_flow_projections"), // [{ year, amount }]
    triggerIndicators: jsonb("trigger_indicators"), // [{ indicator, description }]
    reversalAmount: decimal("reversal_amount", { precision: 14, scale: 2 }),
    testedBy: varchar("tested_by", { length: 255 }),
    reviewedBy: varchar("reviewed_by", { length: 255 }),
    journalEntryRef: varchar("journal_entry_ref", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("fam_impairment_tenant_idx").on(t.tenantId),
    index("fam_impairment_ref_idx").on(t.testRef),
    index("fam_impairment_status_idx").on(t.status),
    index("fam_impairment_asset_idx").on(t.assetRef),
  ]
);

// ==========================================
// IFRS16 Lease Accounting ROU Assets
// ==========================================
export const famLeaseAccounting = pgTable(
  "fam_lease_accounting",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    leaseRef: varchar("lease_ref", { length: 50 }).notNull(),
    leaseType: varchar("lease_type", { length: 30 }).notNull(), // finance_lease, operating_lease, short_term, low_value, sublease
    assetRef: varchar("asset_ref", { length: 50 }),
    assetName: varchar("asset_name", { length: 255 }),
    lessorName: varchar("lessor_name", { length: 255 }),
    leaseStartDate: timestamp("lease_start_date", { withTimezone: true }),
    leaseEndDate: timestamp("lease_end_date", { withTimezone: true }),
    leaseTermMonths: integer("lease_term_months"),
    monthlyPayment: decimal("monthly_payment", { precision: 14, scale: 2 }),
    annualPayment: decimal("annual_payment", { precision: 14, scale: 2 }),
    totalLeasePayments: decimal("total_lease_payments", { precision: 14, scale: 2 }),
    discountRate: decimal("discount_rate", { precision: 6, scale: 4 }),
    rouAssetValue: decimal("rou_asset_value", { precision: 14, scale: 2 }),
    leaseLiability: decimal("lease_liability", { precision: 14, scale: 2 }),
    accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 14, scale: 2 }),
    interestExpense: decimal("interest_expense", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    renewalOption: boolean("renewal_option").default(false),
    purchaseOption: boolean("purchase_option").default(false),
    terminationOption: boolean("termination_option").default(false),
    paymentSchedule: jsonb("payment_schedule"), // [{ period, payment, interest, principal, balance }]
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("fam_lease_tenant_idx").on(t.tenantId),
    index("fam_lease_ref_idx").on(t.leaseRef),
    index("fam_lease_status_idx").on(t.status),
    index("fam_lease_asset_idx").on(t.assetRef),
  ]
);
