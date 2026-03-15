import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { hpsAttendanceTimeTrackings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateAttendanceTimeTrackingSchema } from "@/lib/hr-payroll-shore-staff/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "hr:read"))) return forbiddenResponse();

    const { id } = await params;

    const [record] = await db
      .select()
      .from(hpsAttendanceTimeTrackings)
      .where(
        and(
          eq(hpsAttendanceTimeTrackings.id, id),
          eq(hpsAttendanceTimeTrackings.tenantId, user.tenantId),
          isNull(hpsAttendanceTimeTrackings.deletedAt)
        )
      );

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Attendance time tracking not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get attendance time tracking:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "hr:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateAttendanceTimeTrackingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [updated] = await db
      .update(hpsAttendanceTimeTrackings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(hpsAttendanceTimeTrackings.id, id),
          eq(hpsAttendanceTimeTrackings.tenantId, user.tenantId),
          isNull(hpsAttendanceTimeTrackings.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "attendance-time-trackings", entityId: updated?.id, module: "hr-payroll-shore-staff", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Attendance time tracking not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update attendance time tracking:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "hr:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;

    const [deleted] = await db
      .update(hpsAttendanceTimeTrackings)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(hpsAttendanceTimeTrackings.id, id),
          eq(hpsAttendanceTimeTrackings.tenantId, user.tenantId),
          isNull(hpsAttendanceTimeTrackings.deletedAt)
        )
      )
      .returning({ id: hpsAttendanceTimeTrackings.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "attendance-time-trackings", entityId: deleted?.id, module: "hr-payroll-shore-staff", previousData: null, request });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Attendance time tracking not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete attendance time tracking:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
