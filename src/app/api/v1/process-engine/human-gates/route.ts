import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listPendingGates } from "@/lib/process-engine/e2e-flow-service";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const url = new URL(request.url);
    const myOnly = url.searchParams.get("myOnly") === "true";
    const data = await listPendingGates(
      user.tenantId,
      myOnly ? user.id : undefined
    );

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[human-gates] GET error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to list pending gates" } },
      { status: 500 }
    );
  }
}
