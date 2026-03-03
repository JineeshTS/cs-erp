import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { acmRiskRegisters } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateRiskRegisterSchema } from "@/lib/audit-compliance-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "audit:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(acmRiskRegisters).where(and(eq(acmRiskRegisters.id, id), eq(acmRiskRegisters.tenantId, user.tenantId), isNull(acmRiskRegisters.deletedAt)));
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Risk register not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get risk register:", error);
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
    const parsed = updateRiskRegisterSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    const [updated] = await db.update(acmRiskRegisters).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(acmRiskRegisters.id, id), eq(acmRiskRegisters.tenantId, user.tenantId), isNull(acmRiskRegisters.deletedAt))).returning();
    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Risk register not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update risk register:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "audit:delete"))) return forbiddenResponse();
    const { id } = await params;
    const [deleted] = await db.update(acmRiskRegisters).set({ deletedAt: new Date(), updatedAt: new Date() }).where(and(eq(acmRiskRegisters.id, id), eq(acmRiskRegisters.tenantId, user.tenantId), isNull(acmRiskRegisters.deletedAt))).returning({ id: acmRiskRegisters.id });
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Risk register not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete risk register:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
