import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { resolveHumanGate } from "@/lib/process-engine/e2e-flow-service";
import { resumeAfterGate } from "@/lib/process-engine/step-executor";
import { resolveGateSchema } from "@/lib/process-engine/validation";
import { formatZodErrors } from "@/lib/validation";

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
    const body = await request.json();
    const parsed = resolveGateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const gate = await resolveHumanGate(
      id,
      user.tenantId,
      parsed.data.decision,
      user.id,
      parsed.data.decisionData
    );

    if (!gate) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Gate not found or already resolved" } },
        { status: 404 }
      );
    }

    // Resume flow execution after gate resolution
    const execResult = await resumeAfterGate(
      gate.flowInstanceId,
      user.tenantId,
      parsed.data.decision,
      parsed.data.decisionData
    );

    return NextResponse.json({
      data: {
        gate,
        execution: execResult,
      },
    });
  } catch (err) {
    console.error("[human-gates/[id]/resolve] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to resolve gate" } },
      { status: 500 }
    );
  }
}
