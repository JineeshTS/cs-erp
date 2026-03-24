import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { hpsGratuityCalculations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateGratuityCalculationSchema } from "@/lib/hr-payroll-shore-staff/validation";
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
      .from(hpsGratuityCalculations)
      .where(
        and(
          eq(hpsGratuityCalculations.id, id),
          eq(hpsGratuityCalculations.tenantId, user.tenantId),
          isNull(hpsGratuityCalculations.deletedAt)
        )
      );

    if (!record)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Gratuity calculation not found" } },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get gratuity calculation:", error);
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

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateGratuityCalculationSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );

    const [updated] = await db
      .update(hpsGratuityCalculations)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(hpsGratuityCalculations.id, id),
          eq(hpsGratuityCalculations.tenantId, user.tenantId),
          isNull(hpsGratuityCalculations.deletedAt)
        )
      )
      .returning();

    if (!updated)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Gratuity calculation not found" } },
        { status: 404 }
      );

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "gratuity-calculations", entityId: updated.id, module: "hr-payroll-shore-staff", previousData: null, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update gratuity calculation:", error);
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

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;

    const [deleted] = await db
      .update(hpsGratuityCalculations)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(hpsGratuityCalculations.id, id),
          eq(hpsGratuityCalculations.tenantId, user.tenantId),
          isNull(hpsGratuityCalculations.deletedAt)
        )
      )
      .returning({ id: hpsGratuityCalculations.id });

    if (!deleted)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Gratuity calculation not found" } },
        { status: 404 }
      );

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "gratuity-calculations", entityId: deleted.id, module: "hr-payroll-shore-staff", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete gratuity calculation:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
