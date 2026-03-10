import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getFlowInstance } from "@/lib/process-engine/e2e-flow-service";
import { aiAssistStep, acceptAiAssist, rejectAiAssist } from "@/lib/process-engine/step-executor";
import { aiAssistSchema } from "@/lib/process-engine/validation";

/**
 * POST /api/v1/process-engine/e2e-flows/[id]/ai-assist
 *
 * AI Assist — run AI agent on any step of a flow instance.
 *
 * Actions:
 *   generate — Run AI on the current step, store result for review (does NOT advance)
 *   accept   — Accept AI output (optionally edited), complete step, resume flow
 *   reject   — Clear AI assist result, keep step in current status
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
    const body = await request.json();
    const parsed = aiAssistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { action, stepNumber, editedOutput, gateDecision } = parsed.data;

    // Verify flow exists
    const instance = await getFlowInstance(id, user.tenantId);
    if (!instance) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Flow instance not found" } },
        { status: 404 }
      );
    }

    if (action === "generate") {
      const result = await aiAssistStep(id, user.tenantId, stepNumber);
      if (result.status === "error") {
        return NextResponse.json(
          { error: { code: "AI_ASSIST_ERROR", message: result.error ?? "Failed to generate AI assist" } },
          { status: 422 }
        );
      }
      return NextResponse.json({
        data: {
          flowInstanceId: id,
          stepNumber,
          action: "generate",
          aiResult: result.result,
        },
      });
    }

    if (action === "accept") {
      const result = await acceptAiAssist(
        id,
        user.tenantId,
        stepNumber,
        user.id,
        editedOutput,
        gateDecision
      );
      return NextResponse.json({
        data: {
          flowInstanceId: id,
          stepNumber,
          action: "accept",
          execution: result,
        },
      });
    }

    if (action === "reject") {
      const result = await rejectAiAssist(id, user.tenantId, stepNumber);
      return NextResponse.json({
        data: {
          flowInstanceId: id,
          stepNumber,
          action: "reject",
          ...result,
        },
      });
    }

    return NextResponse.json(
      { error: { code: "INVALID_ACTION", message: `Unknown action: ${action}` } },
      { status: 400 }
    );
  } catch (err) {
    console.error("[e2e-flows/[id]/ai-assist] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "AI assist operation failed" } },
      { status: 500 }
    );
  }
}
