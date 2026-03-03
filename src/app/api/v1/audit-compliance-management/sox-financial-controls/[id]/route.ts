import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { acmSoxFinancialControls } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateSoxFinancialControlSchema } from "@/lib/audit-compliance-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "audit:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(acmSoxFinancialControls).where(and(eq(acmSoxFinancialControls.id, id), eq(acmSoxFinancialControls.tenantId, user.tenantId), isNull(acmSoxFinancialControls.deletedAt)));
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "SOX financial control not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get SOX financial control:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "audit:edit"))) return forbiddenResponse();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSoxFinancialControlSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    const [updated] = await db.update(acmSoxFinancialControls).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(acmSoxFinancialControls.id, id), eq(acmSoxFinancialControls.tenantId, user.tenantId), isNull(acmSoxFinancialControls.deletedAt))).returning();
    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "SOX financial control not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update SOX financial control:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "audit:delete"))) return forbiddenResponse();
    const { id } = await params;
    const [deleted] = await db.update(acmSoxFinancialControls).set({ deletedAt: new Date(), updatedAt: new Date() }).where(and(eq(acmSoxFinancialControls.id, id), eq(acmSoxFinancialControls.tenantId, user.tenantId), isNull(acmSoxFinancialControls.deletedAt))).returning({ id: acmSoxFinancialControls.id });
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "SOX financial control not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete SOX financial control:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
