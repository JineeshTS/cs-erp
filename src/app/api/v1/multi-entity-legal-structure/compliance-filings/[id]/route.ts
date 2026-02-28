import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { melsComplianceFilings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateComplianceFilingSchema } from "@/lib/multi-entity-legal-structure/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "entities:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(melsComplianceFilings)
      .where(and(eq(melsComplianceFilings.id, id), eq(melsComplianceFilings.tenantId, user.tenantId), isNull(melsComplianceFilings.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Compliance filing not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get compliance filing:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "entities:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateComplianceFilingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const { dueDate, filedAt, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (filedAt !== undefined) updateData.filedAt = new Date(filedAt);

    const [updated] = await db.update(melsComplianceFilings).set(updateData)
      .where(and(eq(melsComplianceFilings.id, id), eq(melsComplianceFilings.tenantId, user.tenantId), isNull(melsComplianceFilings.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Compliance filing not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update compliance filing:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "entities:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(melsComplianceFilings).set({ deletedAt: new Date() })
      .where(and(eq(melsComplianceFilings.id, id), eq(melsComplianceFilings.tenantId, user.tenantId), isNull(melsComplianceFilings.deletedAt))).returning({ id: melsComplianceFilings.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Compliance filing not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete compliance filing:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
