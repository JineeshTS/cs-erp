import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { costCentres } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateCostCentreSchema } from "@/lib/master-data-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "finance:read"))) return forbiddenResponse();

  const { id } = await params;
  const [record] = await db.select().from(costCentres)
    .where(and(eq(costCentres.id, id), eq(costCentres.tenantId, user.tenantId), isNull(costCentres.deletedAt))).limit(1);

  if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Cost centre not found" } }, { status: 404 });
  return NextResponse.json({ data: record });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "finance:approve"))) return forbiddenResponse();

  const { id } = await params;
  const body = await request.json();
  const parsed = updateCostCentreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
  }

  const [updated] = await db.update(costCentres).set(parsed.data)
    .where(and(eq(costCentres.id, id), eq(costCentres.tenantId, user.tenantId), isNull(costCentres.deletedAt))).returning();

  if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Cost centre not found" } }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "finance:approve"))) return forbiddenResponse();

  const { id } = await params;
  const [deleted] = await db.update(costCentres).set({ deletedAt: new Date() })
    .where(and(eq(costCentres.id, id), eq(costCentres.tenantId, user.tenantId), isNull(costCentres.deletedAt))).returning({ id: costCentres.id });

  if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Cost centre not found" } }, { status: 404 });
  return NextResponse.json({ data: { id: deleted.id, deleted: true } });
}
