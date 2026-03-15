import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listFlowInstances, createFlowInstance, getFlowDashboard } from "@/lib/process-engine/e2e-flow-service";
import { createFlowInstanceSchema } from "@/lib/process-engine/validation";
import { E2E_PROCESS_FLOWS } from "@/data/e2e-process-flows";
import { formatZodErrors } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const url = new URL(request.url);

    // If ?dashboard=true, return aggregate stats
    if (url.searchParams.get("dashboard") === "true") {
      const stats = await getFlowDashboard(user.tenantId);
      return NextResponse.json({ data: stats });
    }

    const result = await listFlowInstances({
      tenantId: user.tenantId,
      status: url.searchParams.get("status") ?? undefined,
      e2eFlowId: url.searchParams.get("e2eFlowId") ?? undefined,
      entityType: url.searchParams.get("entityType") ?? undefined,
      entityId: url.searchParams.get("entityId") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
      limit: Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 50),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[e2e-flows] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to list E2E flow instances" } },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const parsed = createFlowInstanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    // Find flow definition to get steps
    const flowDef = E2E_PROCESS_FLOWS.find((f) => f.id === parsed.data.e2eFlowId);
    if (!flowDef) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Flow ${parsed.data.e2eFlowId} not found` } },
        { status: 404 }
      );
    }

    const instance = await createFlowInstance({
      tenantId: user.tenantId,
      e2eFlowId: parsed.data.e2eFlowId,
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId,
      triggerEvent: parsed.data.triggerEvent,
      parentFlowInstanceId: parsed.data.parentFlowInstanceId,
      metadata: {
        ...parsed.data.metadata,
        flowName: flowDef.name,
        triggeredBy: user.id,
        triggeredAt: new Date().toISOString(),
        triggerSource: "manual",
      },
      steps: flowDef.steps.map((step, idx) => ({
        stepNumber: idx + 1,
        processRef: step.processRef,
        stepName: step.step,
        executorType: step.executorType ?? step.type,
      })),
    });

    return NextResponse.json({ data: instance }, { status: 201 });
  } catch (err) {
    console.error("[e2e-flows] POST error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create E2E flow instance" } },
      { status: 500 }
    );
  }
}
