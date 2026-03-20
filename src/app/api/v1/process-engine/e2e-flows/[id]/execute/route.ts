import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getFlowInstance } from "@/lib/process-engine/e2e-flow-service";
import { executeCurrentStep } from "@/lib/process-engine/step-executor";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/v1/process-engine/e2e-flows/[id]/execute
 *
 * Trigger step execution on an active flow.
 * Auto-chains through consecutive AI/system steps until
 * hitting a human gate or flow completion.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    // CSERP-019: Rate limit expensive AI execution (10 per 5 min per user)
    const rl = await checkRateLimit(`execute:${user.id}`, 10, 5 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many execution requests. Try again later." } },
        { status: 429 }
      );
    }

    const { id } = await params;
    const instance = await getFlowInstance(id, user.tenantId);
    if (!instance) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Flow instance not found" } },
        { status: 404 }
      );
    }

    if (instance.status !== "active") {
      return NextResponse.json(
        { error: { code: "INVALID_STATE", message: `Flow is ${instance.status}, cannot execute` } },
        { status: 422 }
      );
    }

    const result = await executeCurrentStep(id, user.tenantId);

    return NextResponse.json({
      data: {
        flowInstanceId: id,
        ...result,
      },
    });
  } catch (err) {
    console.error("[e2e-flows/[id]/execute] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to execute flow step" } },
      { status: 500 }
    );
  }
}
