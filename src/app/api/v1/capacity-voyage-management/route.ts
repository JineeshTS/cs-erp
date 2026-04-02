import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull, desc, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { capVesselSchedules } from "@/db/schema";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
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
      conditions.push(ilike(capVesselSchedules.vesselName, `%${escapeIlike(search)}%`));
    if (status) conditions.push(eq(capVesselSchedules.status, status));
    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(capVesselSchedules.createdAt, capVesselSchedules.id, parsedCursor));

    const results = await db
      .select()
      .from(capVesselSchedules)
      .where(and(...conditions))
      .orderBy(desc(capVesselSchedules.createdAt), desc(capVesselSchedules.id))
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
