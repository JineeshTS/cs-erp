import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { hpsGratuityCalculations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateGratuityCalculationSchema } from "@/lib/hr-payroll-shore-staff/validation";

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

    const { id } = await params;
    const body = await request.json();
    const parsed = updateGratuityCalculationSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
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

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete gratuity calculation:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
