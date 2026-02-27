import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  dmsDocumentCategories,
  dmsDocuments,
  dmsDocumentVersions,
  dmsDocumentSignatures,
  dmsDocumentTemplates,
  dmsOcrResults,
  dmsExpiryAlerts,
  dmsRetentionPolicies,
  dmsSearchIndex,
} from "@/db/schema/document-management-system";

// Document Categories
export type DocumentCategory = InferSelectModel<typeof dmsDocumentCategories>;
export type NewDocumentCategory = InferInsertModel<typeof dmsDocumentCategories>;

// Documents
export type Document = InferSelectModel<typeof dmsDocuments>;
export type NewDocument = InferInsertModel<typeof dmsDocuments>;

// Document Versions
export type DocumentVersion = InferSelectModel<typeof dmsDocumentVersions>;
export type NewDocumentVersion = InferInsertModel<typeof dmsDocumentVersions>;

// Document Signatures
export type DocumentSignature = InferSelectModel<typeof dmsDocumentSignatures>;
export type NewDocumentSignature = InferInsertModel<typeof dmsDocumentSignatures>;

// Document Templates
export type DocumentTemplate = InferSelectModel<typeof dmsDocumentTemplates>;
export type NewDocumentTemplate = InferInsertModel<typeof dmsDocumentTemplates>;

// OCR Results
export type OcrResult = InferSelectModel<typeof dmsOcrResults>;
export type NewOcrResult = InferInsertModel<typeof dmsOcrResults>;

// Expiry Alerts
export type ExpiryAlert = InferSelectModel<typeof dmsExpiryAlerts>;
export type NewExpiryAlert = InferInsertModel<typeof dmsExpiryAlerts>;

// Retention Policies
export type RetentionPolicy = InferSelectModel<typeof dmsRetentionPolicies>;
export type NewRetentionPolicy = InferInsertModel<typeof dmsRetentionPolicies>;

// Search Index
export type SearchIndexEntry = InferSelectModel<typeof dmsSearchIndex>;
export type NewSearchIndexEntry = InferInsertModel<typeof dmsSearchIndex>;
