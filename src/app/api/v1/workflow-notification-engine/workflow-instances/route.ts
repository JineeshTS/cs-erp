import { NextRequest, NextResponse } from "next/server";
import { eq, and, lt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneWorkflowInstances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createWorkflowInstanceSchema } from "@/lib/workflow-notification-engine/validation";
import { startWorkflowInstance } from "@/lib/workflow-notification-engine/service";
import { formatZodErrors } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "";
    const entityType = url.searchParams.get("entityType") || "";
    const workflowId = url.searchParams.get("workflowId") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50", 10),
      50
    );

    const conditions = [
      eq(wneWorkflowInstances.tenantId, user.tenantId),
      isNull(wneWorkflowInstances.deletedAt),
    ];
    if (status) conditions.push(eq(wneWorkflowInstances.status, status));
    if (entityType)
      conditions.push(eq(wneWorkflowInstances.entityType, entityType));
    if (workflowId)
      conditions.push(eq(wneWorkflowInstances.workflowId, workflowId));
    if (cursor)
      conditions.push(lt(wneWorkflowInstances.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(wneWorkflowInstances)
      .where(and(...conditions))
      .orderBy(desc(wneWorkflowInstances.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore
      ? data[data.length - 1].createdAt.toISOString()
      : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("Workflow instances GET error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch workflow instances",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createWorkflowInstanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: formatZodErrors(parsed.error),
          },
        },
        { status: 422 }
      );
    }

    const instance = await startWorkflowInstance(
      user.tenantId,
      parsed.data.workflowId,
      parsed.data.entityType,
      parsed.data.entityId,
      user.id
    );

    if (!instance) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message:
              "Workflow not found or has no steps configured",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: instance }, { status: 201 });
  } catch (err) {
    console.error("Workflow instances POST error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create workflow instance",
        },
      },
      { status: 500 }
    );
  }
}
