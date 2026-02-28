import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { capSchedulePerformances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateSchedulePerformanceSchema } from "@/lib/capacity-voyage-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "capacity:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(capSchedulePerformances)
      .where(
        and(
          eq(capSchedulePerformances.id, id),
          eq(capSchedulePerformances.tenantId, user.tenantId),
          isNull(capSchedulePerformances.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Schedule performance not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get schedule performance:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "capacity:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchedulePerformanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { scheduledArrival, actualArrival, scheduledDeparture, actualDeparture, arrivalDelayHours, departureDelayHours, bunkerConsumptionMt, speedKnots, distanceNm, reliabilityScore, periodFrom, periodTo, ...rest } = parsed.data;

    const [updated] = await db
      .update(capSchedulePerformances)
      .set({
        ...rest,
        ...(scheduledArrival !== undefined && { scheduledArrival: scheduledArrival ? new Date(scheduledArrival) : null }),
        ...(actualArrival !== undefined && { actualArrival: actualArrival ? new Date(actualArrival) : null }),
        ...(scheduledDeparture !== undefined && { scheduledDeparture: scheduledDeparture ? new Date(scheduledDeparture) : null }),
        ...(actualDeparture !== undefined && { actualDeparture: actualDeparture ? new Date(actualDeparture) : null }),
        ...(periodFrom !== undefined && { periodFrom: periodFrom ? new Date(periodFrom) : null }),
        ...(periodTo !== undefined && { periodTo: periodTo ? new Date(periodTo) : null }),
        ...(arrivalDelayHours !== undefined && { arrivalDelayHours: arrivalDelayHours !== undefined ? arrivalDelayHours.toString() : null }),
        ...(departureDelayHours !== undefined && { departureDelayHours: departureDelayHours !== undefined ? departureDelayHours.toString() : null }),
        ...(bunkerConsumptionMt !== undefined && { bunkerConsumptionMt: bunkerConsumptionMt !== undefined ? bunkerConsumptionMt.toString() : null }),
        ...(speedKnots !== undefined && { speedKnots: speedKnots !== undefined ? speedKnots.toString() : null }),
        ...(distanceNm !== undefined && { distanceNm: distanceNm !== undefined ? distanceNm.toString() : null }),
        ...(reliabilityScore !== undefined && { reliabilityScore: reliabilityScore !== undefined ? reliabilityScore.toString() : null }),
      })
      .where(
        and(
          eq(capSchedulePerformances.id, id),
          eq(capSchedulePerformances.tenantId, user.tenantId),
          isNull(capSchedulePerformances.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Schedule performance not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update schedule performance:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "capacity:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db
      .update(capSchedulePerformances)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(capSchedulePerformances.id, id),
          eq(capSchedulePerformances.tenantId, user.tenantId),
          isNull(capSchedulePerformances.deletedAt)
        )
      )
      .returning({ id: capSchedulePerformances.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Schedule performance not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete schedule performance:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
