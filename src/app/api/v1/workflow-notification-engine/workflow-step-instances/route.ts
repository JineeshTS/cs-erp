import { NextRequest, NextResponse } from "next/server";
import { eq, and, lt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneWorkflowStepInstances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const url = new URL(request.url);
    const instanceId = url.searchParams.get("instanceId") || "";
    const status = url.searchParams.get("status") || "";
    const assignedTo = url.searchParams.get("assignedTo") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50", 10),
      50
    );

    if (!instanceId) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "instanceId query parameter is required",
          },
        },
        { status: 422 }
      );
    }

    const conditions = [
      eq(wneWorkflowStepInstances.tenantId, user.tenantId),
      eq(wneWorkflowStepInstances.instanceId, instanceId),
      isNull(wneWorkflowStepInstances.deletedAt),
    ];
    if (status)
      conditions.push(eq(wneWorkflowStepInstances.status, status));
    if (assignedTo)
      conditions.push(eq(wneWorkflowStepInstances.assignedTo, assignedTo));
    if (cursor)
      conditions.push(
        lt(wneWorkflowStepInstances.createdAt, new Date(cursor))
      );

    const results = await db
      .select()
      .from(wneWorkflowStepInstances)
      .where(and(...conditions))
      .orderBy(desc(wneWorkflowStepInstances.createdAt), desc(wneWorkflowStepInstances.id))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore
      ? data[data.length - 1].createdAt.toISOString()
      : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("Workflow step instances GET error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch workflow step instances",
        },
      },
      { status: 500 }
    );
  }
}
