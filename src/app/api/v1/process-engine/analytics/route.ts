import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getFlowAnalytics } from "@/lib/process-engine/analytics-service";

/**
 * GET /api/v1/process-engine/analytics?days=30
 *
 * Get comprehensive flow analytics for the tenant.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const url = new URL(request.url);
    const days = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "30", 10) || 30, 1), 365);

    const analytics = await getFlowAnalytics(user.tenantId, days);
    return NextResponse.json({ data: analytics });
  } catch (err) {
    console.error("[analytics] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to get analytics" } },
      { status: 500 }
    );
  }
}
