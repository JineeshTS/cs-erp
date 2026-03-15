import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmHireStatements } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateHireStatementSchema } from "@/lib/chartering-vessel-management/validation";
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
      .from(cvmHireStatements)
      .where(
        and(
          eq(cvmHireStatements.id, id),
          eq(cvmHireStatements.tenantId, user.tenantId),
          isNull(cvmHireStatements.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Hire statement not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get hire statement:", error);
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
    const parsed = updateHireStatementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { periodFrom, periodTo, hireDays, ...rest } = parsed.data;

    const [updated] = await db
      .update(cvmHireStatements)
      .set({
        ...rest,
        ...(periodFrom !== undefined && { periodFrom: new Date(periodFrom) }),
        ...(periodTo !== undefined && { periodTo: new Date(periodTo) }),
        ...(hireDays !== undefined && { hireDays: hireDays.toString() }),
      })
      .where(
        and(
          eq(cvmHireStatements.id, id),
          eq(cvmHireStatements.tenantId, user.tenantId),
          isNull(cvmHireStatements.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "hire-statements", entityId: updated?.id, module: "chartering-vessel-management", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Hire statement not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update hire statement:", error);
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
      .update(cvmHireStatements)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(cvmHireStatements.id, id),
          eq(cvmHireStatements.tenantId, user.tenantId),
          isNull(cvmHireStatements.deletedAt)
        )
      )
      .returning({ id: cvmHireStatements.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "hire-statements", entityId: deleted?.id, module: "chartering-vessel-management", previousData: null, request });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Hire statement not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete hire statement:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
