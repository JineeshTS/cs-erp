import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  adminModuleConfigs,
  adminFeatureConfigs,
  adminAiAgentConfigs,
  adminApprovalMatrices,
  adminIntegrationEndpoints,
  adminMasterDataConfigs,
  adminAuditLogs,
  adminSystemHealthMetrics,
  adminFeatureFlags,
  adminLicenses,
  adminImportExportJobs,
  adminNotificationConfigs,
} from "@/db/schema";

export async function getAdminOverview(tenantId: string) {
  const [
    moduleConfigs,
    featureConfigs,
    aiAgentConfigs,
    approvalMatrices,
    integrationEndpoints,
    masterDataConfigs,
    auditLogs,
    healthMetrics,
    featureFlags,
    licenses,
    importExportJobs,
    notificationConfigs,
  ] = await Promise.all([
    db
      .select({ id: adminModuleConfigs.id })
      .from(adminModuleConfigs)
      .where(
        and(
          eq(adminModuleConfigs.tenantId, tenantId),
          isNull(adminModuleConfigs.deletedAt)
        )
      ),
    db
      .select({ id: adminFeatureConfigs.id })
      .from(adminFeatureConfigs)
      .where(
        and(
          eq(adminFeatureConfigs.tenantId, tenantId),
          isNull(adminFeatureConfigs.deletedAt)
        )
      ),
    db
      .select({ id: adminAiAgentConfigs.id })
      .from(adminAiAgentConfigs)
      .where(
        and(
          eq(adminAiAgentConfigs.tenantId, tenantId),
          isNull(adminAiAgentConfigs.deletedAt)
        )
      ),
    db
      .select({ id: adminApprovalMatrices.id })
      .from(adminApprovalMatrices)
      .where(
        and(
          eq(adminApprovalMatrices.tenantId, tenantId),
          isNull(adminApprovalMatrices.deletedAt)
        )
      ),
    db
      .select({ id: adminIntegrationEndpoints.id })
      .from(adminIntegrationEndpoints)
      .where(
        and(
          eq(adminIntegrationEndpoints.tenantId, tenantId),
          isNull(adminIntegrationEndpoints.deletedAt)
        )
      ),
    db
      .select({ id: adminMasterDataConfigs.id })
      .from(adminMasterDataConfigs)
      .where(
        and(
          eq(adminMasterDataConfigs.tenantId, tenantId),
          isNull(adminMasterDataConfigs.deletedAt)
        )
      ),
    db
      .select({ id: adminAuditLogs.id })
      .from(adminAuditLogs)
      .where(
        and(
          eq(adminAuditLogs.tenantId, tenantId),
          isNull(adminAuditLogs.deletedAt)
        )
      )
      .limit(1),
    db
      .select({ id: adminSystemHealthMetrics.id })
      .from(adminSystemHealthMetrics)
      .where(
        and(
          eq(adminSystemHealthMetrics.tenantId, tenantId),
          isNull(adminSystemHealthMetrics.deletedAt)
        )
      )
      .limit(1),
    db
      .select({ id: adminFeatureFlags.id })
      .from(adminFeatureFlags)
      .where(
        and(
          eq(adminFeatureFlags.tenantId, tenantId),
          isNull(adminFeatureFlags.deletedAt)
        )
      ),
    db
      .select({ id: adminLicenses.id })
      .from(adminLicenses)
      .where(
        and(
          eq(adminLicenses.tenantId, tenantId),
          isNull(adminLicenses.deletedAt)
        )
      ),
    db
      .select({ id: adminImportExportJobs.id })
      .from(adminImportExportJobs)
      .where(
        and(
          eq(adminImportExportJobs.tenantId, tenantId),
          isNull(adminImportExportJobs.deletedAt)
        )
      ),
    db
      .select({ id: adminNotificationConfigs.id })
      .from(adminNotificationConfigs)
      .where(
        and(
          eq(adminNotificationConfigs.tenantId, tenantId),
          isNull(adminNotificationConfigs.deletedAt)
        )
      ),
  ]);

  return {
    moduleConfigs: moduleConfigs.length,
    featureConfigs: featureConfigs.length,
    aiAgentConfigs: aiAgentConfigs.length,
    approvalMatrices: approvalMatrices.length,
    integrationEndpoints: integrationEndpoints.length,
    masterDataConfigs: masterDataConfigs.length,
    auditLogs: auditLogs.length > 0,
    healthMetrics: healthMetrics.length > 0,
    featureFlags: featureFlags.length,
    licenses: licenses.length,
    importExportJobs: importExportJobs.length,
    notificationConfigs: notificationConfigs.length,
  };
}

export async function createAuditLogEntry(
  tenantId: string,
  data: {
    userId?: string;
    userEmail?: string;
    action: string;
    entityType: string;
    entityId?: string;
    module?: string;
    ipAddress?: string;
    userAgent?: string;
    previousData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    severity?: string;
  }
) {
  const [entry] = await db
    .insert(adminAuditLogs)
    .values({ tenantId, ...data })
    .returning();
  return entry;
}
