import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ielIntegrationConnections,
  ielEdiMessages,
  ielOracleSyncJobs,
  ielCustomsFilings,
  ielPortConnectMessages,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "integration:read")))
      return forbiddenResponse();

    const [
      activeConnections,
      pendingEdi,
      runningSyncJobs,
      pendingFilings,
      pendingPortMessages,
    ] = await Promise.all([
      db.select({ value: count() }).from(ielIntegrationConnections)
        .where(and(eq(ielIntegrationConnections.tenantId, user.tenantId), isNull(ielIntegrationConnections.deletedAt), eq(ielIntegrationConnections.status, "active")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ielEdiMessages)
        .where(and(eq(ielEdiMessages.tenantId, user.tenantId), isNull(ielEdiMessages.deletedAt), eq(ielEdiMessages.status, "received")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ielOracleSyncJobs)
        .where(and(eq(ielOracleSyncJobs.tenantId, user.tenantId), isNull(ielOracleSyncJobs.deletedAt), eq(ielOracleSyncJobs.status, "running")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ielCustomsFilings)
        .where(and(eq(ielCustomsFilings.tenantId, user.tenantId), isNull(ielCustomsFilings.deletedAt), eq(ielCustomsFilings.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(ielPortConnectMessages)
        .where(and(eq(ielPortConnectMessages.tenantId, user.tenantId), isNull(ielPortConnectMessages.deletedAt), eq(ielPortConnectMessages.status, "pending")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        activeConnections,
        pendingEdi,
        runningSyncJobs,
        pendingFilings,
        pendingPortMessages,
      },
    });
  } catch (error) {
    console.error("Failed to get integration hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
