import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { commodities } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateCommoditySchema } from "@/lib/master-data-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "vessels:read"))) return forbiddenResponse();

  const { id } = await params;
  const [record] = await db.select().from(commodities)
    .where(and(eq(commodities.id, id), eq(commodities.tenantId, user.tenantId), isNull(commodities.deletedAt))).limit(1);

  if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Commodity not found" } }, { status: 404 });
  return NextResponse.json({ data: record });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "vessels:edit"))) return forbiddenResponse();

  const { id } = await params;
  const body = await request.json();
  const parsed = updateCommoditySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.dutyRate !== undefined) updateData.dutyRate = parsed.data.dutyRate.toString();

  const [updated] = await db.update(commodities).set(updateData)
    .where(and(eq(commodities.id, id), eq(commodities.tenantId, user.tenantId), isNull(commodities.deletedAt))).returning();

  if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Commodity not found" } }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "vessels:delete"))) return forbiddenResponse();

  const { id } = await params;
  const [deleted] = await db.update(commodities).set({ deletedAt: new Date() })
    .where(and(eq(commodities.id, id), eq(commodities.tenantId, user.tenantId), isNull(commodities.deletedAt))).returning({ id: commodities.id });

  if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Commodity not found" } }, { status: 404 });
  return NextResponse.json({ data: { id: deleted.id, deleted: true } });
}
