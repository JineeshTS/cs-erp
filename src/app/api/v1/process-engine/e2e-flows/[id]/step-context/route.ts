/**
 * GET /api/v1/process-engine/e2e-flows/[id]/step-context?step=N
 *
 * D-006 Phase 1: Get input context for a step.
 * Resolves input data from prior step entity bindings so that:
 * - Inline step forms can pre-fill fields
 * - Module pages know what data to expect
 * - AI-with-tools executors have real entity context
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { stepContextQuerySchema } from "@/lib/process-engine/validation";
import { resolveStepContext, getFlowEntities } from "@/lib/process-engine/flow-context-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const { id: flowInstanceId } = await params;
    const url = new URL(request.url);

    const queryParsed = stepContextQuerySchema.safeParse({
      step: url.searchParams.get("step"),
    });

    if (!queryParsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing or invalid ?step= parameter", details: queryParsed.error } },
        { status: 422 }
      );
    }

    const stepNumber = queryParsed.data.step;
    const context = await resolveStepContext(flowInstanceId, user.tenantId, stepNumber);

    if (!context) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Flow instance not found or step number out of range" } },
        { status: 404 }
      );
    }

    // Also include all entities produced by this flow so far
    const flowEntities = await getFlowEntities(flowInstanceId, user.tenantId);

    return NextResponse.json({
      data: {
        stepNumber: context.stepNumber,
        stepName: context.stepDef.step,
        module: context.stepDef.module,
        inputFields: context.stepDef.inputFields ?? [],
        resolvedInputs: context.resolvedInputs,
        unresolvedFields: context.unresolvedFields,
        priorBindings: context.priorBindings,
        entitySnapshots: context.entitySnapshots,
        flowEntities,
      },
    });
  } catch (err) {
    console.error("[e2e-flows/[id]/step-context] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to resolve step context" } },
      { status: 500 }
    );
  }
}
