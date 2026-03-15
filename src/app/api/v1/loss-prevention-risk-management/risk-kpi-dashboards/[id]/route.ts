import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getRiskKpiDashboard } from "@/lib/loss-prevention-risk-management/service";
import { updateRiskKpiDashboardSchema } from "@/lib/loss-prevention-risk-management/validation";
import { db } from "@/lib/db";
import { lprRiskKpiDashboards } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "lpr:read"))) return forbiddenResponse();

    const { id } = await params;
    const record = await getRiskKpiDashboard(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Risk KPI dashboard not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get risk KPI dashboard:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "lpr:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) {
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await getRiskKpiDashboard(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Risk KPI dashboard not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateRiskKpiDashboardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [updated] = await db
      .update(lprRiskKpiDashboards)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(lprRiskKpiDashboards.id, id), eq(lprRiskKpiDashboards.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "risk-kpi-dashboards", entityId: updated?.id, module: "loss-prevention-risk-management", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update risk KPI dashboard:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "lpr:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) {
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await getRiskKpiDashboard(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Risk KPI dashboard not found" } },
        { status: 404 }
      );
    }

    const [deleted] = await db
      .update(lprRiskKpiDashboards)
      .set({ deletedAt: new Date() })
      .where(and(eq(lprRiskKpiDashboards.id, id), eq(lprRiskKpiDashboards.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "risk-kpi-dashboards", entityId: deleted?.id, module: "loss-prevention-risk-management", previousData: existing as Record<string, unknown>, request });

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete risk KPI dashboard:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
