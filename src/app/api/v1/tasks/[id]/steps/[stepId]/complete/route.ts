import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { completeStep } from "@/lib/tasks/service";
import { completeStepSchema } from "@/lib/tasks/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "tasks:update")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id, stepId } = await params;

    const body = await request.json();
    const parsed = completeStepSchema.safeParse(body);
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

    const result = await completeStep(
      user.tenantId,
      id,
      stepId,
      user.id,
      parsed.data
    );

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "update",
      entityType: "task-step-instance",
      entityId: stepId,
      module: "tasks",
      newData: {
        status: "completed",
        taskCompleted: result.taskCompleted,
        outputData: parsed.data.outputData,
      },
      request,
    });

    return NextResponse.json({
      data: {
        step: result.step,
        taskCompleted: result.taskCompleted,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "StepNotFoundError")
    ) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        },
        { status: 404 }
      );
    }
    if (
      error instanceof Error &&
      error.name === "StepAlreadyCompletedError"
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
    console.error("Failed to complete step:", error);
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
