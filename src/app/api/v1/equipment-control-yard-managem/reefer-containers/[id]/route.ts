import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyReeferContainers } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateReeferContainerSchema } from "@/lib/equipment-control-yard-managem/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(eqyReeferContainers).where(and(eq(eqyReeferContainers.id, id), eq(eqyReeferContainers.tenantId, user.tenantId), isNull(eqyReeferContainers.deletedAt))).limit(1);
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Reefer container not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get reefer container:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:edit"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;
    const { id } = await params;
    const body = await request.json();
    const parsed = updateReeferContainerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });

    const { lastPtiDate, nextPtiDue, setTemperature, minTemperature, maxTemperature, humidity, currentTemperature, ...rest } = parsed.data;
    const [updated] = await db.update(eqyReeferContainers).set({
      ...rest,
      ...(lastPtiDate !== undefined && { lastPtiDate: lastPtiDate ? new Date(lastPtiDate) : null }),
      ...(nextPtiDue !== undefined && { nextPtiDue: nextPtiDue ? new Date(nextPtiDue) : null }),
      ...(setTemperature !== undefined && { setTemperature: setTemperature !== null ? setTemperature.toString() : null }),
      ...(minTemperature !== undefined && { minTemperature: minTemperature !== null ? minTemperature.toString() : null }),
      ...(maxTemperature !== undefined && { maxTemperature: maxTemperature !== null ? maxTemperature.toString() : null }),
      ...(humidity !== undefined && { humidity: humidity !== null ? humidity.toString() : null }),
      ...(currentTemperature !== undefined && { currentTemperature: currentTemperature !== null ? currentTemperature.toString() : null }),
    }).where(and(eq(eqyReeferContainers.id, id), eq(eqyReeferContainers.tenantId, user.tenantId), isNull(eqyReeferContainers.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Reefer container not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "reefer-containers", entityId: updated.id, module: "equipment-control-yard-managem", previousData: null, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update reefer container:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:delete"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;
    const { id } = await params;
    const [deleted] = await db.update(eqyReeferContainers).set({ deletedAt: new Date() }).where(and(eq(eqyReeferContainers.id, id), eq(eqyReeferContainers.tenantId, user.tenantId), isNull(eqyReeferContainers.deletedAt))).returning({ id: eqyReeferContainers.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Reefer container not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "reefer-containers", entityId: deleted.id, module: "equipment-control-yard-managem", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete reefer container:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
