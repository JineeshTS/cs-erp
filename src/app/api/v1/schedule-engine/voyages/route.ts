import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { generatedVoyages } from "@/db/schema/schedule-engine";
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "schedule:read")))
    return forbiddenResponse();

  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  const status = request.nextUrl.searchParams.get("status") || "";
  const templateId = request.nextUrl.searchParams.get("templateId") || "";

  const rows = await db
    .select()
    .from(generatedVoyages)
    .where(and(
      eq(generatedVoyages.tenantId, user.tenantId),
      isNull(generatedVoyages.deletedAt),
      q ? ilike(generatedVoyages.voyageNumber, `%${q}%`) : undefined,
      status ? eq(generatedVoyages.status, status) : undefined,
      templateId ? eq(generatedVoyages.templateId, templateId) : undefined,
    ))
    .orderBy(desc(generatedVoyages.startDate))
    .limit(50);

  return NextResponse.json({ data: rows });
}
