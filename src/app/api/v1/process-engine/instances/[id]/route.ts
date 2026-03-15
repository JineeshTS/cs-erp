import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import {
  getProcessInstanceWithSteps,
  advanceProcessStep,
  failProcessInstance,
} from "@/lib/process-engine/service";
import { advanceStepSchema, failProcessSchema } from "@/lib/process-engine/validation";
import { formatZodErrors } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const { id } = await params;
    const instance = await getProcessInstanceWithSteps(id, user.tenantId);
    if (!instance) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Process instance not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: instance });
  } catch (err) {
    console.error("[process-engine/instances/[id]] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to get process instance" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:edit")))
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
    const action = body.action as string;

    if (action === "advance") {
      const parsed = advanceStepSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
          { status: 422 }
        );
      }

      const updated = await advanceProcessStep(id, user.tenantId, parsed.data.output);
      if (!updated) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Process instance not found or already complete" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: updated });
    }

    if (action === "fail") {
      const parsed = failProcessSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
          { status: 422 }
        );
      }

      const updated = await failProcessInstance(id, user.tenantId, parsed.data.reason);
      if (!updated) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Process instance not found" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: updated });
    }

    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Unknown action. Use 'advance' or 'fail'." } },
      { status: 400 }
    );
  } catch (err) {
    console.error("[process-engine/instances/[id]] PATCH error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update process instance" } },
      { status: 500 }
    );
  }
}
