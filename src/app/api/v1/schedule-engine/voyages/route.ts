import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { generatedVoyages, voyagePortCalls } from "@/db/schema/schedule-engine";
import { eq, and, isNull, desc, ilike, asc, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "schedule:read")))
    return forbiddenResponse();

  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  const status = request.nextUrl.searchParams.get("status") || "";
  const templateId = request.nextUrl.searchParams.get("templateId") || "";
  const include = request.nextUrl.searchParams.get("include") || "";

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

  if (include === "portCalls" && rows.length > 0) {
    const voyageIds = rows.map((v) => v.id);
    const portCalls = await db
      .select()
      .from(voyagePortCalls)
      .where(and(
        eq(voyagePortCalls.tenantId, user.tenantId),
        inArray(voyagePortCalls.voyageId, voyageIds),
      ))
      .orderBy(asc(voyagePortCalls.sequence));

    const portCallsByVoyage = new Map<string, typeof portCalls>();
    for (const pc of portCalls) {
      const list = portCallsByVoyage.get(pc.voyageId) ?? [];
      list.push(pc);
      portCallsByVoyage.set(pc.voyageId, list);
    }

    const data = rows.map((v) => ({
      ...v,
      portCalls: portCallsByVoyage.get(v.id) ?? [],
    }));

    return NextResponse.json({ data });
  }

  return NextResponse.json({ data: rows });
}
