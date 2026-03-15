import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneWorkflowStepInstances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { actionWorkflowStepSchema } from "@/lib/workflow-notification-engine/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

const actionStatusMap: Record<string, string> = {
  approve: "approved",
  reject: "rejected",
  return: "returned",
  escalate: "escalated",
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(wneWorkflowStepInstances)
      .where(
        and(
          eq(wneWorkflowStepInstances.id, id),
          eq(wneWorkflowStepInstances.tenantId, user.tenantId),
          isNull(wneWorkflowStepInstances.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Workflow step instance not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Workflow step instance GET error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch workflow step instance",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:approve")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = actionWorkflowStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: formatZodErrors(parsed.error),
          },
        },
        { status: 422 }
      );
    }

    const newStatus = actionStatusMap[parsed.data.action];

    const [updated] = await db
      .update(wneWorkflowStepInstances)
      .set({
        status: newStatus,
        action: parsed.data.action,
        comment: parsed.data.comment,
        assignedTo: user.id,
        actedAt: new Date(),
      })
      .where(
        and(
          eq(wneWorkflowStepInstances.id, id),
          eq(wneWorkflowStepInstances.tenantId, user.tenantId),
          isNull(wneWorkflowStepInstances.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "workflow-step-instances", entityId: updated?.id, module: "workflow-notification-engine", newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Workflow step instance not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Workflow step instance POST action error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to process workflow step action",
        },
      },
      { status: 500 }
    );
  }
}
