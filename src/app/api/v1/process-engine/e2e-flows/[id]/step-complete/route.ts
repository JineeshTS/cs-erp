/**
 * POST /api/v1/process-engine/e2e-flows/[id]/step-complete
 *
 * D-006 Phase 1: Complete a step with entity binding.
 * Binds a real entity (e.g., scm_leads row) to the current step,
 * then advances the flow to the next step.
 *
 * Called by:
 * - Inline step forms on the flow detail page
 * - Module pages (leads/new, opportunities/new) via callback pattern
 * - CRUD entity step executor (Phase 2)
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { stepCompleteSchema } from "@/lib/process-engine/validation";
import { getFlowInstance, advanceFlowStep } from "@/lib/process-engine/e2e-flow-service";
import { createEntityBinding } from "@/lib/process-engine/entity-binding-service";
import { db } from "@/lib/db";
import { peE2eStepInstances } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

    const { id: flowInstanceId } = await params;
    const body = await request.json();
    const parsed = stepCompleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    // Verify flow exists and is active
    const instance = await getFlowInstance(flowInstanceId, user.tenantId);
    if (!instance) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Flow instance not found" } },
        { status: 404 }
      );
    }

    if (instance.status === "completed" || instance.status === "failed" || instance.status === "cancelled") {
      return NextResponse.json(
        { error: { code: "FLOW_FINISHED", message: `Flow is ${instance.status}` } },
        { status: 400 }
      );
    }

    // Verify the step number matches current step
    if (parsed.data.stepNumber !== instance.currentStepNumber) {
      return NextResponse.json(
        {
          error: {
            code: "STEP_MISMATCH",
            message: `Step ${parsed.data.stepNumber} is not the current step (current: ${instance.currentStepNumber})`,
          },
        },
        { status: 400 }
      );
    }

    // Get the step instance
    const [stepInstance] = await db
      .select()
      .from(peE2eStepInstances)
      .where(
        and(
          eq(peE2eStepInstances.flowInstanceId, flowInstanceId),
          eq(peE2eStepInstances.stepNumber, parsed.data.stepNumber),
          eq(peE2eStepInstances.tenantId, user.tenantId)
        )
      )
      .limit(1);

    if (!stepInstance) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Step instance not found" } },
        { status: 404 }
      );
    }

    // Create entity binding
    const binding = await createEntityBinding({
      tenantId: user.tenantId,
      stepInstanceId: stepInstance.id,
      flowInstanceId,
      entityTable: parsed.data.entityTable,
      entityId: parsed.data.entityId,
      entityAction: parsed.data.entityAction,
      entityData: parsed.data.entityData,
    });

    // Advance the flow to the next step
    const advanced = await advanceFlowStep(flowInstanceId, user.tenantId, {
      entityBinding: {
        entityTable: parsed.data.entityTable,
        entityId: parsed.data.entityId,
        entityAction: parsed.data.entityAction,
      },
      completedBy: user.id,
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        data: {
          binding,
          flow: advanced,
          nextStep: advanced ? advanced.currentStepNumber : null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[e2e-flows/[id]/step-complete] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to complete step" } },
      { status: 500 }
    );
  }
}
