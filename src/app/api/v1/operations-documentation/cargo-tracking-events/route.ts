import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { odmCargoTrackingEvents } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCargoTrackingEventSchema } from "@/lib/operations-documentation/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(odmCargoTrackingEvents.tenantId, user.tenantId), isNull(odmCargoTrackingEvents.deletedAt)];
    if (search) conditions.push(ilike(odmCargoTrackingEvents.eventCode, `%${search}%`));
    if (cursor) conditions.push(gt(odmCargoTrackingEvents.createdAt, new Date(cursor)));

    const results = await db.select().from(odmCargoTrackingEvents).where(and(...conditions)).orderBy(desc(odmCargoTrackingEvents.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list cargo tracking events:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createCargoTrackingEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const [created] = await db.insert(odmCargoTrackingEvents).values({ tenantId: user.tenantId, ...parsed.data }).returning();
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cargo tracking event:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
