import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmVesselPerformances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateVesselPerformanceSchema } from "@/lib/chartering-vessel-management/validation";
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
      .from(cvmVesselPerformances)
      .where(
        and(
          eq(cvmVesselPerformances.id, id),
          eq(cvmVesselPerformances.tenantId, user.tenantId),
          isNull(cvmVesselPerformances.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Vessel performance not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to fetch vessel performance:", error);
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
    const parsed = updateVesselPerformanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const {
      reportDate,
      latitude,
      longitude,
      speedKnots,
      consumptionMt,
      distanceNm,
      slipPercent,
      ...rest
    } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (reportDate !== undefined) updateData.reportDate = new Date(reportDate);
    if (latitude !== undefined) updateData.latitude = latitude.toString();
    if (longitude !== undefined) updateData.longitude = longitude.toString();
    if (speedKnots !== undefined) updateData.speedKnots = speedKnots.toString();
    if (consumptionMt !== undefined) updateData.consumptionMt = consumptionMt.toString();
    if (distanceNm !== undefined) updateData.distanceNm = distanceNm.toString();
    if (slipPercent !== undefined) updateData.slipPercent = slipPercent.toString();

    const [updated] = await db
      .update(cvmVesselPerformances)
      .set(updateData)
      .where(
        and(
          eq(cvmVesselPerformances.id, id),
          eq(cvmVesselPerformances.tenantId, user.tenantId),
          isNull(cvmVesselPerformances.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Vessel performance not found" } },
        { status: 404 }
      );
    }
    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "vessel-performances", entityId: updated.id, module: "chartering-vessel-management", previousData: null, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update vessel performance:", error);
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
    const [deleted] = await db
      .update(cvmVesselPerformances)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(cvmVesselPerformances.id, id),
          eq(cvmVesselPerformances.tenantId, user.tenantId),
          isNull(cvmVesselPerformances.deletedAt)
        )
      )
      .returning({ id: cvmVesselPerformances.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Vessel performance not found" } },
        { status: 404 }
      );
    }
    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "vessel-performances", entityId: deleted.id, module: "chartering-vessel-management", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete vessel performance:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
