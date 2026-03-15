import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { icdRouteOptimizations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateRouteOptimizationSchema } from "@/lib/intermodal-icd-operations/validation";
import { eq, and, isNull } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "intermodal:read")))
      return forbiddenResponse();

    const { id } = await params;

    const [record] = await db
      .select()
      .from(icdRouteOptimizations)
      .where(
        and(
          eq(icdRouteOptimizations.id, id),
          eq(icdRouteOptimizations.tenantId, user.tenantId),
          isNull(icdRouteOptimizations.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Route optimization not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get route optimization:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "intermodal:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateRouteOptimizationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [record] = await db
      .update(icdRouteOptimizations)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(icdRouteOptimizations.id, id),
          eq(icdRouteOptimizations.tenantId, user.tenantId),
          isNull(icdRouteOptimizations.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "route-optimizations", entityId: record?.id, module: "intermodal-icd-operations", previousData: null, newData: record as Record<string, unknown>, request });

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Route optimization not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to update route optimization:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "intermodal:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;

    const [record] = await db
      .update(icdRouteOptimizations)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(icdRouteOptimizations.id, id),
          eq(icdRouteOptimizations.tenantId, user.tenantId),
          isNull(icdRouteOptimizations.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "route-optimizations", entityId: record?.id, module: "intermodal-icd-operations", previousData: null, request });

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Route optimization not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: record.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete route optimization:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
