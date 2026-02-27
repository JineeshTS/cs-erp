import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { vessels } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateVesselSchema } from "@/lib/master-data-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "vessels:read"))) return forbiddenResponse();

  const { id } = await params;
  const [record] = await db.select().from(vessels)
    .where(and(eq(vessels.id, id), eq(vessels.tenantId, user.tenantId), isNull(vessels.deletedAt))).limit(1);

  if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Vessel not found" } }, { status: 404 });
  return NextResponse.json({ data: record });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "vessels:edit"))) return forbiddenResponse();

  const { id } = await params;
  const body = await request.json();
  const parsed = updateVesselSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.dwt !== undefined) updateData.dwt = parsed.data.dwt.toString();
  if (parsed.data.grossTonnage !== undefined) updateData.grossTonnage = parsed.data.grossTonnage.toString();
  if (parsed.data.netTonnage !== undefined) updateData.netTonnage = parsed.data.netTonnage.toString();
  if (parsed.data.loa !== undefined) updateData.loa = parsed.data.loa.toString();
  if (parsed.data.beam !== undefined) updateData.beam = parsed.data.beam.toString();
  if (parsed.data.draft !== undefined) updateData.draft = parsed.data.draft.toString();

  const [updated] = await db.update(vessels).set(updateData)
    .where(and(eq(vessels.id, id), eq(vessels.tenantId, user.tenantId), isNull(vessels.deletedAt))).returning();

  if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Vessel not found" } }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "vessels:delete"))) return forbiddenResponse();

  const { id } = await params;
  const [deleted] = await db.update(vessels).set({ deletedAt: new Date() })
    .where(and(eq(vessels.id, id), eq(vessels.tenantId, user.tenantId), isNull(vessels.deletedAt))).returning({ id: vessels.id });

  if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Vessel not found" } }, { status: 404 });
  return NextResponse.json({ data: { id: deleted.id, deleted: true } });
}
