import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { capDemandForecasts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateDemandForecastSchema } from "@/lib/capacity-voyage-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "capacity:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(capDemandForecasts)
      .where(
        and(
          eq(capDemandForecasts.id, id),
          eq(capDemandForecasts.tenantId, user.tenantId),
          isNull(capDemandForecasts.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Demand forecast not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get demand forecast:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "capacity:edit"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateDemandForecastSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { forecastPeriodStart, forecastPeriodEnd, utilizationForecastPercent, confidenceLevel, seasonFactor, ...rest } = parsed.data;

    const [updated] = await db
      .update(capDemandForecasts)
      .set({
        ...rest,
        ...(forecastPeriodStart !== undefined && { forecastPeriodStart: new Date(forecastPeriodStart) }),
        ...(forecastPeriodEnd !== undefined && { forecastPeriodEnd: new Date(forecastPeriodEnd) }),
        ...(utilizationForecastPercent !== undefined && { utilizationForecastPercent: utilizationForecastPercent.toString() }),
        ...(confidenceLevel !== undefined && { confidenceLevel: confidenceLevel.toString() }),
        ...(seasonFactor !== undefined && { seasonFactor: seasonFactor.toString() }),
      })
      .where(
        and(
          eq(capDemandForecasts.id, id),
          eq(capDemandForecasts.tenantId, user.tenantId),
          isNull(capDemandForecasts.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Demand forecast not found" } },
        { status: 404 }
      );
    }
    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "demand-forecasts", entityId: updated.id, module: "capacity-voyage-management", previousData: null, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update demand forecast:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "capacity:delete"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const [deleted] = await db
      .update(capDemandForecasts)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(capDemandForecasts.id, id),
          eq(capDemandForecasts.tenantId, user.tenantId),
          isNull(capDemandForecasts.deletedAt)
        )
      )
      .returning({ id: capDemandForecasts.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Demand forecast not found" } },
        { status: 404 }
      );
    }
    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "demand-forecasts", entityId: deleted.id, module: "capacity-voyage-management", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete demand forecast:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
