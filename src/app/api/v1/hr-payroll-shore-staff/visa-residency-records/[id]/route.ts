import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { hpsVisaResidencyRecords } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateVisaResidencyRecordSchema } from "@/lib/hr-payroll-shore-staff/validation";
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
      .from(hpsVisaResidencyRecords)
      .where(
        and(
          eq(hpsVisaResidencyRecords.id, id),
          eq(hpsVisaResidencyRecords.tenantId, user.tenantId),
          isNull(hpsVisaResidencyRecords.deletedAt)
        )
      );

    if (!record)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Visa residency record not found" } },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get visa residency record:", error);
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
    const parsed = updateVisaResidencyRecordSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );

    const [updated] = await db
      .update(hpsVisaResidencyRecords)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(hpsVisaResidencyRecords.id, id),
          eq(hpsVisaResidencyRecords.tenantId, user.tenantId),
          isNull(hpsVisaResidencyRecords.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "visa-residency-records", entityId: updated?.id, module: "hr-payroll-shore-staff", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Visa residency record not found" } },
        { status: 404 }
      );

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update visa residency record:", error);
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
      .update(hpsVisaResidencyRecords)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(hpsVisaResidencyRecords.id, id),
          eq(hpsVisaResidencyRecords.tenantId, user.tenantId),
          isNull(hpsVisaResidencyRecords.deletedAt)
        )
      )
      .returning({ id: hpsVisaResidencyRecords.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "visa-residency-records", entityId: deleted?.id, module: "hr-payroll-shore-staff", previousData: null, request });

    if (!deleted)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Visa residency record not found" } },
        { status: 404 }
      );

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete visa residency record:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
