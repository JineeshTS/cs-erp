import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { ltrRouteOptimizations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateRouteOptimizationSchema } from "@/lib/liner-trade-route-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "liner:read")))
      return forbiddenResponse();

    const { id } = await params;

    const [record] = await db
      .select()
      .from(ltrRouteOptimizations)
      .where(
        and(
          eq(ltrRouteOptimizations.id, id),
          eq(ltrRouteOptimizations.tenantId, user.tenantId),
          isNull(ltrRouteOptimizations.deletedAt)
        )
      )
      .limit(1);

    if (!record)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Route optimization not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get route optimization:", error);
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "liner:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;

    const body = await request.json();
    const parsed = updateRouteOptimizationSchema.safeParse(body);
    if (!parsed.success)
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

    const [updated] = await db
      .update(ltrRouteOptimizations)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(ltrRouteOptimizations.id, id),
          eq(ltrRouteOptimizations.tenantId, user.tenantId),
          isNull(ltrRouteOptimizations.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "route-optimizations", entityId: updated?.id, module: "liner-trade-route-management", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Route optimization not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update route optimization:", error);
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "liner:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;

    const [deleted] = await db
      .update(ltrRouteOptimizations)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(ltrRouteOptimizations.id, id),
          eq(ltrRouteOptimizations.tenantId, user.tenantId),
          isNull(ltrRouteOptimizations.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "route-optimizations", entityId: deleted?.id, module: "liner-trade-route-management", previousData: null, request });

    if (!deleted)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Route optimization not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: { id: deleted.id } });
  } catch (error) {
    console.error("Failed to delete route optimization:", error);
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
