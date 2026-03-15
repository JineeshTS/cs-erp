import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyMaintenanceRepairs } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateMaintenanceRepairSchema } from "@/lib/equipment-control-yard-managem/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(eqyMaintenanceRepairs)
      .where(
        and(
          eq(eqyMaintenanceRepairs.id, id),
          eq(eqyMaintenanceRepairs.tenantId, user.tenantId),
          isNull(eqyMaintenanceRepairs.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Maintenance repair not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get maintenance repair:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "equipment:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateMaintenanceRepairSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { inspectionDate, repairStartDate, repairCompleteDate, ...rest } = parsed.data;

    const [updated] = await db
      .update(eqyMaintenanceRepairs)
      .set({
        ...rest,
        ...(inspectionDate !== undefined && { inspectionDate: inspectionDate ? new Date(inspectionDate) : null }),
        ...(repairStartDate !== undefined && { repairStartDate: repairStartDate ? new Date(repairStartDate) : null }),
        ...(repairCompleteDate !== undefined && { repairCompleteDate: repairCompleteDate ? new Date(repairCompleteDate) : null }),
      })
      .where(
        and(
          eq(eqyMaintenanceRepairs.id, id),
          eq(eqyMaintenanceRepairs.tenantId, user.tenantId),
          isNull(eqyMaintenanceRepairs.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "maintenance-repairs", entityId: updated?.id, module: "equipment-control-yard-managem", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Maintenance repair not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update maintenance repair:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "equipment:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const [deleted] = await db
      .update(eqyMaintenanceRepairs)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(eqyMaintenanceRepairs.id, id),
          eq(eqyMaintenanceRepairs.tenantId, user.tenantId),
          isNull(eqyMaintenanceRepairs.deletedAt)
        )
      )
      .returning({ id: eqyMaintenanceRepairs.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "maintenance-repairs", entityId: deleted?.id, module: "equipment-control-yard-managem", previousData: null, request });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Maintenance repair not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete maintenance repair:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
