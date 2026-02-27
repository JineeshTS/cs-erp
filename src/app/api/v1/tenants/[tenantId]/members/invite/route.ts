import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users, roles } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { generateSecureToken } from "@/lib/tokens";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request";

const inviteSchema = z.object({
  email: z.email(),
  displayName: z.string().min(1).max(255),
  roleId: z.string().uuid(),
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

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
      { status: 422 }
    );
  }

  const { email, displayName, roleId } = parsed.data;

  // Verify role exists
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
      roleId,
      status: "pending_verification",
      mustChangePassword: true,
    })
    .returning({ id: users.id, email: users.email });

  console.log(`[email-stub] Invite for ${email}, temp password: ${tempPassword}`);

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
