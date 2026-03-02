import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { abiCustomerRevenueAnalytics } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateCustomerRevenueAnalyticsSchema } from "@/lib/analytics-business-intelligence/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "analytics:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(abiCustomerRevenueAnalytics)
      .where(
        and(
          eq(abiCustomerRevenueAnalytics.id, id),
          eq(abiCustomerRevenueAnalytics.tenantId, user.tenantId),
          isNull(abiCustomerRevenueAnalytics.deletedAt)
        )
      );

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Customer revenue analytics record not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get customer revenue analytics:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "analytics:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCustomerRevenueAnalyticsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [updated] = await db
      .update(abiCustomerRevenueAnalytics)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(abiCustomerRevenueAnalytics.id, id),
          eq(abiCustomerRevenueAnalytics.tenantId, user.tenantId),
          isNull(abiCustomerRevenueAnalytics.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Customer revenue analytics record not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update customer revenue analytics:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "analytics:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db
      .update(abiCustomerRevenueAnalytics)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(abiCustomerRevenueAnalytics.id, id),
          eq(abiCustomerRevenueAnalytics.tenantId, user.tenantId),
          isNull(abiCustomerRevenueAnalytics.deletedAt)
        )
      )
      .returning({ id: abiCustomerRevenueAnalytics.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Customer revenue analytics record not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete customer revenue analytics:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
