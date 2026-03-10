import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getGateStatistics } from "@/lib/process-engine/human-gate-manager";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const stats = await getGateStatistics(user.tenantId);
    return NextResponse.json({ data: stats });
  } catch (err) {
    console.error("[human-gates/stats] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to get gate statistics" } },
      { status: 500 }
    );
  }
}
