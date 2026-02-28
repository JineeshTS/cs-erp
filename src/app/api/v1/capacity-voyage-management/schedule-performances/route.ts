import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { capSchedulePerformances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createSchedulePerformanceSchema } from "@/lib/capacity-voyage-management/validation";

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
    if (search) conditions.push(ilike(capSchedulePerformances.portName, `%${search}%`));
    if (status) conditions.push(eq(capSchedulePerformances.status, status));
    if (cursor) conditions.push(gt(capSchedulePerformances.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(capSchedulePerformances)
      .where(and(...conditions))
      .orderBy(desc(capSchedulePerformances.createdAt))
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

    const body = await request.json();
    const parsed = createSchedulePerformanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
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

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create schedule performance:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
