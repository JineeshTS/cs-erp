import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

// ==========================================
// FEAT-034-1-001: Document Repository & Classification
// ==========================================

export const dmsDocumentCategories = pgTable(
  "dms_document_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    parentId: uuid("parent_id").references((): AnyPgColumn => dmsDocumentCategories.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
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
    index("dms_doc_categories_tenant_id_idx").on(table.tenantId),
    uniqueIndex("dms_doc_categories_tenant_slug_idx").on(
      table.tenantId,
      table.slug
    ),
    index("dms_doc_categories_parent_id_idx").on(table.parentId),
    index("dms_doc_categories_is_active_idx").on(table.isActive),
  ]
);

export const dmsDocuments = pgTable(
  "dms_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(
      () => dmsDocumentCategories.id
    ),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    documentNumber: varchar("document_number", { length: 100 }),
    documentType: varchar("document_type", { length: 50 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: uuid("entity_id"),
    fileName: varchar("file_name", { length: 500 }).notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    storagePath: varchar("storage_path", { length: 1000 }).notNull(),
    storageProvider: varchar("storage_provider", { length: 50 })
      .notNull()
      .default("local"),
    currentVersionId: uuid("current_version_id"),
    status: varchar("status", { length: 30 })
      .notNull()
      .default("active"),
    classification: varchar("classification", { length: 30 })
      .notNull()
      .default("internal"),
    tags: jsonb("tags"),
    uploadedBy: uuid("uploaded_by").notNull().references(() => users.id),
    isArchived: boolean("is_archived").notNull().default(false),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
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
    index("dms_documents_tenant_id_idx").on(table.tenantId),
    index("dms_documents_category_id_idx").on(table.categoryId),
    index("dms_documents_document_type_idx").on(table.documentType),
    index("dms_documents_entity_idx").on(table.entityType, table.entityId),
    index("dms_documents_status_idx").on(table.status),
    index("dms_documents_classification_idx").on(table.classification),
    index("dms_documents_uploaded_by_idx").on(table.uploadedBy),
    index("dms_documents_is_archived_idx").on(table.isArchived),
    index("dms_documents_expires_at_idx").on(table.expiresAt),
    index("dms_documents_created_at_idx").on(table.createdAt),
  ]
);

// ==========================================
// FEAT-034-1-002: Version Control & Document History
// ==========================================

export const dmsDocumentVersions = pgTable(
  "dms_document_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => dmsDocuments.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    fileName: varchar("file_name", { length: 500 }).notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    storagePath: varchar("storage_path", { length: 1000 }).notNull(),
    changeNotes: text("change_notes"),
    uploadedBy: uuid("uploaded_by").notNull().references(() => users.id),
    checksum: varchar("checksum", { length: 128 }),
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
    index("dms_doc_versions_tenant_id_idx").on(table.tenantId),
    index("dms_doc_versions_document_id_idx").on(table.documentId),
    uniqueIndex("dms_doc_versions_doc_version_idx").on(
      table.documentId,
      table.versionNumber
    ),
    index("dms_doc_versions_uploaded_by_idx").on(table.uploadedBy),
  ]
);

// ==========================================
// FEAT-034-1-003: Digital Signature & e-Stamping
// ==========================================

