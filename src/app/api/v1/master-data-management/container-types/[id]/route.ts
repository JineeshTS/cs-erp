import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { containerTypes } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateContainerTypeSchema } from "@/lib/master-data-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "masterdata:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(containerTypes)
      .where(and(eq(containerTypes.id, id), eq(containerTypes.tenantId, user.tenantId), isNull(containerTypes.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Container type not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get container type:", error);
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
    const parsed = updateContainerTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.lengthFt !== undefined) updateData.lengthFt = parsed.data.lengthFt.toString();
    if (parsed.data.widthFt !== undefined) updateData.widthFt = parsed.data.widthFt.toString();
    if (parsed.data.heightFt !== undefined) updateData.heightFt = parsed.data.heightFt.toString();
    if (parsed.data.tareWeightKg !== undefined) updateData.tareWeightKg = parsed.data.tareWeightKg.toString();
    if (parsed.data.maxPayloadKg !== undefined) updateData.maxPayloadKg = parsed.data.maxPayloadKg.toString();
    if (parsed.data.cubicCapacityCbm !== undefined) updateData.cubicCapacityCbm = parsed.data.cubicCapacityCbm.toString();

    const [updated] = await db.update(containerTypes).set(updateData)
      .where(and(eq(containerTypes.id, id), eq(containerTypes.tenantId, user.tenantId), isNull(containerTypes.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "container-types", entityId: updated?.id, module: "master-data-management", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Container type not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update container type:", error);
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
    const [deleted] = await db.update(containerTypes).set({ deletedAt: new Date() })
      .where(and(eq(containerTypes.id, id), eq(containerTypes.tenantId, user.tenantId), isNull(containerTypes.deletedAt))).returning({ id: containerTypes.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "container-types", entityId: deleted?.id, module: "master-data-management", previousData: null, request });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Container type not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete container type:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
