import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getFlowInstance } from "@/lib/process-engine/e2e-flow-service";
import { executeCurrentStep } from "@/lib/process-engine/step-executor";

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

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) {
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
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
