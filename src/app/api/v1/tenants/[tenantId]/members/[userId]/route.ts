import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { invalidatePermissionCache } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ tenantId: string; userId: string }> };

const updateMemberSchema = z.object({
  roleId: z.string().uuid().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
  const currentUser = await getApiUser(request);
  if (!currentUser) return unauthorizedResponse();

  const { tenantId, userId } = await params;
  if (currentUser.tenantId !== tenantId) return forbiddenResponse();

  if (!(await hasPermission(currentUser.id, currentUser.tenantId, "users:edit"))) {
    return forbiddenResponse();
  }

  const csrf = request.headers.get("x-csrf-token");
  if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

  const body = await request.json();
  const parsed = updateMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
      { status: 422 }
    );
  }

  // Prevent self-demotion
  if (userId === currentUser.id && parsed.data.status === "inactive") {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Cannot deactivate your own account" } },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(users)
    .set(parsed.data)
    .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)))
    .returning({ id: users.id, email: users.email, status: users.status, roleId: users.roleId });

    void logBusinessAudit({ tenantId: currentUser.tenantId, userId: currentUser.id, userEmail: currentUser.email, action: "update", entityType: "members", entityId: updated?.id, module: "tenants", previousData: { id: currentUser.id, email: currentUser.email, role: currentUser.role }, newData: updated as Record<string, unknown> ?? null, request });

  if (!updated) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "User not found" } },
      { status: 404 }
    );
  }

  await invalidatePermissionCache(userId, tenantId);

  if (parsed.data.status === "inactive") {
    await logAuditEvent({
      tenantId,
      userId: currentUser.id,
      eventType: "user_deactivated",
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
      metadata: { targetUserId: userId },
    });
  }

  if (parsed.data.roleId) {
    await logAuditEvent({
      tenantId,
      userId: currentUser.id,
      eventType: "role_assigned",
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
      metadata: { targetUserId: userId, roleId: parsed.data.roleId },
    });
  }

  return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[API] PATCH /tenants/:id/members/:userId error:", err);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
  const currentUser = await getApiUser(request);
  if (!currentUser) return unauthorizedResponse();

  const { tenantId, userId } = await params;
  if (currentUser.tenantId !== tenantId) return forbiddenResponse();

  if (!(await hasPermission(currentUser.id, currentUser.tenantId, "users:delete"))) {
    return forbiddenResponse();
  }

  const csrf = request.headers.get("x-csrf-token");
  if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

  if (userId === currentUser.id) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Cannot remove yourself" } },
      { status: 400 }
    );
  }

  // Soft delete via status change
  const [removed] = await db
    .update(users)
    .set({ status: "inactive" })
    .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)))
    .returning({ id: users.id });

    void logBusinessAudit({ tenantId: currentUser.tenantId, userId: currentUser.id, userEmail: currentUser.email, action: "delete", entityType: "members", entityId: removed?.id, module: "tenants", previousData: { id: userId, tenantId }, request });

  if (!removed) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "User not found" } },
      { status: 404 }
    );
  }

  await invalidatePermissionCache(userId, tenantId);

  await logAuditEvent({
    tenantId,
    userId: currentUser.id,
    eventType: "user_deactivated",
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
    metadata: { targetUserId: userId, method: "remove" },
  });

  return NextResponse.json({ data: { id: removed.id, removed: true } });
  } catch (err) {
    console.error("[API] DELETE /tenants/:id/members/:userId error:", err);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
