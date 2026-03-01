import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { pdaVarianceAnalyses } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateVarianceAnalysisSchema } from "@/lib/port-disbursement-accounting/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "disbursement:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(pdaVarianceAnalyses).where(and(eq(pdaVarianceAnalyses.id, id), eq(pdaVarianceAnalyses.tenantId, user.tenantId), isNull(pdaVarianceAnalyses.deletedAt))).limit(1);
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Variance analysis not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get variance analysis:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "disbursement:edit"))) return forbiddenResponse();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateVarianceAnalysisSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    const [updated] = await db.update(pdaVarianceAnalyses).set(parsed.data).where(and(eq(pdaVarianceAnalyses.id, id), eq(pdaVarianceAnalyses.tenantId, user.tenantId), isNull(pdaVarianceAnalyses.deletedAt))).returning();
    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Variance analysis not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update variance analysis:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "disbursement:delete"))) return forbiddenResponse();
    const { id } = await params;
    const [deleted] = await db.update(pdaVarianceAnalyses).set({ deletedAt: new Date() }).where(and(eq(pdaVarianceAnalyses.id, id), eq(pdaVarianceAnalyses.tenantId, user.tenantId), isNull(pdaVarianceAnalyses.deletedAt))).returning({ id: pdaVarianceAnalyses.id });
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Variance analysis not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete variance analysis:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
