import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { pscInventoryStockControls } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateInventoryStockControlSchema } from "@/lib/procurement-supply-chain/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "procurement:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(pscInventoryStockControls).where(and(eq(pscInventoryStockControls.id, id), eq(pscInventoryStockControls.tenantId, user.tenantId), isNull(pscInventoryStockControls.deletedAt)));
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Inventory stock control not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get inventory stock control:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "procurement:edit"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;
    const { id } = await params;
    const body = await request.json();
    const parsed = updateInventoryStockControlSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    const [updated] = await db.update(pscInventoryStockControls).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(pscInventoryStockControls.id, id), eq(pscInventoryStockControls.tenantId, user.tenantId), isNull(pscInventoryStockControls.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Inventory stock control not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "inventory-stock-controls", entityId: updated.id, module: "procurement-supply-chain", previousData: null, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update inventory stock control:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "procurement:delete"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;
    const { id } = await params;
    const [deleted] = await db.update(pscInventoryStockControls).set({ deletedAt: new Date(), updatedAt: new Date() }).where(and(eq(pscInventoryStockControls.id, id), eq(pscInventoryStockControls.tenantId, user.tenantId), isNull(pscInventoryStockControls.deletedAt))).returning({ id: pscInventoryStockControls.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Inventory stock control not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "inventory-stock-controls", entityId: deleted.id, module: "procurement-supply-chain", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete inventory stock control:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
