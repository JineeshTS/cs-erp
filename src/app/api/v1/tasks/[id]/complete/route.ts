import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { completeTask } from "@/lib/tasks/service";
import { logBusinessAudit } from "@/lib/business-audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "tasks:update")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;

    const completed = await completeTask(user.tenantId, id, user.id);
    if (!completed) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Task not found" } },
        { status: 404 }
      );
    }

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "update",
      entityType: "task-instance",
      entityId: completed.id,
      module: "tasks",
      newData: { status: "completed", completedAt: completed.completedAt },
      request,
    });

    return NextResponse.json({ data: completed });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "TaskAlreadyCompletedError"
    ) {
      return NextResponse.json(
        {
          error: {
            code: "CONFLICT",
            message: error.message,
          },
        },
        { status: 409 }
      );
    }
    console.error("Failed to complete task:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
