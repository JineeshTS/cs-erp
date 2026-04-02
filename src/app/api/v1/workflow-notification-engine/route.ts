import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getWorkflowOverview } from "@/lib/workflow-notification-engine/service";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
    return forbiddenResponse();

  try {
    const overview = await getWorkflowOverview(user.tenantId);
    return NextResponse.json({ data: overview });
  } catch (err) {
    console.error("WNE overview error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch overview" } },
      { status: 500 }
    );
  }
}
