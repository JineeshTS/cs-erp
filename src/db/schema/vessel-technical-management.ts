import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ==========================================
// FEAT-019-1-001: Planned Maintenance System PMS
// ==========================================

export const vtmPlannedMaintenanceTasks = pgTable(
  "vtm_planned_maintenance_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    taskRef: varchar("task_ref", { length: 50 }).notNull(),
    vesselId: uuid("vessel_id"),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    equipmentCode: varchar("equipment_code", { length: 50 }).notNull(),
    equipmentName: varchar("equipment_name", { length: 255 }).notNull(),
    componentName: varchar("component_name", { length: 255 }),
    maintenanceType: varchar("maintenance_type", { length: 30 }).notNull(),
    intervalType: varchar("interval_type", { length: 30 }).notNull(),
    intervalValue: integer("interval_value").notNull(),
    lastDoneDate: timestamp("last_done_date", { withTimezone: true }),
    lastDoneHours: integer("last_done_hours"),
    nextDueDate: timestamp("next_due_date", { withTimezone: true }),
    nextDueHours: integer("next_due_hours"),
    priority: varchar("priority", { length: 20 }).notNull().default("medium"),
    assignedTo: uuid("assigned_to"),
    assignedToName: varchar("assigned_to_name", { length: 255 }),
    department: varchar("department", { length: 100 }),
    estimatedHours: integer("estimated_hours"),
    actualHours: integer("actual_hours"),
    spareParts: jsonb("spare_parts"),
    instructions: text("instructions"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedByName: varchar("completed_by_name", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("planned"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("vtm_pmt_tenant_id_idx").on(table.tenantId),
    uniqueIndex("vtm_pmt_tenant_ref_idx").on(table.tenantId, table.taskRef),
    index("vtm_pmt_vessel_id_idx").on(table.vesselId),
    index("vtm_pmt_vessel_name_idx").on(table.vesselName),
    index("vtm_pmt_equipment_code_idx").on(table.equipmentCode),
    index("vtm_pmt_maintenance_type_idx").on(table.maintenanceType),
    index("vtm_pmt_next_due_date_idx").on(table.nextDueDate),
    index("vtm_pmt_priority_idx").on(table.priority),
    index("vtm_pmt_status_idx").on(table.status),
    index("vtm_pmt_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-019-1-002: Dry Dock Planning & Management
// ==========================================

export const vtmDryDockPlans = pgTable(
  "vtm_dry_dock_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    planRef: varchar("plan_ref", { length: 50 }).notNull(),
    vesselId: uuid("vessel_id"),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    dockYardName: varchar("dock_yard_name", { length: 255 }).notNull(),
    dockYardLocation: varchar("dock_yard_location", { length: 255 }),
    dockYardCountry: varchar("dock_yard_country", { length: 100 }),
    plannedStartDate: timestamp("planned_start_date", { withTimezone: true }).notNull(),
    plannedEndDate: timestamp("planned_end_date", { withTimezone: true }).notNull(),
    actualStartDate: timestamp("actual_start_date", { withTimezone: true }),
    actualEndDate: timestamp("actual_end_date", { withTimezone: true }),
    scope: text("scope"),
    specifications: jsonb("specifications"),
    estimatedCost: integer("estimated_cost").notNull().default(0),
    actualCost: integer("actual_cost"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    quotations: jsonb("quotations"),
    selectedContractor: varchar("selected_contractor", { length: 255 }),
    className: varchar("class_name", { length: 100 }),
    classApproval: boolean("class_approval").default(false),
    projectManagerName: varchar("project_manager_name", { length: 255 }),
    workItems: jsonb("work_items"),
    status: varchar("status", { length: 20 }).notNull().default("planning"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("vtm_ddp_tenant_id_idx").on(table.tenantId),
    uniqueIndex("vtm_ddp_tenant_ref_idx").on(table.tenantId, table.planRef),
    index("vtm_ddp_vessel_id_idx").on(table.vesselId),
    index("vtm_ddp_vessel_name_idx").on(table.vesselName),
    index("vtm_ddp_planned_start_idx").on(table.plannedStartDate),
    index("vtm_ddp_planned_end_idx").on(table.plannedEndDate),
    index("vtm_ddp_status_idx").on(table.status),
    index("vtm_ddp_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-019-1-003: Classification & Flag State Survey Tracking
// ==========================================

export const vtmSurveyTrackings = pgTable(
  "vtm_survey_trackings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    surveyRef: varchar("survey_ref", { length: 50 }).notNull(),
    vesselId: uuid("vessel_id"),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    surveyType: varchar("survey_type", { length: 30 }).notNull(),
    surveyAuthority: varchar("survey_authority", { length: 255 }).notNull(),
    surveyorName: varchar("surveyor_name", { length: 255 }),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    windowStartDate: timestamp("window_start_date", { withTimezone: true }),
    windowEndDate: timestamp("window_end_date", { withTimezone: true }),
    surveyDate: timestamp("survey_date", { withTimezone: true }),
    completedDate: timestamp("completed_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    certificateName: varchar("certificate_name", { length: 255 }),
    certificateNumber: varchar("certificate_number", { length: 100 }),
    issuedBy: varchar("issued_by", { length: 255 }),
    findings: jsonb("findings"),
    conditions: jsonb("conditions"),
    remediationRequired: boolean("remediation_required").default(false),
    remediationDeadline: timestamp("remediation_deadline", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("upcoming"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("vtm_st_tenant_id_idx").on(table.tenantId),
    uniqueIndex("vtm_st_tenant_ref_idx").on(table.tenantId, table.surveyRef),
    index("vtm_st_vessel_id_idx").on(table.vesselId),
    index("vtm_st_vessel_name_idx").on(table.vesselName),
    index("vtm_st_survey_type_idx").on(table.surveyType),
    index("vtm_st_due_date_idx").on(table.dueDate),
    index("vtm_st_expiry_date_idx").on(table.expiryDate),
    index("vtm_st_status_idx").on(table.status),
    index("vtm_st_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-019-1-004: Defect & Repair Management
// ==========================================

export const vtmDefectRepairs = pgTable(
  "vtm_defect_repairs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    defectRef: varchar("defect_ref", { length: 50 }).notNull(),
    vesselId: uuid("vessel_id"),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    equipmentCode: varchar("equipment_code", { length: 50 }),
    equipmentName: varchar("equipment_name", { length: 255 }),
    defectCategory: varchar("defect_category", { length: 30 }).notNull(),
    severity: varchar("severity", { length: 20 }).notNull(),
    reportedDate: timestamp("reported_date", { withTimezone: true }).notNull(),
    reportedByName: varchar("reported_by_name", { length: 255 }),
    description: text("description").notNull(),
    rootCause: text("root_cause"),
    repairMethod: text("repair_method"),
    estimatedCost: integer("estimated_cost"),
    actualCost: integer("actual_cost"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    repairStartDate: timestamp("repair_start_date", { withTimezone: true }),
    repairEndDate: timestamp("repair_end_date", { withTimezone: true }),
    repairedByName: varchar("repaired_by_name", { length: 255 }),
    classNotificationRequired: boolean("class_notification_required").default(false),
    classNotified: boolean("class_notified").default(false),
    sparesUsed: jsonb("spares_used"),
    photos: jsonb("photos"),
    status: varchar("status", { length: 20 }).notNull().default("reported"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("vtm_dr_tenant_id_idx").on(table.tenantId),
    uniqueIndex("vtm_dr_tenant_ref_idx").on(table.tenantId, table.defectRef),
    index("vtm_dr_vessel_id_idx").on(table.vesselId),
    index("vtm_dr_vessel_name_idx").on(table.vesselName),
    index("vtm_dr_equipment_code_idx").on(table.equipmentCode),
    index("vtm_dr_defect_category_idx").on(table.defectCategory),
    index("vtm_dr_severity_idx").on(table.severity),
    index("vtm_dr_reported_date_idx").on(table.reportedDate),
    index("vtm_dr_status_idx").on(table.status),
    index("vtm_dr_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-019-2-001: Spare Parts Inventory & Ordering
// ==========================================

export const vtmSpareParts = pgTable(
  "vtm_spare_parts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    partRef: varchar("part_ref", { length: 50 }).notNull(),
    vesselId: uuid("vessel_id"),
    vesselName: varchar("vessel_name", { length: 255 }),
    partNumber: varchar("part_number", { length: 100 }).notNull(),
    partName: varchar("part_name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 30 }).notNull(),
    manufacturer: varchar("manufacturer", { length: 255 }),
    modelNumber: varchar("model_number", { length: 100 }),
    unitOfMeasure: varchar("unit_of_measure", { length: 30 }),
    minimumStock: integer("minimum_stock").notNull().default(0),
    currentStock: integer("current_stock").notNull().default(0),
    reorderLevel: integer("reorder_level").notNull().default(0),
    lastOrderDate: timestamp("last_order_date", { withTimezone: true }),
    lastOrderQuantity: integer("last_order_quantity"),
    lastUnitPrice: integer("last_unit_price"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    storageLocation: varchar("storage_location", { length: 255 }),
    criticalPart: boolean("critical_part").default(false),
    leadTimeDays: integer("lead_time_days"),
    preferredSupplierName: varchar("preferred_supplier_name", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("vtm_sp_tenant_id_idx").on(table.tenantId),
    uniqueIndex("vtm_sp_tenant_ref_idx").on(table.tenantId, table.partRef),
    index("vtm_sp_vessel_id_idx").on(table.vesselId),
    index("vtm_sp_part_number_idx").on(table.partNumber),
    index("vtm_sp_part_name_idx").on(table.partName),
    index("vtm_sp_category_idx").on(table.category),
    index("vtm_sp_manufacturer_idx").on(table.manufacturer),
    index("vtm_sp_critical_part_idx").on(table.criticalPart),
    index("vtm_sp_status_idx").on(table.status),
    index("vtm_sp_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-019-2-002: Technical Procurement & Approval
// ==========================================

export const vtmTechnicalProcurements = pgTable(
  "vtm_technical_procurements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    procurementRef: varchar("procurement_ref", { length: 50 }).notNull(),
    vesselId: uuid("vessel_id"),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    requestType: varchar("request_type", { length: 30 }).notNull(),
    description: text("description").notNull(),
    lineItems: jsonb("line_items"),
    requestedByName: varchar("requested_by_name", { length: 255 }),
    department: varchar("department", { length: 100 }),
    urgency: varchar("urgency", { length: 20 }).notNull().default("routine"),
    estimatedBudget: integer("estimated_budget").notNull().default(0),
    approvedBudget: integer("approved_budget"),
    actualCost: integer("actual_cost"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    supplierName: varchar("supplier_name", { length: 255 }),
    quotations: jsonb("quotations"),
    purchaseOrderRef: varchar("purchase_order_ref", { length: 100 }),
    deliveryDate: timestamp("delivery_date", { withTimezone: true }),
    approvedByName: varchar("approved_by_name", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("vtm_tp_tenant_id_idx").on(table.tenantId),
    uniqueIndex("vtm_tp_tenant_ref_idx").on(table.tenantId, table.procurementRef),
    index("vtm_tp_vessel_id_idx").on(table.vesselId),
    index("vtm_tp_vessel_name_idx").on(table.vesselName),
    index("vtm_tp_request_type_idx").on(table.requestType),
    index("vtm_tp_urgency_idx").on(table.urgency),
    index("vtm_tp_delivery_date_idx").on(table.deliveryDate),
    index("vtm_tp_status_idx").on(table.status),
    index("vtm_tp_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-019-2-003: SOLAS ISM SMS Compliance
// ==========================================

export const vtmComplianceRecords = pgTable(
  "vtm_compliance_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    recordRef: varchar("record_ref", { length: 50 }).notNull(),
    vesselId: uuid("vessel_id"),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    complianceType: varchar("compliance_type", { length: 30 }).notNull(),
    certificateName: varchar("certificate_name", { length: 255 }),
    certificateNumber: varchar("certificate_number", { length: 100 }),
    issuingAuthority: varchar("issuing_authority", { length: 255 }),
    issuedDate: timestamp("issued_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    auditDate: timestamp("audit_date", { withTimezone: true }),
    auditorName: varchar("auditor_name", { length: 255 }),
    auditFindings: jsonb("audit_findings"),
    nonConformities: integer("non_conformities").notNull().default(0),
    majorNc: integer("major_nc").notNull().default(0),
    minorNc: integer("minor_nc").notNull().default(0),
    observations: integer("observations").notNull().default(0),
    correctiveActions: jsonb("corrective_actions"),
    closureDeadline: timestamp("closure_deadline", { withTimezone: true }),
    lastInspectionDate: timestamp("last_inspection_date", { withTimezone: true }),
    nextInspectionDate: timestamp("next_inspection_date", { withTimezone: true }),
    documentRefs: jsonb("document_refs"),
    status: varchar("status", { length: 20 }).notNull().default("valid"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("vtm_cr_tenant_id_idx").on(table.tenantId),
    uniqueIndex("vtm_cr_tenant_ref_idx").on(table.tenantId, table.recordRef),
    index("vtm_cr_vessel_id_idx").on(table.vesselId),
    index("vtm_cr_vessel_name_idx").on(table.vesselName),
    index("vtm_cr_compliance_type_idx").on(table.complianceType),
    index("vtm_cr_expiry_date_idx").on(table.expiryDate),
    index("vtm_cr_next_inspection_idx").on(table.nextInspectionDate),
    index("vtm_cr_status_idx").on(table.status),
    index("vtm_cr_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-019-2-004: AI Predictive Maintenance Engine
// ==========================================

export const vtmPredictiveMaintenance = pgTable(
  "vtm_predictive_maintenance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    predictionRef: varchar("prediction_ref", { length: 50 }).notNull(),
    vesselId: uuid("vessel_id"),
    vesselName: varchar("vessel_name", { length: 255 }).notNull(),
    equipmentCode: varchar("equipment_code", { length: 50 }).notNull(),
    equipmentName: varchar("equipment_name", { length: 255 }).notNull(),
    modelType: varchar("model_type", { length: 30 }).notNull(),
    inputParameters: jsonb("input_parameters"),
    modelVersion: varchar("model_version", { length: 50 }),
    predictionDate: timestamp("prediction_date", { withTimezone: true }).notNull(),
    predictedFailureDate: timestamp("predicted_failure_date", { withTimezone: true }),
    confidenceScore: integer("confidence_score"),
    riskLevel: varchar("risk_level", { length: 20 }).notNull().default("medium"),
    currentCondition: text("current_condition"),
    degradationRate: integer("degradation_rate"),
    recommendations: jsonb("recommendations"),
    aiInsights: text("ai_insights"),
    alertsGenerated: integer("alerts_generated").notNull().default(0),
    alertsSent: boolean("alerts_sent").default(false),
    actionTaken: text("action_taken"),
    actionDate: timestamp("action_date", { withTimezone: true }),
    accuracy: integer("accuracy"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("vtm_pm_tenant_id_idx").on(table.tenantId),
    uniqueIndex("vtm_pm_tenant_ref_idx").on(table.tenantId, table.predictionRef),
    index("vtm_pm_vessel_id_idx").on(table.vesselId),
    index("vtm_pm_vessel_name_idx").on(table.vesselName),
    index("vtm_pm_equipment_code_idx").on(table.equipmentCode),
    index("vtm_pm_model_type_idx").on(table.modelType),
    index("vtm_pm_prediction_date_idx").on(table.predictionDate),
    index("vtm_pm_risk_level_idx").on(table.riskLevel),
    index("vtm_pm_status_idx").on(table.status),
    index("vtm_pm_created_at_idx").on(table.createdAt),
  ]
);
