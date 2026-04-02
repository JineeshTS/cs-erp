import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import {
  getFlowDefinition,
  updateFlowDefinition,
  deleteFlowDefinition,
} from "@/lib/flow-definitions/service";
import { updateFlowDefinitionSchema } from "@/lib/flow-definitions/validation";
import { formatZodErrors } from "@/lib/validation";

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
    const flow = await getFlowDefinition(user.tenantId, id);
    if (!flow) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Flow definition not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: flow });
  } catch (err) {
    console.error("[flow-definitions/[id]] GET error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get flow definition",
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
    const parsed = updateFlowDefinitionSchema.safeParse(body);
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

    const result = await updateFlowDefinition(user.tenantId, id, parsed.data);
    if (!result) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message:
              "Flow definition not found, not owned by tenant, or is a read-only system template",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("[flow-definitions/[id]] PATCH error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update flow definition",
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
    const deleted = await deleteFlowDefinition(user.tenantId, id);
    if (!deleted) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message:
              "Flow definition not found, not owned by tenant, or is a read-only system template",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (err) {
    console.error("[flow-definitions/[id]] DELETE error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete flow definition",
        },
      },
      { status: 500 }
    );
  }
}
