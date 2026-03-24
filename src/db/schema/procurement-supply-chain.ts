import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// Purchase Requisition Management
// ==========================================
export const pscPurchaseRequisitions = pgTable(
  "psc_purchase_requisitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    requisitionRef: varchar("requisition_ref", { length: 50 }).notNull(),
    requisitionType: varchar("requisition_type", { length: 30 }).notNull(), // standard, urgent, blanket, planned, emergency
    title: varchar("title", { length: 255 }).notNull(),
    requestedBy: varchar("requested_by", { length: 255 }),
    department: varchar("department", { length: 255 }),
    costCenter: varchar("cost_center", { length: 100 }),
    requestDate: timestamp("request_date", { withTimezone: true }),
    requiredDate: timestamp("required_date", { withTimezone: true }),
    priority: varchar("priority", { length: 20 }), // low, medium, high, critical
    lineItems: jsonb("line_items"), // [{ itemCode, description, qty, uom, estimatedPrice, currency }]
    totalEstimatedCost: decimal("total_estimated_cost", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    justification: text("justification"),
    approver: varchar("approver", { length: 255 }),
    approvalDate: timestamp("approval_date", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    linkedPoRef: varchar("linked_po_ref", { length: 50 }),
    budgetCode: varchar("budget_code", { length: 50 }),
    deliveryLocation: varchar("delivery_location", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("psc_requisitions_tenant_idx").on(t.tenantId),
    index("psc_requisitions_ref_idx").on(t.requisitionRef),
    index("psc_requisitions_status_idx").on(t.status),
    index("psc_requisitions_dept_idx").on(t.department),
  ]
);

// ==========================================
// Vendor Sourcing & RFQ Process
// ==========================================
export const pscVendorSourcings = pgTable(
  "psc_vendor_sourcings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    sourcingRef: varchar("sourcing_ref", { length: 50 }).notNull(),
    sourcingType: varchar("sourcing_type", { length: 30 }).notNull(), // rfq, rfp, rfi, reverse_auction, sole_source
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 255 }),
    issueDate: timestamp("issue_date", { withTimezone: true }),
    closingDate: timestamp("closing_date", { withTimezone: true }),
    evaluationDate: timestamp("evaluation_date", { withTimezone: true }),
    invitedVendors: jsonb("invited_vendors"), // [{ vendorId, vendorName, email, responseStatus }]
    evaluationCriteria: jsonb("evaluation_criteria"), // [{ criterion, weight, maxScore }]
    submissions: jsonb("submissions"), // [{ vendorId, vendorName, totalPrice, score, rank }]
    selectedVendor: varchar("selected_vendor", { length: 255 }),
    selectionReason: text("selection_reason"),
    totalBudget: decimal("total_budget", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    linkedRequisitionRef: varchar("linked_requisition_ref", { length: 50 }),
    linkedPoRef: varchar("linked_po_ref", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("psc_sourcing_tenant_idx").on(t.tenantId),
    index("psc_sourcing_ref_idx").on(t.sourcingRef),
    index("psc_sourcing_status_idx").on(t.status),
    index("psc_sourcing_category_idx").on(t.category),
  ]
);

// ==========================================
// Purchase Order Lifecycle Management
// ==========================================
export const pscPurchaseOrders = pgTable(
  "psc_purchase_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    poRef: varchar("po_ref", { length: 50 }).notNull(),
    poType: varchar("po_type", { length: 30 }).notNull(), // standard, blanket, contract, scheduled, emergency
    vendorName: varchar("vendor_name", { length: 255 }),
    vendorId: varchar("vendor_id", { length: 100 }),
    orderDate: timestamp("order_date", { withTimezone: true }),
    deliveryDate: timestamp("delivery_date", { withTimezone: true }),
    lineItems: jsonb("line_items"), // [{ itemCode, description, qty, uom, unitPrice, totalPrice, currency }]
    subtotal: decimal("subtotal", { precision: 14, scale: 2 }),
    taxAmount: decimal("tax_amount", { precision: 14, scale: 2 }),
    shippingCost: decimal("shipping_cost", { precision: 14, scale: 2 }),
    discount: decimal("discount", { precision: 14, scale: 2 }),
    totalAmount: decimal("total_amount", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    paymentTerms: varchar("payment_terms", { length: 100 }),
    shippingMethod: varchar("shipping_method", { length: 100 }),
    deliveryAddress: text("delivery_address"),
    linkedRequisitionRef: varchar("linked_requisition_ref", { length: 50 }),
    linkedSourcingRef: varchar("linked_sourcing_ref", { length: 50 }),
    approvedBy: varchar("approved_by", { length: 255 }),
    approvalDate: timestamp("approval_date", { withTimezone: true }),
    receivedDate: timestamp("received_date", { withTimezone: true }),
    invoiceRef: varchar("invoice_ref", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("psc_po_tenant_idx").on(t.tenantId),
    index("psc_po_ref_idx").on(t.poRef),
    index("psc_po_status_idx").on(t.status),
    index("psc_po_vendor_idx").on(t.vendorId),
  ]
);

// ==========================================
// Procurement Contract Management
// ==========================================
export const pscProcurementContracts = pgTable(
  "psc_procurement_contracts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    contractRef: varchar("contract_ref", { length: 50 }).notNull(),
    contractType: varchar("contract_type", { length: 30 }).notNull(), // fixed_price, cost_plus, framework, blanket, service_level
    title: varchar("title", { length: 255 }).notNull(),
    vendorName: varchar("vendor_name", { length: 255 }),
    vendorId: varchar("vendor_id", { length: 100 }),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    contractValue: decimal("contract_value", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    paymentTerms: varchar("payment_terms", { length: 100 }),
    autoRenewal: boolean("auto_renewal").default(false),
    renewalNoticeDays: integer("renewal_notice_days"),
    penaltyClause: text("penalty_clause"),
    kpiMetrics: jsonb("kpi_metrics"), // [{ metric, target, threshold, weight }]
    milestones: jsonb("milestones"), // [{ title, dueDate, deliverable, status }]
    linkedPoRefs: jsonb("linked_po_refs"), // ["PO-xxx", ...]
    signedBy: varchar("signed_by", { length: 255 }),
    signatureDate: timestamp("signature_date", { withTimezone: true }),
    terminationDate: timestamp("termination_date", { withTimezone: true }),
    terminationReason: text("termination_reason"),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("psc_contract_tenant_idx").on(t.tenantId),
    index("psc_contract_ref_idx").on(t.contractRef),
    index("psc_contract_status_idx").on(t.status),
    index("psc_contract_vendor_idx").on(t.vendorId),
  ]
);

// ==========================================
// Inventory Management & Stock Control
// ==========================================
export const pscInventoryStockControls = pgTable(
  "psc_inventory_stock_controls",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    inventoryRef: varchar("inventory_ref", { length: 50 }).notNull(),
    inventoryType: varchar("inventory_type", { length: 30 }).notNull(), // raw_material, spare_part, consumable, finished_goods, safety_stock
    itemCode: varchar("item_code", { length: 100 }).notNull(),
    itemName: varchar("item_name", { length: 255 }).notNull(),
    category: varchar("category", { length: 255 }),
    uom: varchar("uom", { length: 30 }), // units, kg, liters, meters, boxes
    currentStock: decimal("current_stock", { precision: 14, scale: 2 }),
    reorderLevel: decimal("reorder_level", { precision: 14, scale: 2 }),
    reorderQuantity: decimal("reorder_quantity", { precision: 14, scale: 2 }),
    safetyStock: decimal("safety_stock", { precision: 14, scale: 2 }),
    maxStock: decimal("max_stock", { precision: 14, scale: 2 }),
    unitCost: decimal("unit_cost", { precision: 14, scale: 2 }),
    totalValue: decimal("total_value", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    warehouseLocation: varchar("warehouse_location", { length: 255 }),
    binNumber: varchar("bin_number", { length: 50 }),
    lastReceivedDate: timestamp("last_received_date", { withTimezone: true }),
    lastIssuedDate: timestamp("last_issued_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    batchNumber: varchar("batch_number", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("psc_inventory_tenant_idx").on(t.tenantId),
    index("psc_inventory_ref_idx").on(t.inventoryRef),
    index("psc_inventory_status_idx").on(t.status),
    index("psc_inventory_item_idx").on(t.itemCode),
    index("psc_inventory_category_idx").on(t.category),
  ]
);

// ==========================================
// Goods Receipt & Quality Inspection
// ==========================================
export const pscGoodsReceiptInspections = pgTable(
  "psc_goods_receipt_inspections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    receiptRef: varchar("receipt_ref", { length: 50 }).notNull(),
    receiptType: varchar("receipt_type", { length: 30 }).notNull(), // standard, return, transfer, adjustment, inspection
    linkedPoRef: varchar("linked_po_ref", { length: 50 }),
    vendorName: varchar("vendor_name", { length: 255 }),
    vendorId: varchar("vendor_id", { length: 100 }),
    receiptDate: timestamp("receipt_date", { withTimezone: true }),
    receivedBy: varchar("received_by", { length: 255 }),
    lineItems: jsonb("line_items"), // [{ itemCode, description, orderedQty, receivedQty, acceptedQty, rejectedQty, uom }]
    totalOrderedQty: decimal("total_ordered_qty", { precision: 14, scale: 2 }),
    totalReceivedQty: decimal("total_received_qty", { precision: 14, scale: 2 }),
    totalAcceptedQty: decimal("total_accepted_qty", { precision: 14, scale: 2 }),
    totalRejectedQty: decimal("total_rejected_qty", { precision: 14, scale: 2 }),
    inspectionDate: timestamp("inspection_date", { withTimezone: true }),
    inspectedBy: varchar("inspected_by", { length: 255 }),
    inspectionResult: varchar("inspection_result", { length: 30 }), // pass, fail, partial, conditional
    inspectionFindings: jsonb("inspection_findings"), // [{ item, finding, severity, action }]
    qualityCertificateRef: varchar("quality_certificate_ref", { length: 100 }),
    warehouseLocation: varchar("warehouse_location", { length: 255 }),
    deliveryNoteRef: varchar("delivery_note_ref", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("psc_receipt_tenant_idx").on(t.tenantId),
    index("psc_receipt_ref_idx").on(t.receiptRef),
    index("psc_receipt_status_idx").on(t.status),
    index("psc_receipt_po_idx").on(t.linkedPoRef),
  ]
);

// ==========================================
// AI Spend Analytics & Optimization
// ==========================================
export const pscSpendAnalytics = pgTable(
  "psc_spend_analytics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    analyticsRef: varchar("analytics_ref", { length: 50 }).notNull(),
    analyticsType: varchar("analytics_type", { length: 30 }).notNull(), // category_analysis, vendor_analysis, trend_analysis, savings_opportunity, anomaly_detection, forecast
    title: varchar("title", { length: 255 }).notNull(),
    analysisPeriodStart: timestamp("analysis_period_start", { withTimezone: true }),
    analysisPeriodEnd: timestamp("analysis_period_end", { withTimezone: true }),
    totalSpend: decimal("total_spend", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("QAR"),
    categoryBreakdown: jsonb("category_breakdown"), // [{ category, amount, percentage }]
    vendorBreakdown: jsonb("vendor_breakdown"), // [{ vendorName, amount, percentage }]
    savingsIdentified: decimal("savings_identified", { precision: 14, scale: 2 }),
    savingsRealized: decimal("savings_realized", { precision: 14, scale: 2 }),
    recommendations: jsonb("recommendations"), // [{ title, description, estimatedSaving, priority }]
    anomalies: jsonb("anomalies"), // [{ description, amount, severity, vendorName }]
    forecastNextPeriod: decimal("forecast_next_period", { precision: 14, scale: 2 }),
    confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
    aiModelUsed: varchar("ai_model_used", { length: 100 }),
    dataPoints: integer("data_points"),
    generatedBy: varchar("generated_by", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("psc_analytics_tenant_idx").on(t.tenantId),
    index("psc_analytics_ref_idx").on(t.analyticsRef),
    index("psc_analytics_status_idx").on(t.status),
    index("psc_analytics_type_idx").on(t.analyticsType),
  ]
);

// ==========================================
// Supplier Performance Scorecard
// ==========================================
export const pscSupplierScorecards = pgTable(
  "psc_supplier_scorecards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    scorecardRef: varchar("scorecard_ref", { length: 50 }).notNull(),
    scorecardType: varchar("scorecard_type", { length: 30 }).notNull(), // quarterly, annual, project, incident, onboarding
    vendorName: varchar("vendor_name", { length: 255 }).notNull(),
    vendorId: varchar("vendor_id", { length: 100 }),
    evaluationPeriodStart: timestamp("evaluation_period_start", { withTimezone: true }),
    evaluationPeriodEnd: timestamp("evaluation_period_end", { withTimezone: true }),
    qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
    deliveryScore: decimal("delivery_score", { precision: 5, scale: 2 }),
    priceScore: decimal("price_score", { precision: 5, scale: 2 }),
    serviceScore: decimal("service_score", { precision: 5, scale: 2 }),
    complianceScore: decimal("compliance_score", { precision: 5, scale: 2 }),
    overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
    overallRating: varchar("overall_rating", { length: 30 }), // excellent, good, satisfactory, needs_improvement, poor
    totalOrdersEvaluated: integer("total_orders_evaluated"),
    onTimeDeliveryRate: decimal("on_time_delivery_rate", { precision: 5, scale: 2 }),
    defectRate: decimal("defect_rate", { precision: 5, scale: 2 }),
    responseTimeAvg: decimal("response_time_avg", { precision: 8, scale: 2 }), // in hours
    strengths: text("strengths"),
    weaknesses: text("weaknesses"),
    actionItems: jsonb("action_items"), // [{ action, assignee, dueDate, status }]
    evaluatedBy: varchar("evaluated_by", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("psc_scorecard_tenant_idx").on(t.tenantId),
    index("psc_scorecard_ref_idx").on(t.scorecardRef),
    index("psc_scorecard_status_idx").on(t.status),
    index("psc_scorecard_vendor_idx").on(t.vendorId),
  ]
);
