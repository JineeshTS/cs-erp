import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmLaytimeCalculations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateLaytimeCalculationSchema } from "@/lib/chartering-vessel-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(cvmLaytimeCalculations)
      .where(
        and(
          eq(cvmLaytimeCalculations.id, id),
          eq(cvmLaytimeCalculations.tenantId, user.tenantId),
          isNull(cvmLaytimeCalculations.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Laytime calculation not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to fetch laytime calculation:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateLaytimeCalculationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { allowedHours, usedHours, excessHours, commencedAt, completedAt, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (allowedHours !== undefined) updateData.allowedHours = allowedHours.toString();
    if (usedHours !== undefined) updateData.usedHours = usedHours.toString();
    if (excessHours !== undefined) updateData.excessHours = excessHours.toString();
    if (commencedAt !== undefined) updateData.commencedAt = new Date(commencedAt);
    if (completedAt !== undefined) updateData.completedAt = new Date(completedAt);

    const [updated] = await db
      .update(cvmLaytimeCalculations)
      .set(updateData)
      .where(
        and(
          eq(cvmLaytimeCalculations.id, id),
          eq(cvmLaytimeCalculations.tenantId, user.tenantId),
          isNull(cvmLaytimeCalculations.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "laytime-calculations", entityId: updated?.id, module: "chartering-vessel-management", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Laytime calculation not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update laytime calculation:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const [deleted] = await db
      .update(cvmLaytimeCalculations)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(cvmLaytimeCalculations.id, id),
          eq(cvmLaytimeCalculations.tenantId, user.tenantId),
          isNull(cvmLaytimeCalculations.deletedAt)
        )
      )
      .returning({ id: cvmLaytimeCalculations.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "laytime-calculations", entityId: deleted?.id, module: "chartering-vessel-management", previousData: null, request });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Laytime calculation not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete laytime calculation:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