export const dmsDocumentSignatures = pgTable(
  "dms_document_signatures",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => dmsDocuments.id, { onDelete: "cascade" }),
    versionId: uuid("version_id").references(
      () => dmsDocumentVersions.id
    ),
    signerId: uuid("signer_id").notNull(),
    signerName: varchar("signer_name", { length: 255 }).notNull(),
    signerEmail: varchar("signer_email", { length: 255 }),
    signatureType: varchar("signature_type", { length: 30 })
      .notNull()
      .default("electronic"),
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending"),
    signedAt: timestamp("signed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    signatureData: text("signature_data"),
    certificateSerial: varchar("certificate_serial", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    reason: text("reason"),
    stampType: varchar("stamp_type", { length: 30 }),
    stampData: jsonb("stamp_data"),
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
    index("dms_doc_signatures_tenant_id_idx").on(table.tenantId),
    index("dms_doc_signatures_document_id_idx").on(table.documentId),
    index("dms_doc_signatures_version_id_idx").on(table.versionId),
    index("dms_doc_signatures_signer_id_idx").on(table.signerId),
    index("dms_doc_signatures_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-034-1-004: Document Template Library
// ==========================================

export const dmsDocumentTemplates = pgTable(
  "dms_document_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    categoryId: uuid("category_id").references(
      () => dmsDocumentCategories.id
    ),
    documentType: varchar("document_type", { length: 50 }).notNull(),
    templateFormat: varchar("template_format", { length: 30 })
      .notNull()
      .default("html"),
    bodyTemplate: text("body_template").notNull(),
    headerTemplate: text("header_template"),
    footerTemplate: text("footer_template"),
    variables: jsonb("variables"),
    sampleData: jsonb("sample_data"),
    outputFormat: varchar("output_format", { length: 20 })
      .notNull()
      .default("pdf"),
    isActive: boolean("is_active").notNull().default(true),
    version: integer("version").notNull().default(1),
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
    index("dms_doc_templates_tenant_id_idx").on(table.tenantId),
    uniqueIndex("dms_doc_templates_tenant_slug_idx").on(
      table.tenantId,
      table.slug
    ),
    index("dms_doc_templates_category_id_idx").on(table.categoryId),
    index("dms_doc_templates_document_type_idx").on(table.documentType),
    index("dms_doc_templates_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-034-2-001: OCR Auto-Indexing & Data Extraction
// ==========================================

export const dmsOcrResults = pgTable(
  "dms_ocr_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => dmsDocuments.id, { onDelete: "cascade" }),
    versionId: uuid("version_id").references(
      () => dmsDocumentVersions.id
    ),
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending"),
    extractedText: text("extracted_text"),
    extractedData: jsonb("extracted_data"),
    confidence: integer("confidence"),
    language: varchar("language", { length: 10 }),
    pageCount: integer("page_count"),
    processingTimeMs: integer("processing_time_ms"),
    ocrEngine: varchar("ocr_engine", { length: 50 }),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
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
    index("dms_ocr_results_tenant_id_idx").on(table.tenantId),
    index("dms_ocr_results_document_id_idx").on(table.documentId),
    index("dms_ocr_results_version_id_idx").on(table.versionId),
    index("dms_ocr_results_status_idx").on(table.status),
  ]
);

// ==========================================
// FEAT-034-2-002: Document Expiry & Renewal Alerts
// ==========================================

export const dmsExpiryAlerts = pgTable(
  "dms_expiry_alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => dmsDocuments.id, { onDelete: "cascade" }),
    alertType: varchar("alert_type", { length: 30 })
      .notNull()
      .default("expiry"),
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending"),
    alertDaysBefore: integer("alert_days_before").notNull().default(30),
    alertDate: timestamp("alert_date", { withTimezone: true }).notNull(),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    acknowledgedBy: uuid("acknowledged_by"),
    renewalDate: timestamp("renewal_date", { withTimezone: true }),
    renewalDocumentId: uuid("renewal_document_id"),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
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
    index("dms_expiry_alerts_tenant_id_idx").on(table.tenantId),
    index("dms_expiry_alerts_document_id_idx").on(table.documentId),
    index("dms_expiry_alerts_status_idx").on(table.status),
    index("dms_expiry_alerts_alert_date_idx").on(table.alertDate),
    index("dms_expiry_alerts_assigned_to_idx").on(table.assignedTo),
  ]
);

// ==========================================
// FEAT-034-2-003: Archive & Retention Management
// ==========================================

export const dmsRetentionPolicies = pgTable(
  "dms_retention_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    documentType: varchar("document_type", { length: 50 }).notNull(),
    retentionDays: integer("retention_days").notNull(),
    archiveAfterDays: integer("archive_after_days"),
    autoArchive: boolean("auto_archive").notNull().default(false),
    autoDelete: boolean("auto_delete").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    lastExecutedAt: timestamp("last_executed_at", { withTimezone: true }),
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
    index("dms_retention_policies_tenant_id_idx").on(table.tenantId),
    index("dms_retention_policies_doc_type_idx").on(table.documentType),
    index("dms_retention_policies_is_active_idx").on(table.isActive),
  ]
);

// ==========================================
// FEAT-034-2-004: AI Document Search & Retrieval
// ==========================================

export const dmsSearchIndex = pgTable(
  "dms_search_index",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => dmsDocuments.id, { onDelete: "cascade" }),
    versionId: uuid("version_id").references(
      () => dmsDocumentVersions.id
    ),
    indexedContent: text("indexed_content"),
    keywords: jsonb("keywords"),
    entities: jsonb("entities"),
    summary: text("summary"),
    language: varchar("language", { length: 10 }),
    indexStatus: varchar("index_status", { length: 30 })
      .notNull()
      .default("pending"),
    lastIndexedAt: timestamp("last_indexed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
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
    index("dms_search_index_tenant_id_idx").on(table.tenantId),
    index("dms_search_index_document_id_idx").on(table.documentId),
    index("dms_search_index_version_id_idx").on(table.versionId),
    index("dms_search_index_status_idx").on(table.indexStatus),
  ]
);
