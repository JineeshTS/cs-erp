import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getDmsOverview } from "@/lib/document-management-system/service";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "documents:read")))
    return forbiddenResponse();

  try {
    const overview = await getDmsOverview(user.tenantId);
    return NextResponse.json({ data: overview });
  } catch (err) {
    console.error("DMS overview error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch overview" } },
      { status: 500 }
    );
  }
}
