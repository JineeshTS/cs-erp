import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneWorkflowInstances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read")))
      return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(wneWorkflowInstances)
      .where(
        and(
          eq(wneWorkflowInstances.id, id),
          eq(wneWorkflowInstances.tenantId, user.tenantId),
          isNull(wneWorkflowInstances.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Workflow instance not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Workflow instance GET error:", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch workflow instance",
        },
      },
      { status: 500 }
    );
  }
}
