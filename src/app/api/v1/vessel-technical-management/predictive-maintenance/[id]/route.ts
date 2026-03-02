import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { vtmPredictiveMaintenance } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updatePredictiveMaintenanceSchema } from "@/lib/vessel-technical-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "technical:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(vtmPredictiveMaintenance).where(and(eq(vtmPredictiveMaintenance.id, id), eq(vtmPredictiveMaintenance.tenantId, user.tenantId), isNull(vtmPredictiveMaintenance.deletedAt))).limit(1);
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Predictive maintenance not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get predictive maintenance:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "technical:edit"))) return forbiddenResponse();
    const { id } = await params;
    const body = await request.json();
    const parsed = updatePredictiveMaintenanceSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    const [updated] = await db.update(vtmPredictiveMaintenance).set(parsed.data).where(and(eq(vtmPredictiveMaintenance.id, id), eq(vtmPredictiveMaintenance.tenantId, user.tenantId), isNull(vtmPredictiveMaintenance.deletedAt))).returning();
    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Predictive maintenance not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update predictive maintenance:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "technical:delete"))) return forbiddenResponse();
    const { id } = await params;
    const [deleted] = await db.update(vtmPredictiveMaintenance).set({ deletedAt: new Date() }).where(and(eq(vtmPredictiveMaintenance.id, id), eq(vtmPredictiveMaintenance.tenantId, user.tenantId), isNull(vtmPredictiveMaintenance.deletedAt))).returning({ id: vtmPredictiveMaintenance.id });
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Predictive maintenance not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete predictive maintenance:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
