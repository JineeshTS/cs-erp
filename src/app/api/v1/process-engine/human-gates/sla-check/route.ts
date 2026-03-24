import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { checkGateSlas } from "@/lib/process-engine/human-gate-manager";

/**
 * POST /api/v1/process-engine/human-gates/sla-check
 *
 * Trigger SLA check for all pending gates.
 * Sends warnings, detects breaches, escalates overdue gates,
 * and auto-approves low-risk gates.
 *
 * Intended to be called by a cron job every 5 minutes.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const result = await checkGateSlas(user.tenantId);
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("[human-gates/sla-check] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to run SLA check" } },
      { status: 500 }
    );
  }
}
