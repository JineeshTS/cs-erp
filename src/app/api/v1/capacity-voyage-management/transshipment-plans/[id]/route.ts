import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { capTransshipmentPlans } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateTransshipmentPlanSchema } from "@/lib/capacity-voyage-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "capacity:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(capTransshipmentPlans)
      .where(
        and(
          eq(capTransshipmentPlans.id, id),
          eq(capTransshipmentPlans.tenantId, user.tenantId),
          isNull(capTransshipmentPlans.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Transshipment plan not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get transshipment plan:", error);
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

    const { id } = await params;
    const body = await request.json();
    const parsed = updateTransshipmentPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { expectedArrival, expectedConnection, ...rest } = parsed.data;

    const [updated] = await db
      .update(capTransshipmentPlans)
      .set({
        ...rest,
        ...(expectedArrival !== undefined && { expectedArrival: expectedArrival ? new Date(expectedArrival) : null }),
        ...(expectedConnection !== undefined && { expectedConnection: expectedConnection ? new Date(expectedConnection) : null }),
      })
      .where(
        and(
          eq(capTransshipmentPlans.id, id),
          eq(capTransshipmentPlans.tenantId, user.tenantId),
          isNull(capTransshipmentPlans.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Transshipment plan not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update transshipment plan:", error);
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

    const { id } = await params;
    const [deleted] = await db
      .update(capTransshipmentPlans)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(capTransshipmentPlans.id, id),
          eq(capTransshipmentPlans.tenantId, user.tenantId),
          isNull(capTransshipmentPlans.deletedAt)
        )
      )
      .returning({ id: capTransshipmentPlans.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Transshipment plan not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete transshipment plan:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
