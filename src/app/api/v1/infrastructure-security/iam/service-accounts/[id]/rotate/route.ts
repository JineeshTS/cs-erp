import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { isfServiceAccounts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import crypto from "crypto";
import { logBusinessAudit } from "@/lib/business-audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:edit")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;

    // Fetch service account by id
    const [existing] = await db
      .select()
      .from(isfServiceAccounts)
      .where(
        and(
          eq(isfServiceAccounts.id, id),
          eq(isfServiceAccounts.tenantId, user.tenantId),
          isNull(isfServiceAccounts.deletedAt)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Service account not found" } },
        { status: 404 }
      );
    }

    // Generate new credential hash
    const credentialHash = crypto.randomBytes(32).toString("hex");

    const [updated] = await db
      .update(isfServiceAccounts)
      .set({
        credentialHash,
        lastRotatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(isfServiceAccounts.id, id),
          eq(isfServiceAccounts.tenantId, user.tenantId)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "rotate", entityId: existing.id, module: "infrastructure-security", newData: existing as Record<string, unknown>, request });

    // Exclude credentialHash from response
    const { credentialHash: _excluded, ...safeRecord } = updated;

    return NextResponse.json({ data: safeRecord });
  } catch (error) {
    console.error("Failed to rotate service account credentials:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
