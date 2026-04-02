import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyAvailabilityPlans } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateAvailabilityPlanSchema } from "@/lib/equipment-control-yard-managem/validation";
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
      .from(eqyAvailabilityPlans)
      .where(
        and(
          eq(eqyAvailabilityPlans.id, id),
          eq(eqyAvailabilityPlans.tenantId, user.tenantId),
          isNull(eqyAvailabilityPlans.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Availability plan not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get availability plan:", error);
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

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateAvailabilityPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { forecastPeriodStart, forecastPeriodEnd, executionDate, aiConfidence, ...rest } = parsed.data;

    const [updated] = await db
      .update(eqyAvailabilityPlans)
      .set({
        ...rest,
        ...(forecastPeriodStart !== undefined && { forecastPeriodStart: new Date(forecastPeriodStart) }),
        ...(forecastPeriodEnd !== undefined && { forecastPeriodEnd: new Date(forecastPeriodEnd) }),
        ...(executionDate !== undefined && { executionDate: executionDate ? new Date(executionDate) : null }),
        ...(aiConfidence !== undefined && { aiConfidence: aiConfidence !== null ? aiConfidence.toString() : null }),
      })
      .where(
        and(
          eq(eqyAvailabilityPlans.id, id),
          eq(eqyAvailabilityPlans.tenantId, user.tenantId),
          isNull(eqyAvailabilityPlans.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Availability plan not found" } },
        { status: 404 }
      );
    }
    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "availability-plans", entityId: updated.id, module: "equipment-control-yard-managem", previousData: null, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update availability plan:", error);
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

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const [deleted] = await db
      .update(eqyAvailabilityPlans)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(eqyAvailabilityPlans.id, id),
          eq(eqyAvailabilityPlans.tenantId, user.tenantId),
          isNull(eqyAvailabilityPlans.deletedAt)
        )
      )
      .returning({ id: eqyAvailabilityPlans.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Availability plan not found" } },
        { status: 404 }
      );
    }
    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "availability-plans", entityId: deleted.id, module: "equipment-control-yard-managem", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete availability plan:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
