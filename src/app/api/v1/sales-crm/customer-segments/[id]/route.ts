import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmCustomerSegments } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateCustomerSegmentSchema } from "@/lib/sales-crm/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(scmCustomerSegments).where(and(eq(scmCustomerSegments.id, id), eq(scmCustomerSegments.tenantId, user.tenantId), isNull(scmCustomerSegments.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Customer segment not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get customer segment:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:edit"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCustomerSegmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    const [updated] = await db.update(scmCustomerSegments).set({ ...parsed.data }).where(and(eq(scmCustomerSegments.id, id), eq(scmCustomerSegments.tenantId, user.tenantId), isNull(scmCustomerSegments.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Customer segment not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "customer-segments", entityId: updated.id, module: "sales-crm", previousData: null, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update customer segment:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:delete"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const [deleted] = await db.update(scmCustomerSegments).set({ deletedAt: new Date() }).where(and(eq(scmCustomerSegments.id, id), eq(scmCustomerSegments.tenantId, user.tenantId), isNull(scmCustomerSegments.deletedAt))).returning({ id: scmCustomerSegments.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Customer segment not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "customer-segments", entityId: deleted.id, module: "sales-crm", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete customer segment:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
