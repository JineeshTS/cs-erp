import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { csoAgentAssignments } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateAgentAssignmentSchema } from "@/lib/customer-service-operations/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "customer_service:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(csoAgentAssignments).where(and(eq(csoAgentAssignments.id, id), eq(csoAgentAssignments.tenantId, user.tenantId), isNull(csoAgentAssignments.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Agent assignment not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get agent assignment:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "customer_service:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateAgentAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const [updated] = await db.update(csoAgentAssignments).set({ ...parsed.data }).where(and(eq(csoAgentAssignments.id, id), eq(csoAgentAssignments.tenantId, user.tenantId), isNull(csoAgentAssignments.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Agent assignment not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update agent assignment:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "customer_service:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(csoAgentAssignments).set({ deletedAt: new Date() }).where(and(eq(csoAgentAssignments.id, id), eq(csoAgentAssignments.tenantId, user.tenantId), isNull(csoAgentAssignments.deletedAt))).returning({ id: csoAgentAssignments.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Agent assignment not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete agent assignment:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
