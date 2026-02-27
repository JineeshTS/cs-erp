import { db } from "@/lib/db";
import { authAuditLog } from "@/db/schema";

export type AuditEventType =
  | "login"
  | "logout"
  | "login_failed"
  | "password_reset"
  | "mfa_enrolled"
  | "mfa_verified"
  | "mfa_failed"
  | "account_locked"
  | "token_refreshed"
  | "permission_denied"
  | "user_created"
  | "user_deactivated"
  | "role_assigned";

export async function logAuditEvent(params: {
  tenantId?: string | null;
  userId?: string | null;
  eventType: AuditEventType;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(authAuditLog).values({
      tenantId: params.tenantId ?? null,
      userId: params.userId ?? null,
      eventType: params.eventType,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      metadata: params.metadata ?? {},
    });
  } catch {
    // Audit logging should never break the request flow
    console.error("[audit] Failed to log event:", params.eventType);
  }
}
