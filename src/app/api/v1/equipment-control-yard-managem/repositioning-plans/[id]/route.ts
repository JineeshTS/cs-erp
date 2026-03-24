import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyRepositioningPlans } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateRepositioningPlanSchema } from "@/lib/equipment-control-yard-managem/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(eqyRepositioningPlans).where(and(eq(eqyRepositioningPlans.id, id), eq(eqyRepositioningPlans.tenantId, user.tenantId), isNull(eqyRepositioningPlans.deletedAt))).limit(1);
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Repositioning plan not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get repositioning plan:", error);
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
    const parsed = updateRepositioningPlanSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });

    const { scheduledDate, completedDate, ...rest } = parsed.data;
    const [updated] = await db.update(eqyRepositioningPlans).set({
      ...rest,
      ...(scheduledDate !== undefined && { scheduledDate: scheduledDate ? new Date(scheduledDate) : null }),
      ...(completedDate !== undefined && { completedDate: completedDate ? new Date(completedDate) : null }),
    }).where(and(eq(eqyRepositioningPlans.id, id), eq(eqyRepositioningPlans.tenantId, user.tenantId), isNull(eqyRepositioningPlans.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Repositioning plan not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "repositioning-plans", entityId: updated.id, module: "equipment-control-yard-managem", previousData: null, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update repositioning plan:", error);
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
    const [deleted] = await db.update(eqyRepositioningPlans).set({ deletedAt: new Date() }).where(and(eq(eqyRepositioningPlans.id, id), eq(eqyRepositioningPlans.tenantId, user.tenantId), isNull(eqyRepositioningPlans.deletedAt))).returning({ id: eqyRepositioningPlans.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Repositioning plan not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "repositioning-plans", entityId: deleted.id, module: "equipment-control-yard-managem", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete repositioning plan:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
