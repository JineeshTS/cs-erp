import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getDeploymentStatus, deleteDeployment } from "@/lib/admin-portal/aws-deploy-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    if (!(await hasPermission(user.id, user.tenantId, "admin:read"))) {
      return forbiddenResponse();
    }

    const { id } = await params;
    const deployment = await getDeploymentStatus(user.tenantId, id);

    if (!deployment) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Deployment not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: deployment });
  } catch (error) {
    console.error("GET /api/v1/admin/aws-deploy/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
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

    if (!(await hasPermission(user.id, user.tenantId, "admin:create"))) {
      return forbiddenResponse();
    }

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const result = await deleteDeployment(user.tenantId, id);

    if (!result.success) {
      return NextResponse.json(
        { error: { code: "DELETE_FAILED", message: result.error ?? "Failed to tear down deployment" } },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: { message: "Stack deletion initiated" } });
  } catch (error) {
    console.error("DELETE /api/v1/admin/aws-deploy/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
