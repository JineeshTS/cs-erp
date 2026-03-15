import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isfServiceAccounts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createServiceAccountSchema } from "@/lib/infrastructure-security/validation";
import crypto from "crypto";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:create")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createServiceAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const credentialHash = crypto.randomBytes(32).toString("hex");

    const [created] = await db
      .insert(isfServiceAccounts)
      .values({
        tenantId: user.tenantId,
        ...parsed.data,
        credentialHash,
        lastRotatedAt: new Date(),
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "service-accounts", entityId: created?.id, module: "infrastructure-security", newData: created as Record<string, unknown>, request });

    // Exclude credentialHash from response
    const { credentialHash: _excluded, ...safeRecord } = created;

    return NextResponse.json({ data: safeRecord }, { status: 201 });
  } catch (error) {
    console.error("Failed to create service account:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
