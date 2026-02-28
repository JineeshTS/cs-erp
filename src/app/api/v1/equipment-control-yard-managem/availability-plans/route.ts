import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyAvailabilityPlans } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createAvailabilityPlanSchema } from "@/lib/equipment-control-yard-managem/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(eqyAvailabilityPlans.tenantId, user.tenantId),
      isNull(eqyAvailabilityPlans.deletedAt),
    ];
    if (search) conditions.push(ilike(eqyAvailabilityPlans.planReference, `%${search}%`));
    if (status) conditions.push(eq(eqyAvailabilityPlans.status, status));
    if (cursor) conditions.push(gt(eqyAvailabilityPlans.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(eqyAvailabilityPlans)
      .where(and(...conditions))
      .orderBy(desc(eqyAvailabilityPlans.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list availability plans:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "equipment:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createAvailabilityPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { forecastPeriodStart, forecastPeriodEnd, executionDate, aiConfidence, ...rest } = parsed.data;

    const [created] = await db
      .insert(eqyAvailabilityPlans)
      .values({
        tenantId: user.tenantId,
        ...rest,
        forecastPeriodStart: new Date(forecastPeriodStart),
        forecastPeriodEnd: new Date(forecastPeriodEnd),
        ...(executionDate && { executionDate: new Date(executionDate) }),
        ...(aiConfidence !== undefined && { aiConfidence: aiConfidence.toString() }),
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create availability plan:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
