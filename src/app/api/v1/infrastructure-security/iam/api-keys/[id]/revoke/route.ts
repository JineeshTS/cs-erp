import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { isfApiKeys } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { revokeApiKeySchema } from "@/lib/infrastructure-security/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;

    const body = await request.json();
    const parsed = revokeApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    // Verify the API key exists
    const [existing] = await db
      .select()
      .from(isfApiKeys)
      .where(
        and(
          eq(isfApiKeys.id, id),
          eq(isfApiKeys.tenantId, user.tenantId),
          isNull(isfApiKeys.deletedAt)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "API key not found" } },
        { status: 404 }
      );
    }

    const [updated] = await db
      .update(isfApiKeys)
      .set({
        status: "revoked",
        revokedAt: new Date(),
        revokedBy: user.id,
        revokeReason: parsed.data.reason,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(isfApiKeys.id, id),
          eq(isfApiKeys.tenantId, user.tenantId)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "revoke", entityId: existing?.id, module: "infrastructure-security", previousData: null, request });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to revoke API key:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
