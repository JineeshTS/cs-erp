import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { vtmComplianceRecords } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateComplianceRecordSchema } from "@/lib/vessel-technical-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "technical:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(vtmComplianceRecords).where(and(eq(vtmComplianceRecords.id, id), eq(vtmComplianceRecords.tenantId, user.tenantId), isNull(vtmComplianceRecords.deletedAt))).limit(1);
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Compliance record not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get compliance record:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "technical:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const parsed = updateComplianceRecordSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    const [updated] = await db.update(vtmComplianceRecords).set(parsed.data).where(and(eq(vtmComplianceRecords.id, id), eq(vtmComplianceRecords.tenantId, user.tenantId), isNull(vtmComplianceRecords.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "compliance-records", entityId: updated?.id, module: "vessel-technical-management", previousData: null, newData: updated as Record<string, unknown>, request });
    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Compliance record not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update compliance record:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "technical:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });
    const { id } = await params;
    const [deleted] = await db.update(vtmComplianceRecords).set({ deletedAt: new Date() }).where(and(eq(vtmComplianceRecords.id, id), eq(vtmComplianceRecords.tenantId, user.tenantId), isNull(vtmComplianceRecords.deletedAt))).returning({ id: vtmComplianceRecords.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "compliance-records", entityId: deleted?.id, module: "vessel-technical-management", previousData: null, request });
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Compliance record not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete compliance record:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
