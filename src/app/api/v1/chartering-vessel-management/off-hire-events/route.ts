import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmOffHireEvents } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createOffHireEventSchema } from "@/lib/chartering-vessel-management/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const eventType = url.searchParams.get("eventType") || "";
    const claimStatus = url.searchParams.get("claimStatus") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(cvmOffHireEvents.tenantId, user.tenantId),
      isNull(cvmOffHireEvents.deletedAt),
    ];
    if (search) conditions.push(ilike(cvmOffHireEvents.reason, `%${search}%`));
    if (eventType) conditions.push(eq(cvmOffHireEvents.eventType, eventType));
    if (claimStatus) conditions.push(eq(cvmOffHireEvents.claimStatus, claimStatus));
    if (cursor) conditions.push(gt(cvmOffHireEvents.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(cvmOffHireEvents)
      .where(and(...conditions))
      .orderBy(desc(cvmOffHireEvents.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list off-hire events:", error);
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

    const body = await request.json();
    const parsed = createOffHireEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { startAt, endAt, offHireDays, ...rest } = parsed.data;

    const [created] = await db
      .insert(cvmOffHireEvents)
      .values({
        tenantId: user.tenantId,
        ...rest,
        startAt: new Date(startAt),
        ...(endAt && { endAt: new Date(endAt) }),
        ...(offHireDays !== undefined && { offHireDays: offHireDays.toString() }),
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create off-hire event:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
