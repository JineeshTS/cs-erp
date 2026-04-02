import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { cloneDefinition } from "@/lib/tasks/service";
import { logBusinessAudit } from "@/lib/business-audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "tasks:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;

    const cloned = await cloneDefinition(user.tenantId, user.id, id);

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "create",
      entityType: "task-definition",
      entityId: cloned.id,
      module: "tasks",
      newData: {
        clonedFromId: id,
        name: cloned.name,
        source: "cloned",
      },
      request,
    });

    return NextResponse.json({ data: cloned }, { status: 201 });
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
    console.error("Failed to clone task definition:", error);
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
