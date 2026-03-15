import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { abiCustomerRevenueAnalytics } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCustomerRevenueAnalyticsSchema } from "@/lib/analytics-business-intelligence/validation";
import { eq, and, isNull, desc, ilike, or, gt } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "analytics:read"))) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const cursor = searchParams.get("cursor") ?? "";
    const limit = 50;

    const conditions = [
      eq(abiCustomerRevenueAnalytics.tenantId, user.tenantId),
      isNull(abiCustomerRevenueAnalytics.deletedAt),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(abiCustomerRevenueAnalytics.analyticsRef, `%${search}%`),
          ilike(abiCustomerRevenueAnalytics.customerName, `%${search}%`),
          ilike(abiCustomerRevenueAnalytics.customerCode, `%${search}%`)
        )!
      );
    }

    if (status) {
      conditions.push(eq(abiCustomerRevenueAnalytics.status, status));
    }

    if (cursor) {
      conditions.push(gt(abiCustomerRevenueAnalytics.createdAt, new Date(cursor)));
    }

    const results = await db
      .select()
      .from(abiCustomerRevenueAnalytics)
      .where(and(...conditions))
      .orderBy(desc(abiCustomerRevenueAnalytics.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({
      data,
      meta: {
        cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Failed to list customer revenue analytics:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "analytics:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createCustomerRevenueAnalyticsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const analyticsRef = `ACR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await db
      .insert(abiCustomerRevenueAnalytics)
      .values({
        ...parsed.data,
        analyticsRef,
        tenantId: user.tenantId,
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "customer-revenue-analytics", entityId: created?.id, module: "analytics-business-intelligence", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer revenue analytics:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
