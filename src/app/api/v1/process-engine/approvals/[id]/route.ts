import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { decideApproval, listPendingApprovals } from "@/lib/process-engine/service";
import { decideApprovalSchema } from "@/lib/process-engine/validation";

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
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
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

    return NextResponse.json({ data: approval });
  } catch (err) {
    console.error("[process-engine/approvals/[id]] PATCH error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to decide approval" } },
      { status: 500 }
    );
  }
}
