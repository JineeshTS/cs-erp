import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import {
  listFlowDefinitions,
  createFlowDefinition,
} from "@/lib/flow-definitions/service";
import { createFlowDefinitionSchema } from "@/lib/flow-definitions/validation";
import { formatZodErrors } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const url = new URL(request.url);

    const result = await listFlowDefinitions({
      tenantId: user.tenantId,
      source: url.searchParams.get("source") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
      limit: Math.min(
        parseInt(url.searchParams.get("limit") ?? "50"),
        50
      ),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[flow-definitions] GET error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to list flow definitions",
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
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createFlowDefinitionSchema.safeParse(body);
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

    const result = await createFlowDefinition(
      user.tenantId,
      user.id,
      parsed.data
    );

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    console.error("[flow-definitions] POST error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create flow definition",
        },
      },
      { status: 500 }
    );
  }
}
