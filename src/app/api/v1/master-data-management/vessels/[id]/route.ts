import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { vessels } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateVesselSchema } from "@/lib/master-data-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "masterdata:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(vessels)
      .where(and(eq(vessels.id, id), eq(vessels.tenantId, user.tenantId), isNull(vessels.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Vessel not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get vessel:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "masterdata:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateVesselSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.dwt !== undefined) updateData.dwt = parsed.data.dwt.toString();
    if (parsed.data.grossTonnage !== undefined) updateData.grossTonnage = parsed.data.grossTonnage.toString();
    if (parsed.data.netTonnage !== undefined) updateData.netTonnage = parsed.data.netTonnage.toString();
    if (parsed.data.loa !== undefined) updateData.loa = parsed.data.loa.toString();
    if (parsed.data.beam !== undefined) updateData.beam = parsed.data.beam.toString();
    if (parsed.data.draft !== undefined) updateData.draft = parsed.data.draft.toString();

    const [updated] = await db.update(vessels).set(updateData)
      .where(and(eq(vessels.id, id), eq(vessels.tenantId, user.tenantId), isNull(vessels.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "vessels", entityId: updated?.id, module: "master-data-management", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Vessel not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update vessel:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "masterdata:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const [deleted] = await db.update(vessels).set({ deletedAt: new Date() })
      .where(and(eq(vessels.id, id), eq(vessels.tenantId, user.tenantId), isNull(vessels.deletedAt))).returning({ id: vessels.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "vessels", entityId: deleted?.id, module: "master-data-management", previousData: null, request });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Vessel not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete vessel:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
