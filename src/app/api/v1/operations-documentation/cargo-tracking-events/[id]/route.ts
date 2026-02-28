import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { odmCargoTrackingEvents } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateCargoTrackingEventSchema } from "@/lib/operations-documentation/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(odmCargoTrackingEvents).where(and(eq(odmCargoTrackingEvents.id, id), eq(odmCargoTrackingEvents.tenantId, user.tenantId), isNull(odmCargoTrackingEvents.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Cargo tracking event not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get cargo tracking event:", error);
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
    const parsed = updateCargoTrackingEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const [updated] = await db.update(odmCargoTrackingEvents).set({ ...parsed.data }).where(and(eq(odmCargoTrackingEvents.id, id), eq(odmCargoTrackingEvents.tenantId, user.tenantId), isNull(odmCargoTrackingEvents.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Cargo tracking event not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update cargo tracking event:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(odmCargoTrackingEvents).set({ deletedAt: new Date() }).where(and(eq(odmCargoTrackingEvents.id, id), eq(odmCargoTrackingEvents.tenantId, user.tenantId), isNull(odmCargoTrackingEvents.deletedAt))).returning({ id: odmCargoTrackingEvents.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Cargo tracking event not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete cargo tracking event:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
