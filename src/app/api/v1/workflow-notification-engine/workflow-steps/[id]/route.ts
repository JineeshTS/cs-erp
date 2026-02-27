import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneWorkflowSteps } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateWorkflowStepSchema } from "@/lib/workflow-notification-engine/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "workflows:read"))) return forbiddenResponse();

  try {
    const { id } = await params;
    const [record] = await db.select().from(wneWorkflowSteps)
      .where(and(
        eq(wneWorkflowSteps.id, id),
        eq(wneWorkflowSteps.tenantId, user.tenantId),
        isNull(wneWorkflowSteps.deletedAt)
      )).limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Workflow step not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Workflow step get error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch workflow step" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "workflows:edit"))) return forbiddenResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateWorkflowStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(wneWorkflowSteps).set(parsed.data)
      .where(and(
        eq(wneWorkflowSteps.id, id),
        eq(wneWorkflowSteps.tenantId, user.tenantId),
        isNull(wneWorkflowSteps.deletedAt)
      )).returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Workflow step not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Workflow step update error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update workflow step" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "workflows:delete"))) return forbiddenResponse();

  try {
    const { id } = await params;
    const [deleted] = await db.update(wneWorkflowSteps).set({ deletedAt: new Date() })
      .where(and(
        eq(wneWorkflowSteps.id, id),
        eq(wneWorkflowSteps.tenantId, user.tenantId),
        isNull(wneWorkflowSteps.deletedAt)
      )).returning({ id: wneWorkflowSteps.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Workflow step not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    console.error("Workflow step delete error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete workflow step" } },
      { status: 500 }
    );
  }
}
