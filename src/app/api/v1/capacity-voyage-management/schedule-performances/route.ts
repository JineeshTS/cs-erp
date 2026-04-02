import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, ilike, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { capSchedulePerformances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createSchedulePerformanceSchema } from "@/lib/capacity-voyage-management/validation";
import { formatZodErrors , escapeIlike } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "capacity:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(capSchedulePerformances.tenantId, user.tenantId),
      isNull(capSchedulePerformances.deletedAt),
    ];
    if (search) conditions.push(ilike(capSchedulePerformances.portName, `%${escapeIlike(search)}%`));
    if (status) conditions.push(eq(capSchedulePerformances.status, status));
    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(capSchedulePerformances.createdAt, capSchedulePerformances.id, parsedCursor));

    const results = await db
      .select()
      .from(capSchedulePerformances)
      .where(and(...conditions))
      .orderBy(desc(capSchedulePerformances.createdAt), desc(capSchedulePerformances.id))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list schedule performances:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "capacity:create"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createSchedulePerformanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { scheduledArrival, actualArrival, scheduledDeparture, actualDeparture, arrivalDelayHours, departureDelayHours, bunkerConsumptionMt, speedKnots, distanceNm, reliabilityScore, periodFrom, periodTo, ...rest } = parsed.data;

    const [created] = await db
      .insert(capSchedulePerformances)
      .values({
        tenantId: user.tenantId,
        ...rest,
        ...(scheduledArrival && { scheduledArrival: new Date(scheduledArrival) }),
        ...(actualArrival && { actualArrival: new Date(actualArrival) }),
        ...(scheduledDeparture && { scheduledDeparture: new Date(scheduledDeparture) }),
        ...(actualDeparture && { actualDeparture: new Date(actualDeparture) }),
        ...(periodFrom && { periodFrom: new Date(periodFrom) }),
        ...(periodTo && { periodTo: new Date(periodTo) }),
        ...(arrivalDelayHours !== undefined && { arrivalDelayHours: arrivalDelayHours.toString() }),
        ...(departureDelayHours !== undefined && { departureDelayHours: departureDelayHours.toString() }),
        ...(bunkerConsumptionMt !== undefined && { bunkerConsumptionMt: bunkerConsumptionMt.toString() }),
        ...(speedKnots !== undefined && { speedKnots: speedKnots.toString() }),
        ...(distanceNm !== undefined && { distanceNm: distanceNm.toString() }),
        ...(reliabilityScore !== undefined && { reliabilityScore: reliabilityScore.toString() }),
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "schedule-performances", entityId: created.id, module: "capacity-voyage-management", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create schedule performance:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
