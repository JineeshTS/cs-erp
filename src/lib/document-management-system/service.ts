import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  dmsDocuments,
  dmsDocumentCategories,
  dmsDocumentVersions,
  dmsDocumentSignatures,
  dmsDocumentTemplates,
  dmsOcrResults,
  dmsExpiryAlerts,
  dmsRetentionPolicies,
  dmsSearchIndex,
} from "@/db/schema";

// Get DMS overview counts for a tenant
export async function getDmsOverview(tenantId: string) {
  const [
    documents,
    categories,
    templates,
    pendingSignatures,
    pendingAlerts,
    retentionPolicies,
  ] = await Promise.all([
    db
      .select({ id: dmsDocuments.id })
      .from(dmsDocuments)
      .where(
        and(
          eq(dmsDocuments.tenantId, tenantId),
          isNull(dmsDocuments.deletedAt)
        )
      ),
    db
      .select({ id: dmsDocumentCategories.id })
      .from(dmsDocumentCategories)
      .where(
        and(
          eq(dmsDocumentCategories.tenantId, tenantId),
          isNull(dmsDocumentCategories.deletedAt)
        )
      ),
    db
      .select({ id: dmsDocumentTemplates.id })
      .from(dmsDocumentTemplates)
      .where(
        and(
          eq(dmsDocumentTemplates.tenantId, tenantId),
          isNull(dmsDocumentTemplates.deletedAt)
        )
      ),
    db
      .select({ id: dmsDocumentSignatures.id })
      .from(dmsDocumentSignatures)
      .where(
        and(
          eq(dmsDocumentSignatures.tenantId, tenantId),
          eq(dmsDocumentSignatures.status, "pending"),
          isNull(dmsDocumentSignatures.deletedAt)
        )
      ),
    db
      .select({ id: dmsExpiryAlerts.id })
      .from(dmsExpiryAlerts)
      .where(
        and(
          eq(dmsExpiryAlerts.tenantId, tenantId),
          eq(dmsExpiryAlerts.status, "pending"),
          isNull(dmsExpiryAlerts.deletedAt)
        )
      ),
    db
      .select({ id: dmsRetentionPolicies.id })
      .from(dmsRetentionPolicies)
      .where(
        and(
          eq(dmsRetentionPolicies.tenantId, tenantId),
          isNull(dmsRetentionPolicies.deletedAt)
        )
      ),
  ]);

  return {
    documents: documents.length,
    categories: categories.length,
    templates: templates.length,
    pendingSignatures: pendingSignatures.length,
    pendingAlerts: pendingAlerts.length,
    retentionPolicies: retentionPolicies.length,
  };
}

// Create a new document version and update the document's currentVersionId
export async function createDocumentVersion(
  tenantId: string,
  documentId: string,
  data: {
    versionNumber: number;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
    changeNotes?: string;
    checksum?: string;
    uploadedBy: string;
  }
) {
  const [version] = await db
    .insert(dmsDocumentVersions)
    .values({
      tenantId,
      documentId,
      ...data,
    })
    .returning();

  await db
    .update(dmsDocuments)
    .set({ currentVersionId: version.id })
    .where(
      and(
        eq(dmsDocuments.id, documentId),
        eq(dmsDocuments.tenantId, tenantId),
        isNull(dmsDocuments.deletedAt)
      )
    );

  return version;
}

// Queue OCR processing for a document
export async function queueOcrProcessing(
  tenantId: string,
  documentId: string,
  versionId?: string,
  ocrEngine?: string
) {
  const [result] = await db
    .insert(dmsOcrResults)
    .values({
      tenantId,
      documentId,
      versionId,
      ocrEngine,
      status: "pending",
    })
    .returning();

  return result;
}

// Queue search indexing for a document
export async function queueSearchIndexing(
  tenantId: string,
  documentId: string,
  versionId?: string
) {
  const [entry] = await db
    .insert(dmsSearchIndex)
    .values({
      tenantId,
      documentId,
      versionId,
      indexStatus: "pending",
    })
    .returning();

  return entry;
}
