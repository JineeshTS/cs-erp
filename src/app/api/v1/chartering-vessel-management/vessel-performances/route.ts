import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmVesselPerformances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createVesselPerformanceSchema } from "@/lib/chartering-vessel-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const reportType = url.searchParams.get("reportType") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(cvmVesselPerformances.tenantId, user.tenantId),
      isNull(cvmVesselPerformances.deletedAt),
    ];
    if (search) conditions.push(ilike(cvmVesselPerformances.vesselName, `%${search}%`));
    if (reportType) conditions.push(eq(cvmVesselPerformances.reportType, reportType));
    if (cursor) conditions.push(gt(cvmVesselPerformances.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(cvmVesselPerformances)
      .where(and(...conditions))
      .orderBy(desc(cvmVesselPerformances.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list vessel performances:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createVesselPerformanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const {
      reportDate,
      latitude,
      longitude,
      speedKnots,
      consumptionMt,
      distanceNm,
      slipPercent,
      ...rest
    } = parsed.data;

    const [created] = await db
      .insert(cvmVesselPerformances)
      .values({
        tenantId: user.tenantId,
        ...rest,
        reportDate: new Date(reportDate),
        ...(latitude !== undefined && { latitude: latitude.toString() }),
        ...(longitude !== undefined && { longitude: longitude.toString() }),
        ...(speedKnots !== undefined && { speedKnots: speedKnots.toString() }),
        ...(consumptionMt !== undefined && { consumptionMt: consumptionMt.toString() }),
        ...(distanceNm !== undefined && { distanceNm: distanceNm.toString() }),
        ...(slipPercent !== undefined && { slipPercent: slipPercent.toString() }),
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "vessel-performances", entityId: created?.id, module: "chartering-vessel-management", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create vessel performance:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
