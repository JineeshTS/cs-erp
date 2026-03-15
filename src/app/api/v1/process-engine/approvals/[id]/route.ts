import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { decideApproval } from "@/lib/process-engine/service";
import { decideApprovalSchema } from "@/lib/process-engine/validation";
import { eventBus } from "@/lib/events/event-bus";
import { formatZodErrors } from "@/lib/validation";

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
    const parsed = decideApprovalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const approval = await decideApproval(id, user.tenantId, parsed.data.decision, parsed.data.comment);
    if (!approval) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Approval not found" } },
        { status: 404 }
      );
    }

    eventBus.emit({
      type: "APPROVAL_DECIDED",
      tenantId: user.tenantId,
      userId: user.id,
      entityId: approval.id,
      entityType: "approval",
      timestamp: new Date(),
      data: {
        approvalType: "process_approval",
        decidedById: user.id,
        decision: parsed.data.decision,
        referenceId: approval.processInstanceId,
        referenceType: "process_instance",
        comment: parsed.data.comment,
      },
    });

    return NextResponse.json({ data: approval });
  } catch (err) {
    console.error("[process-engine/approvals/[id]] PATCH error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to decide approval" } },
      { status: 500 }
    );
  }
}
