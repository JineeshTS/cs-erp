import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { aafWorkflowDefinitions } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateWorkflowDefinitionSchema } from "@/lib/ai-agent-framework/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ai:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(aafWorkflowDefinitions)
      .where(and(eq(aafWorkflowDefinitions.id, id), eq(aafWorkflowDefinitions.tenantId, user.tenantId), isNull(aafWorkflowDefinitions.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Workflow definition not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get workflow definition:", error);
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
    const parsed = updateWorkflowDefinitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const [updated] = await db.update(aafWorkflowDefinitions).set(parsed.data)
      .where(and(eq(aafWorkflowDefinitions.id, id), eq(aafWorkflowDefinitions.tenantId, user.tenantId), isNull(aafWorkflowDefinitions.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Workflow definition not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update workflow definition:", error);
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
    const [deleted] = await db.update(aafWorkflowDefinitions).set({ deletedAt: new Date() })
      .where(and(eq(aafWorkflowDefinitions.id, id), eq(aafWorkflowDefinitions.tenantId, user.tenantId), isNull(aafWorkflowDefinitions.deletedAt))).returning({ id: aafWorkflowDefinitions.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Workflow definition not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete workflow definition:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
