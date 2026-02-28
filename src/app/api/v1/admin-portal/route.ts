import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getAdminOverview } from "@/lib/admin-portal/service";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "admin:read")))
    return forbiddenResponse();

  try {
    const overview = await getAdminOverview(user.tenantId);
    return NextResponse.json({ data: overview });
  } catch (err) {
    console.error("Admin overview error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch overview" } },
      { status: 500 }
    );
  }
}
