import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminFeatureFlags } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateFeatureFlagSchema } from "@/lib/admin-portal/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(adminFeatureFlags)
      .where(and(eq(adminFeatureFlags.id, id), eq(adminFeatureFlags.tenantId, user.tenantId), isNull(adminFeatureFlags.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Feature flag not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get feature flag:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateFeatureFlagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    const { expiresAt, ...restData } = parsed.data;
    const updateData: Record<string, unknown> = {
      ...restData,
      ...(expiresAt !== undefined ? { expiresAt: new Date(expiresAt) } : {}),
    };

    const [updated] = await db.update(adminFeatureFlags).set(updateData)
      .where(and(eq(adminFeatureFlags.id, id), eq(adminFeatureFlags.tenantId, user.tenantId), isNull(adminFeatureFlags.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "feature-flags", entityId: updated?.id, module: "admin-portal", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Feature flag not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update feature flag:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const [deleted] = await db.update(adminFeatureFlags).set({ deletedAt: new Date() })
      .where(and(eq(adminFeatureFlags.id, id), eq(adminFeatureFlags.tenantId, user.tenantId), isNull(adminFeatureFlags.deletedAt))).returning({ id: adminFeatureFlags.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "feature-flags", entityId: deleted?.id, module: "admin-portal", previousData: null, request });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Feature flag not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete feature flag:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
