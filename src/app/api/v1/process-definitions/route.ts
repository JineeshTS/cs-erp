import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import {
  listProcessDefinitions,
  createProcessDefinition,
  getProcessStats,
} from "@/lib/process-definitions/service";
import { createProcessDefinitionSchema } from "@/lib/process-definitions/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const { searchParams } = new URL(request.url);

    // Special endpoint: ?stats=true returns dashboard counts
    if (searchParams.get("stats") === "true") {
      const stats = await getProcessStats(user.tenantId);
      return NextResponse.json({ data: stats });
    }

    const result = await listProcessDefinitions({
      tenantId: user.tenantId,
      source: searchParams.get("source") ?? undefined,
      domain: searchParams.get("domain") ?? undefined,
      automationLevel: searchParams.get("automationLevel") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit")
        ? Math.min(parseInt(searchParams.get("limit")!, 10), 50)
        : undefined,
    });

    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list process definitions:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createProcessDefinitionSchema.safeParse(body);
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

    const process = await createProcessDefinition(
      user.tenantId,
      user.id,
      parsed.data
    );

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "create",
      entityType: "process-definition",
      entityId: process.id,
      module: "process-definitions",
      newData: process as unknown as Record<string, unknown>,
      request,
    });

    return NextResponse.json({ data: process }, { status: 201 });
  } catch (error) {
    console.error("Failed to create process definition:", error);
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
