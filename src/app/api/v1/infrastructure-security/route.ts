import { NextRequest, NextResponse } from "next/server";
import { eq, isNull, and, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  isfK8sClusters,
  isfK8sNamespaces,
  isfDeploymentConfigs,
  isfIamPolicies,
  isfServiceAccounts,
  isfApiKeys,
  isfEncryptionKeys,
  isfAuditEvents,
  isfComplianceReports,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:read")))
      return forbiddenResponse();

    const [
      [clusters],
      [namespaces],
      [deployments],
      [policies],
      [svcAccounts],
      [apiKeys],
      [encKeys],
      [auditEvents],
      [compReports],
    ] = await Promise.all([
      db.select({ count: count() }).from(isfK8sClusters).where(and(eq(isfK8sClusters.tenantId, user.tenantId), isNull(isfK8sClusters.deletedAt))),
      db.select({ count: count() }).from(isfK8sNamespaces).where(and(eq(isfK8sNamespaces.tenantId, user.tenantId), isNull(isfK8sNamespaces.deletedAt))),
      db.select({ count: count() }).from(isfDeploymentConfigs).where(and(eq(isfDeploymentConfigs.tenantId, user.tenantId), isNull(isfDeploymentConfigs.deletedAt))),
      db.select({ count: count() }).from(isfIamPolicies).where(and(eq(isfIamPolicies.tenantId, user.tenantId), isNull(isfIamPolicies.deletedAt))),
      db.select({ count: count() }).from(isfServiceAccounts).where(and(eq(isfServiceAccounts.tenantId, user.tenantId), isNull(isfServiceAccounts.deletedAt))),
      db.select({ count: count() }).from(isfApiKeys).where(and(eq(isfApiKeys.tenantId, user.tenantId), isNull(isfApiKeys.deletedAt))),
      db.select({ count: count() }).from(isfEncryptionKeys).where(and(eq(isfEncryptionKeys.tenantId, user.tenantId), isNull(isfEncryptionKeys.deletedAt))),
      db.select({ count: count() }).from(isfAuditEvents).where(and(eq(isfAuditEvents.tenantId, user.tenantId), isNull(isfAuditEvents.deletedAt))),
      db.select({ count: count() }).from(isfComplianceReports).where(and(eq(isfComplianceReports.tenantId, user.tenantId), isNull(isfComplianceReports.deletedAt))),
    ]);

    return NextResponse.json({
      data: {
        clusters: clusters.count,
        namespaces: namespaces.count,
        deployments: deployments.count,
        iamPolicies: policies.count,
        serviceAccounts: svcAccounts.count,
        apiKeys: apiKeys.count,
        encryptionKeys: encKeys.count,
        auditEvents: auditEvents.count,
        complianceReports: compReports.count,
      },
    });
  } catch (error) {
    console.error("Failed to get ISF summary:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
