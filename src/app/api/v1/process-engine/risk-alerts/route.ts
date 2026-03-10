import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { scanForRisks, notifyRiskAlerts } from "@/lib/process-engine/risk-alert-service";

/**
 * GET /api/v1/process-engine/risk-alerts
 *
 * Scan for proactive risk alerts across active flows.
 * Returns alerts sorted by severity.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const result = await scanForRisks(user.tenantId);
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("[risk-alerts] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to scan for risks" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/process-engine/risk-alerts
 *
 * Run risk scan AND create notifications for critical/high alerts.
 * Intended to be called by a cron job every 15 minutes.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) {
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );
    }

    const result = await scanForRisks(user.tenantId);
    const notified = await notifyRiskAlerts(user.tenantId, result.alerts);

    return NextResponse.json({
      data: { ...result, notificationsSent: notified },
    });
  } catch (err) {
    console.error("[risk-alerts] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to run risk scan" } },
      { status: 500 }
    );
  }
}
