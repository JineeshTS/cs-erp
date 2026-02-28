import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { odmShippingInstructions } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateShippingInstructionSchema } from "@/lib/operations-documentation/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(odmShippingInstructions).where(and(eq(odmShippingInstructions.id, id), eq(odmShippingInstructions.tenantId, user.tenantId), isNull(odmShippingInstructions.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Shipping instruction not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get shipping instruction:", error);
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
    const parsed = updateShippingInstructionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const [updated] = await db.update(odmShippingInstructions).set({ ...parsed.data }).where(and(eq(odmShippingInstructions.id, id), eq(odmShippingInstructions.tenantId, user.tenantId), isNull(odmShippingInstructions.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Shipping instruction not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update shipping instruction:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(odmShippingInstructions).set({ deletedAt: new Date() }).where(and(eq(odmShippingInstructions.id, id), eq(odmShippingInstructions.tenantId, user.tenantId), isNull(odmShippingInstructions.deletedAt))).returning({ id: odmShippingInstructions.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Shipping instruction not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete shipping instruction:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
