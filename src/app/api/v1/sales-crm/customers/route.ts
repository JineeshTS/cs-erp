import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmCustomers } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCustomerSchema } from "@/lib/sales-crm/validation";
import { eventBus } from "@/lib/events/event-bus";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(scmCustomers.tenantId, user.tenantId), isNull(scmCustomers.deletedAt)];
    if (search) conditions.push(ilike(scmCustomers.companyName, `%${search}%`));
    if (status) conditions.push(eq(scmCustomers.status, status));
    if (cursor) conditions.push(gt(scmCustomers.createdAt, new Date(cursor)));

    const results = await db.select().from(scmCustomers).where(and(...conditions)).orderBy(desc(scmCustomers.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list customers:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    const [created] = await db.insert(scmCustomers).values({ tenantId: user.tenantId, ...parsed.data }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "customers", entityId: created?.id, module: "sales-crm", newData: created as Record<string, unknown>, request });

    eventBus.emit({
      type: "CUSTOMER_CREATED",
      tenantId: user.tenantId,
      userId: user.id,
      entityId: created.id,
      entityType: "customer",
      timestamp: new Date(),
      data: {
        customerCode: created.customerCode,
        companyName: created.companyName,
        customerType: created.customerType,
        country: created.country,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
