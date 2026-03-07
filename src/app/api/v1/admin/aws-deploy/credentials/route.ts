import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { saveAwsCredentialsSchema } from "@/lib/admin-portal/validation";
import { saveCredentials, getCredentialStatus } from "@/lib/admin-portal/aws-deploy-service";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    if (!(await hasPermission(user.id, user.tenantId, "admin:read"))) {
      return forbiddenResponse();
    }

    const credentials = await getCredentialStatus(user.tenantId);
    return NextResponse.json({ data: credentials });
  } catch (error) {
    console.error("GET /api/v1/admin/aws-deploy/credentials error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

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
    const parsed = saveAwsCredentialsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const result = await saveCredentials(user.tenantId, parsed.data);
    if (!result.success) {
      return NextResponse.json(
        { error: { code: "AWS_VALIDATION_FAILED", message: result.error ?? "Credential validation failed" } },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/admin/aws-deploy/credentials error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
