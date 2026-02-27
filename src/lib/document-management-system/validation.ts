import { z } from "zod";

// Document Category schemas
export const createDocumentCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
export const updateDocumentCategorySchema = createDocumentCategorySchema.partial();

// Document schemas
export const createDocumentSchema = z.object({
  categoryId: z.string().uuid().optional(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  documentNumber: z.string().max(100).optional(),
  documentType: z.string().min(1).max(50),
  entityType: z.string().max(50).optional(),
  entityId: z.string().uuid().optional(),
  fileName: z.string().min(1).max(500),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1).max(100),
  storagePath: z.string().min(1).max(1000),
  storageProvider: z.string().max(50).optional(),
  status: z.enum(["active", "draft", "pending_review", "approved", "rejected", "expired"]).optional(),
  classification: z.enum(["public", "internal", "confidential", "restricted"]).optional(),
  tags: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
});
export const updateDocumentSchema = createDocumentSchema.partial();

// Document Version schemas
export const createDocumentVersionSchema = z.object({
  documentId: z.string().uuid(),
  versionNumber: z.number().int().positive(),
  fileName: z.string().min(1).max(500),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1).max(100),
  storagePath: z.string().min(1).max(1000),
  changeNotes: z.string().optional(),
  checksum: z.string().max(128).optional(),
});

// Document Signature schemas
export const createDocumentSignatureSchema = z.object({
  documentId: z.string().uuid(),
  versionId: z.string().uuid().optional(),
  signerId: z.string().uuid(),
  signerName: z.string().min(1).max(255),
  signerEmail: z.string().email().optional(),
  signatureType: z.enum(["electronic", "digital", "biometric", "stamp"]).optional(),
  reason: z.string().optional(),
  stampType: z.string().max(30).optional(),
});
export const actionSignatureSchema = z.object({
  action: z.enum(["sign", "reject", "revoke"]),
  signatureData: z.string().optional(),
  reason: z.string().optional(),
  ipAddress: z.string().max(45).optional(),
});

// Document Template schemas
export const createDocumentTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  documentType: z.string().min(1).max(50),
  templateFormat: z.enum(["html", "markdown", "docx", "pdf"]).optional(),
  bodyTemplate: z.string().min(1),
  headerTemplate: z.string().optional(),
  footerTemplate: z.string().optional(),
  variables: z.array(z.string()).optional(),
  sampleData: z.record(z.string(), z.unknown()).optional(),
  outputFormat: z.enum(["pdf", "docx", "html"]).optional(),
  isActive: z.boolean().optional(),
});
export const updateDocumentTemplateSchema = createDocumentTemplateSchema.partial();

// OCR Result schemas
export const createOcrResultSchema = z.object({
  documentId: z.string().uuid(),
  versionId: z.string().uuid().optional(),
  ocrEngine: z.string().max(50).optional(),
});
export const updateOcrResultSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  extractedText: z.string().optional(),
  extractedData: z.record(z.string(), z.unknown()).optional(),
  confidence: z.number().int().min(0).max(100).optional(),
  language: z.string().max(10).optional(),
  pageCount: z.number().int().positive().optional(),
  processingTimeMs: z.number().int().positive().optional(),
  errorMessage: z.string().optional(),
});

// Expiry Alert schemas
export const createExpiryAlertSchema = z.object({
  documentId: z.string().uuid(),
  alertType: z.enum(["expiry", "renewal", "review"]).optional(),
  alertDaysBefore: z.number().int().positive().optional(),
  alertDate: z.string().datetime(),
  assignedTo: z.string().uuid().optional(),
  notes: z.string().optional(),
});
export const updateExpiryAlertSchema = z.object({
  status: z.enum(["pending", "notified", "acknowledged", "renewed", "dismissed"]).optional(),
  acknowledgedBy: z.string().uuid().optional(),
  renewalDate: z.string().datetime().optional(),
  renewalDocumentId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

// Retention Policy schemas
export const createRetentionPolicySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  documentType: z.string().min(1).max(50),
  retentionDays: z.number().int().positive(),
  archiveAfterDays: z.number().int().positive().optional(),
  autoArchive: z.boolean().optional(),
  autoDelete: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
export const updateRetentionPolicySchema = createRetentionPolicySchema.partial();

// Search Index schemas
export const createSearchIndexSchema = z.object({
  documentId: z.string().uuid(),
  versionId: z.string().uuid().optional(),
});
export const updateSearchIndexSchema = z.object({
  indexedContent: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  entities: z.record(z.string(), z.unknown()).optional(),
  summary: z.string().optional(),
  language: z.string().max(10).optional(),
  indexStatus: z.enum(["pending", "indexing", "completed", "failed"]).optional(),
  errorMessage: z.string().optional(),
});
