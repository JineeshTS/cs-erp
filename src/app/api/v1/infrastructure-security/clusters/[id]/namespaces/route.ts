import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listNamespaces } from "@/lib/infrastructure-security/service";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:read")))
      return forbiddenResponse();

    const { id: clusterId } = await params;
    const search = request.nextUrl.searchParams.get("search") || undefined;
    const status = request.nextUrl.searchParams.get("status") || undefined;
    const cursor = request.nextUrl.searchParams.get("cursor") || undefined;

    const result = await listNamespaces(
      { tenantId: user.tenantId, search, status, cursor },
      clusterId
    );

    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list namespaces for cluster:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
