import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { pscPurchaseRequisitions } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updatePurchaseRequisitionSchema } from "@/lib/procurement-supply-chain/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "procurement:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(pscPurchaseRequisitions).where(and(eq(pscPurchaseRequisitions.id, id), eq(pscPurchaseRequisitions.tenantId, user.tenantId), isNull(pscPurchaseRequisitions.deletedAt)));
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Purchase requisition not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get purchase requisition:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "procurement:edit"))) return forbiddenResponse();
    const { id } = await params;
    const body = await request.json();
    const parsed = updatePurchaseRequisitionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    const [updated] = await db.update(pscPurchaseRequisitions).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(pscPurchaseRequisitions.id, id), eq(pscPurchaseRequisitions.tenantId, user.tenantId), isNull(pscPurchaseRequisitions.deletedAt))).returning();
    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Purchase requisition not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update purchase requisition:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "procurement:delete"))) return forbiddenResponse();
    const { id } = await params;
    const [deleted] = await db.update(pscPurchaseRequisitions).set({ deletedAt: new Date(), updatedAt: new Date() }).where(and(eq(pscPurchaseRequisitions.id, id), eq(pscPurchaseRequisitions.tenantId, user.tenantId), isNull(pscPurchaseRequisitions.deletedAt))).returning({ id: pscPurchaseRequisitions.id });
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Purchase requisition not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete purchase requisition:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
