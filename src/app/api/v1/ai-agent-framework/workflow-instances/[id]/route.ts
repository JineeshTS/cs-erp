import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { aafWorkflowInstances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateWorkflowInstanceSchema } from "@/lib/ai-agent-framework/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ai:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(aafWorkflowInstances)
      .where(and(eq(aafWorkflowInstances.id, id), eq(aafWorkflowInstances.tenantId, user.tenantId), isNull(aafWorkflowInstances.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Workflow instance not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get workflow instance:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "ai:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateWorkflowInstanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const [updated] = await db.update(aafWorkflowInstances).set(parsed.data)
      .where(and(eq(aafWorkflowInstances.id, id), eq(aafWorkflowInstances.tenantId, user.tenantId), isNull(aafWorkflowInstances.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Workflow instance not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update workflow instance:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "ai:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(aafWorkflowInstances).set({ deletedAt: new Date() })
      .where(and(eq(aafWorkflowInstances.id, id), eq(aafWorkflowInstances.tenantId, user.tenantId), isNull(aafWorkflowInstances.deletedAt))).returning({ id: aafWorkflowInstances.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Workflow instance not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete workflow instance:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
