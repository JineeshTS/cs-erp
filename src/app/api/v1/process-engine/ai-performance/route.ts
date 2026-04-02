import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getAiPerformanceMetrics } from "@/lib/process-engine/ai-performance-service";

/**
 * GET /api/v1/process-engine/ai-performance?days=30
 *
 * Get AI execution performance metrics.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const url = new URL(request.url);
    const days = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "30", 10) || 30, 1), 365);

    const metrics = await getAiPerformanceMetrics(user.tenantId, days);
    return NextResponse.json({ data: metrics });
  } catch (err) {
    console.error("[ai-performance] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to get AI performance metrics" } },
      { status: 500 }
    );
  }
}
