import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { capVesselSchedules } from "@/db/schema";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "capacity:read")))
      return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50", 10),
      50
    );

    const conditions = [
      eq(capVesselSchedules.tenantId, user.tenantId),
      isNull(capVesselSchedules.deletedAt),
    ];
    if (search)
      conditions.push(ilike(capVesselSchedules.vesselName, `%${search}%`));
    if (status) conditions.push(eq(capVesselSchedules.status, status));
    if (cursor)
      conditions.push(lt(capVesselSchedules.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(capVesselSchedules)
      .where(and(...conditions))
      .orderBy(desc(capVesselSchedules.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore
      ? data[data.length - 1].createdAt.toISOString()
      : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list vessel schedules:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
