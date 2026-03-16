import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users, roles } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { generateSecureToken } from "@/lib/tokens";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

const inviteSchema = z.object({
  email: z.email(),
  displayName: z.string().min(1).max(255),
  roleId: z.string().uuid().optional(),
});

type RouteParams = { params: Promise<{ tenantId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();

  const { tenantId } = await params;
  if (user.tenantId !== tenantId) return forbiddenResponse();

  if (!(await hasPermission(user.id, user.tenantId, "users:create"))) {
    return forbiddenResponse();
  }

  const csrf = request.headers.get("x-csrf-token");
  if (!csrf) {
    return NextResponse.json(
      { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
      { status: 422 }
    );
  }

  const { email, displayName } = parsed.data;
  let { roleId } = parsed.data;

  // If no roleId provided, use the first non-system role for the tenant
  if (!roleId) {
    const [defaultRole] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.tenantId, tenantId), eq(roles.isSystem, false), isNull(roles.deletedAt)))
      .limit(1);
    roleId = defaultRole?.id;
  }

  // Verify role exists (if provided or found)
  if (roleId) {
    const [role] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (!role) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Role not found" } },
        { status: 404 }
      );
    }
  }

  // Check if email already in this tenant
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), eq(users.tenantId, tenantId)))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "User with this email already exists in this organization" } },
      { status: 409 }
    );
  }

  // Create user with temporary password
  const tempPassword = generateSecureToken().slice(0, 16);
  const passwordHash = await hashPassword(tempPassword);

  const [newUser] = await db
    .insert(users)
    .values({
      tenantId,
      email,
      displayName,
      passwordHash,
      roleId: roleId ?? null,
      status: "pending_verification",
      mustChangePassword: true,
    })
    .returning({ id: users.id, email: users.email });

  void logBusinessAudit({
    tenantId: user.tenantId,
    userId: user.id,
    userEmail: user.email,
    action: "create",
    entityType: "invite",
    entityId: newUser.id,
    module: "tenants",
    newData: { email, roleId } as Record<string, unknown>,
    request,
  });

  // TODO: Send actual invite email with temp password instead of logging
  console.log(`[email-stub] Invite sent for ${email}`);

  await logAuditEvent({
    tenantId,
    userId: user.id,
    eventType: "user_created",
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
    metadata: { invitedEmail: email, roleId },
  });

  return NextResponse.json({ data: { id: newUser.id, email: newUser.email } }, { status: 201 });
}
