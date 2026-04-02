import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getProcessDashboard } from "@/lib/process-engine/service";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const dashboard = await getProcessDashboard(user.tenantId);
    return NextResponse.json({ data: dashboard });
  } catch (err) {
    console.error("[process-engine/dashboard] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to get dashboard" } },
      { status: 500 }
    );
  }
}
