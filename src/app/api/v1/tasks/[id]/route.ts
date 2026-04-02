import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getTask, updateTask } from "@/lib/tasks/service";
import { updateTaskSchema } from "@/lib/tasks/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";
import { db } from "@/lib/db";
import { peTaskInstances } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "tasks:read")))
      return forbiddenResponse();

    const { id } = await params;
    const task = await getTask(user.tenantId, id);
    if (!task) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Task not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error("Failed to get task:", error);
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

export async function PATCH(
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

    // Verify exists
    const existing = await getTask(user.tenantId, id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Task not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
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

    const updated = await updateTask(user.tenantId, id, user.id, parsed.data);
    if (!updated) {
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
      entityId: updated.id,
      module: "tasks",
      previousData: existing as unknown as Record<string, unknown>,
      newData: updated as unknown as Record<string, unknown>,
      request,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update task:", error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "tasks:delete")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;

    const existing = await getTask(user.tenantId, id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Task not found" } },
        { status: 404 }
      );
    }

    const [deleted] = await db
      .update(peTaskInstances)
      .set({ deletedAt: new Date(), updatedBy: user.id })
      .where(
        and(
          eq(peTaskInstances.id, id),
          eq(peTaskInstances.tenantId, user.tenantId),
          isNull(peTaskInstances.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "delete",
      entityType: "task-instance",
      entityId: deleted.id,
      module: "tasks",
      previousData: existing as unknown as Record<string, unknown>,
      request,
    });

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete task:", error);
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
