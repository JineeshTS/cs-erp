import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getMelsOverview } from "@/lib/multi-entity-legal-structure/service";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "entities:read")))
    return forbiddenResponse();

  try {
    const overview = await getMelsOverview(user.tenantId);
    return NextResponse.json({ data: overview });
  } catch (err) {
    console.error("MELS overview error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch overview" } },
      { status: 500 }
    );
  }
}
