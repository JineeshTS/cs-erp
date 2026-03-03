import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { pscProcurementContracts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateProcurementContractSchema } from "@/lib/procurement-supply-chain/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "procurement:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(pscProcurementContracts).where(and(eq(pscProcurementContracts.id, id), eq(pscProcurementContracts.tenantId, user.tenantId), isNull(pscProcurementContracts.deletedAt)));
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Procurement contract not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get procurement contract:", error);
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
    const parsed = updateProcurementContractSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    const [updated] = await db.update(pscProcurementContracts).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(pscProcurementContracts.id, id), eq(pscProcurementContracts.tenantId, user.tenantId), isNull(pscProcurementContracts.deletedAt))).returning();
    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Procurement contract not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update procurement contract:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "procurement:delete"))) return forbiddenResponse();
    const { id } = await params;
    const [deleted] = await db.update(pscProcurementContracts).set({ deletedAt: new Date(), updatedAt: new Date() }).where(and(eq(pscProcurementContracts.id, id), eq(pscProcurementContracts.tenantId, user.tenantId), isNull(pscProcurementContracts.deletedAt))).returning({ id: pscProcurementContracts.id });
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Procurement contract not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete procurement contract:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
