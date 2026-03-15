import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { triggerDeploymentSchema } from "@/lib/admin-portal/validation";
import { triggerDeployment } from "@/lib/admin-portal/aws-deploy-service";
import { formatZodErrors } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    if (!(await hasPermission(user.id, user.tenantId, "admin:create"))) {
      return forbiddenResponse();
    }

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) {
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = triggerDeploymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const result = await triggerDeployment(user.tenantId, user.id, parsed.data);
    if (!result.success) {
      return NextResponse.json(
        { error: { code: "DEPLOYMENT_FAILED", message: result.error ?? "Deployment failed" } },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/admin/aws-deploy error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
