import { db } from "@/lib/db";
import { adminAuditLogs } from "@/db/schema";
import { getClientIp, getUserAgent } from "@/lib/request";
import { NextRequest } from "next/server";

export type BusinessAction = "create" | "update" | "delete" | "approve" | "reject" | "submit" | "cancel";

export async function logBusinessAudit(params: {
  tenantId: string;
  userId?: string | null;
  userEmail?: string | null;
  action: BusinessAction;
  entityType: string;
  entityId?: string | null;
  module?: string | null;
  previousData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  request?: NextRequest | null;
}): Promise<void> {
  try {
    await db.insert(adminAuditLogs).values({
      tenantId: params.tenantId,
      userId: params.userId ?? null,
      userEmail: params.userEmail ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      module: params.module ?? null,
      ipAddress: params.request ? getClientIp(params.request) : null,
      userAgent: params.request ? getUserAgent(params.request) : null,
      previousData: params.previousData ?? null,
      newData: params.newData ?? null,
      severity: params.action === "delete" ? "warning" : "info",
    });
  } catch {
    // Business audit logging should never break the request flow
    console.error("[business-audit] Failed to log:", params.action, params.entityType);
  }
}
