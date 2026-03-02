import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { pamPortAuthorityCommunications } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updatePortAuthorityCommunicationSchema } from "@/lib/port-agency-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "port_agency:read"))) return forbiddenResponse();
    const { id } = await params;
    const [record] = await db.select().from(pamPortAuthorityCommunications).where(and(eq(pamPortAuthorityCommunications.id, id), eq(pamPortAuthorityCommunications.tenantId, user.tenantId), isNull(pamPortAuthorityCommunications.deletedAt)));
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Port authority communication not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get port authority communication:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "port_agency:edit"))) return forbiddenResponse();
    const { id } = await params;
    const body = await request.json();
    const parsed = updatePortAuthorityCommunicationSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    const [updated] = await db.update(pamPortAuthorityCommunications).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(pamPortAuthorityCommunications.id, id), eq(pamPortAuthorityCommunications.tenantId, user.tenantId), isNull(pamPortAuthorityCommunications.deletedAt))).returning();
    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Port authority communication not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update port authority communication:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "port_agency:delete"))) return forbiddenResponse();
    const { id } = await params;
    const [deleted] = await db.update(pamPortAuthorityCommunications).set({ deletedAt: new Date(), updatedAt: new Date() }).where(and(eq(pamPortAuthorityCommunications.id, id), eq(pamPortAuthorityCommunications.tenantId, user.tenantId), isNull(pamPortAuthorityCommunications.deletedAt))).returning({ id: pamPortAuthorityCommunications.id });
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Port authority communication not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete port authority communication:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
