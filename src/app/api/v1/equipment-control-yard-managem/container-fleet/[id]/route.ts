import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyContainerFleet } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateContainerFleetSchema } from "@/lib/equipment-control-yard-managem/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(eqyContainerFleet).where(and(eq(eqyContainerFleet.id, id), eq(eqyContainerFleet.tenantId, user.tenantId), isNull(eqyContainerFleet.deletedAt))).limit(1);
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Container fleet record not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get container fleet record:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const parsed = updateContainerFleetSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });

    const { lastMovementDate, lastSurveyDate, buildDate, capacityCbm, ...rest } = parsed.data;
    const [updated] = await db.update(eqyContainerFleet).set({
      ...rest,
      ...(lastMovementDate !== undefined && { lastMovementDate: lastMovementDate ? new Date(lastMovementDate) : null }),
      ...(lastSurveyDate !== undefined && { lastSurveyDate: lastSurveyDate ? new Date(lastSurveyDate) : null }),
      ...(buildDate !== undefined && { buildDate: buildDate ? new Date(buildDate) : null }),
      ...(capacityCbm !== undefined && { capacityCbm: capacityCbm !== null ? capacityCbm.toString() : null }),
    }).where(and(eq(eqyContainerFleet.id, id), eq(eqyContainerFleet.tenantId, user.tenantId), isNull(eqyContainerFleet.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "container-fleet", entityId: updated?.id, module: "equipment-control-yard-managem", previousData: null, newData: updated as Record<string, unknown>, request });
    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Container fleet record not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update container fleet record:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });
    const { id } = await params;
    const [deleted] = await db.update(eqyContainerFleet).set({ deletedAt: new Date() }).where(and(eq(eqyContainerFleet.id, id), eq(eqyContainerFleet.tenantId, user.tenantId), isNull(eqyContainerFleet.deletedAt))).returning({ id: eqyContainerFleet.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "container-fleet", entityId: deleted?.id, module: "equipment-control-yard-managem", previousData: null, request });
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Container fleet record not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete container fleet record:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
