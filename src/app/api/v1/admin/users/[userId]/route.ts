import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users, roles } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission, invalidatePermissionCache } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ userId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getApiUser(request);
    if (!currentUser) return unauthorizedResponse();

    if (!(await hasPermission(currentUser.id, currentUser.tenantId, "users:read"))) {
      return forbiddenResponse();
    }

    const { userId } = await params;

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
        roleId: users.roleId,
        roleName: roles.name,
        emailVerified: users.emailVerified,
        lastLoginAt: users.lastLoginAt,
        failedLoginAttempts: users.failedLoginAttempts,
        lockedUntil: users.lockedUntil,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(users.id, userId), eq(users.tenantId, currentUser.tenantId)))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("[admin/users/[userId]] GET error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to get user" } },
      { status: 500 }
    );
  }
}

const updateUserSchema = z.object({
  roleId: z.string().uuid().optional(),
  status: z.enum(["active", "inactive", "locked"]).optional(),
  displayName: z.string().min(1).max(255).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getApiUser(request);
    if (!currentUser) return unauthorizedResponse();

    if (!(await hasPermission(currentUser.id, currentUser.tenantId, "users:edit"))) {
      return forbiddenResponse();
    }

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { userId } = await params;
    const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
      { status: 422 }
    );
  }

  if (userId === currentUser.id && parsed.data.status === "inactive") {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Cannot deactivate your own account" } },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(users)
    .set(parsed.data)
    .where(and(eq(users.id, userId), eq(users.tenantId, currentUser.tenantId)))
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      status: users.status,
      roleId: users.roleId,
    });

  if (!updated) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "User not found" } },
      { status: 404 }
    );
  }

  await invalidatePermissionCache(userId, currentUser.tenantId);

  if (parsed.data.status === "inactive") {
    await logAuditEvent({
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      eventType: "user_deactivated",
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
      metadata: { targetUserId: userId },
    });
  }

  if (parsed.data.roleId) {
    await logAuditEvent({
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      eventType: "role_assigned",
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
      metadata: { targetUserId: userId, roleId: parsed.data.roleId },
    });
  }

    void logBusinessAudit({ tenantId: currentUser.tenantId, userId: currentUser.id, userEmail: currentUser.email, action: "update", entityType: "users", entityId: updated.id, module: "admin", previousData: currentUser as unknown as Record<string, unknown>, newData: updated as unknown as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[admin/users/[userId]] PATCH error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update user" } },
      { status: 500 }
    );
  }
}
