import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneSlaInstances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "";
    const entityType = url.searchParams.get("entityType") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(wneSlaInstances.tenantId, user.tenantId), isNull(wneSlaInstances.deletedAt)];
    if (status) conditions.push(eq(wneSlaInstances.status, status));
    if (entityType) conditions.push(eq(wneSlaInstances.entityType, entityType));
    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(wneSlaInstances.createdAt, wneSlaInstances.id, parsedCursor));

    const results = await db.select().from(wneSlaInstances).where(and(...conditions))
      .orderBy(desc(wneSlaInstances.createdAt), desc(wneSlaInstances.id)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("SLA instances list error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch SLA instances" } },
      { status: 500 }
    );
  }
}
