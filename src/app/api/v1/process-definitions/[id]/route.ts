import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import {
  getProcessDefinition,
  updateProcessDefinition,
  deleteProcessDefinition,
  SystemProcessReadOnlyError,
} from "@/lib/process-definitions/service";
import { updateProcessDefinitionSchema } from "@/lib/process-definitions/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const { id } = await params;
    const process = await getProcessDefinition(user.tenantId, id);
    if (!process) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Process definition not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: process });
  } catch (error) {
    console.error("Failed to get process definition:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;

    const body = await request.json();
    const parsed = updateProcessDefinitionSchema.safeParse(body);
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

    const updated = await updateProcessDefinition(
      user.tenantId,
      id,
      user.id,
      parsed.data
    );
    if (!updated) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Process definition not found",
          },
        },
        { status: 404 }
      );
    }

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "update",
      entityType: "process-definition",
      entityId: updated.id,
      module: "process-definitions",
      newData: updated as unknown as Record<string, unknown>,
      request,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof SystemProcessReadOnlyError) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: error.message,
          },
        },
        { status: 403 }
      );
    }
    console.error("Failed to update process definition:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;

    const deleted = await deleteProcessDefinition(
      user.tenantId,
      id,
      user.id
    );
    if (!deleted) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Process definition not found",
          },
        },
        { status: 404 }
      );
    }

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "delete",
      entityType: "process-definition",
      entityId: deleted.id,
      module: "process-definitions",
      previousData: deleted as unknown as Record<string, unknown>,
      request,
    });

    return NextResponse.json({ data: deleted });
  } catch (error) {
    if (error instanceof SystemProcessReadOnlyError) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: error.message,
          },
        },
        { status: 403 }
      );
    }
    console.error("Failed to delete process definition:", error);
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
