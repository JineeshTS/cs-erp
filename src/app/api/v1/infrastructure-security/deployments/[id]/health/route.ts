import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getDeployment } from "@/lib/infrastructure-security/service";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getDeployment(id, user.tenantId);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Deployment not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        status: record.status,
        healthStatus: record.healthStatus,
        replicas: record.replicas,
        lastDeployedAt: record.lastDeployedAt,
      },
    });
  } catch (error) {
    console.error("Failed to get deployment health:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
