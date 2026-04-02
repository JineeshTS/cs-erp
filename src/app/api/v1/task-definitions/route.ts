import { NextRequest, NextResponse } from "next/server";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listTaskDefinitions } from "@/lib/tasks/service";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "tasks:read")))
      return forbiddenResponse();

    const { searchParams } = new URL(request.url);

    const result = await listTaskDefinitions({
      tenantId: user.tenantId,
      source: searchParams.get("source") ?? undefined,
      domain: searchParams.get("domain") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit")
        ? Math.min(parseInt(searchParams.get("limit")!, 10), 50)
        : undefined,
    });

    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list task definitions:", error);
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
