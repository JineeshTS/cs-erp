import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listTasks, createTask, getTaskStats } from "@/lib/tasks/service";
import { createTaskSchema } from "@/lib/tasks/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "tasks:read")))
      return forbiddenResponse();

    const { searchParams } = new URL(request.url);

    // Special endpoint: ?stats=true returns dashboard counts
    if (searchParams.get("stats") === "true") {
      const stats = await getTaskStats(user.tenantId);
      return NextResponse.json({ data: stats });
    }

    const result = await listTasks({
      tenantId: user.tenantId,
      status: searchParams.get("status") ?? undefined,
      assignedTo: searchParams.get("assignedTo") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit")
        ? Math.min(parseInt(searchParams.get("limit")!, 10), 50)
        : undefined,
    });

    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list tasks:", error);
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

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "tasks:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
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

    const task = await createTask(user.tenantId, user.id, parsed.data);

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "create",
      entityType: "task-instance",
      entityId: task.id,
      module: "tasks",
      newData: task as unknown as Record<string, unknown>,
      request,
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "TaskNotFoundError"
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
    console.error("Failed to create task:", error);
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
