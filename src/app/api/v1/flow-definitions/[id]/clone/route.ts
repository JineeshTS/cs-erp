import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { cloneFlowDefinition } from "@/lib/flow-definitions/service";

export async function POST(
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
    const result = await cloneFlowDefinition(user.tenantId, user.id, id);
    if (!result) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Source flow definition not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    console.error("[flow-definitions/[id]/clone] POST error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to clone flow definition",
        },
      },
      { status: 500 }
    );
  }
}
