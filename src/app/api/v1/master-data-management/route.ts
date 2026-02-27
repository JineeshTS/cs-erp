import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getMdmOverview } from "@/lib/master-data-management/service";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();

  if (!(await hasPermission(user.id, user.tenantId, "vessels:read"))) {
    return forbiddenResponse();
  }

  const overview = await getMdmOverview(user.tenantId);
  return NextResponse.json({ data: overview });
}
