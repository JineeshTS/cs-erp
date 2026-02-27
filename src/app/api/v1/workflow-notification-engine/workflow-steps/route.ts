import { NextRequest, NextResponse } from "next/server";
import { eq, and, gt, desc, isNull, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneWorkflowSteps } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createWorkflowStepSchema } from "@/lib/workflow-notification-engine/validation";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "workflows:read"))) return forbiddenResponse();

  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    if (!workflowId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "workflowId query parameter is required" } },
        { status: 422 }
      );
    }
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(wneWorkflowSteps.tenantId, user.tenantId),
      isNull(wneWorkflowSteps.deletedAt),
      eq(wneWorkflowSteps.workflowId, workflowId),
    ];
    if (cursor) conditions.push(gt(wneWorkflowSteps.stepOrder, parseInt(cursor, 10)));

    const results = await db.select().from(wneWorkflowSteps)
      .where(and(...conditions))
      .orderBy(asc(wneWorkflowSteps.stepOrder))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? String(data[data.length - 1].stepOrder) : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("Workflow steps list error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch workflow steps" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "workflows:create"))) return forbiddenResponse();

  try {
    const body = await request.json();
    const parsed = createWorkflowStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [created] = await db.insert(wneWorkflowSteps).values({
      tenantId: user.tenantId,
      ...parsed.data,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Workflow step create error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create workflow step" } },
      { status: 500 }
    );
  }
}
