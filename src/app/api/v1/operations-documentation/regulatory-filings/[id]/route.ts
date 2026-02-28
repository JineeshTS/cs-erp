import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { odmRegulatoryFilings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateRegulatoryFilingSchema } from "@/lib/operations-documentation/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(odmRegulatoryFilings).where(and(eq(odmRegulatoryFilings.id, id), eq(odmRegulatoryFilings.tenantId, user.tenantId), isNull(odmRegulatoryFilings.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Regulatory filing not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get regulatory filing:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateRegulatoryFilingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const [updated] = await db.update(odmRegulatoryFilings).set({ ...parsed.data }).where(and(eq(odmRegulatoryFilings.id, id), eq(odmRegulatoryFilings.tenantId, user.tenantId), isNull(odmRegulatoryFilings.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Regulatory filing not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update regulatory filing:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(odmRegulatoryFilings).set({ deletedAt: new Date() }).where(and(eq(odmRegulatoryFilings.id, id), eq(odmRegulatoryFilings.tenantId, user.tenantId), isNull(odmRegulatoryFilings.deletedAt))).returning({ id: odmRegulatoryFilings.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Regulatory filing not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete regulatory filing:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
