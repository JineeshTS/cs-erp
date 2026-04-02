import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmUtilizationAnalyses } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateUtilizationAnalysisSchema } from "@/lib/chartering-vessel-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(cvmUtilizationAnalyses)
      .where(and(eq(cvmUtilizationAnalyses.id, id), eq(cvmUtilizationAnalyses.tenantId, user.tenantId), isNull(cvmUtilizationAnalyses.deletedAt)))
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Utilization analysis not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get utilization analysis:", error);
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

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateUtilizationAnalysisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const {
      analysisDate,
      periodFrom,
      periodTo,
      currentUtilizationPercent,
      projectedUtilizationPercent,
      ...rest
    } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (analysisDate !== undefined) updateData.analysisDate = new Date(analysisDate);
    if (periodFrom !== undefined) updateData.periodFrom = new Date(periodFrom);
    if (periodTo !== undefined) updateData.periodTo = new Date(periodTo);
    if (currentUtilizationPercent !== undefined) updateData.currentUtilizationPercent = currentUtilizationPercent.toString();
    if (projectedUtilizationPercent !== undefined) updateData.projectedUtilizationPercent = projectedUtilizationPercent.toString();

    const [updated] = await db.update(cvmUtilizationAnalyses).set(updateData)
      .where(and(eq(cvmUtilizationAnalyses.id, id), eq(cvmUtilizationAnalyses.tenantId, user.tenantId), isNull(cvmUtilizationAnalyses.deletedAt)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Utilization analysis not found" } },
        { status: 404 }
      );
    }
    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "utilization-analyses", entityId: updated.id, module: "chartering-vessel-management", previousData: null, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update utilization analysis:", error);
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

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const [deleted] = await db.update(cvmUtilizationAnalyses).set({ deletedAt: new Date() })
      .where(and(eq(cvmUtilizationAnalyses.id, id), eq(cvmUtilizationAnalyses.tenantId, user.tenantId), isNull(cvmUtilizationAnalyses.deletedAt)))
      .returning({ id: cvmUtilizationAnalyses.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Utilization analysis not found" } },
        { status: 404 }
      );
    }
    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "utilization-analyses", entityId: deleted.id, module: "chartering-vessel-management", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete utilization analysis:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
