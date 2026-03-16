import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, lt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmDeliveryReports } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createDeliveryReportSchema } from "@/lib/chartering-vessel-management/validation";
import { eventBus } from "@/lib/events/event-bus";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const reportType = url.searchParams.get("reportType") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(cvmDeliveryReports.tenantId, user.tenantId), isNull(cvmDeliveryReports.deletedAt)];
    if (search) conditions.push(ilike(cvmDeliveryReports.vesselName, `%${search}%`));
    if (reportType) conditions.push(eq(cvmDeliveryReports.reportType, reportType));
    if (status) conditions.push(eq(cvmDeliveryReports.status, status));
    if (cursor) conditions.push(lt(cvmDeliveryReports.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(cvmDeliveryReports)
      .where(and(...conditions))
      .orderBy(desc(cvmDeliveryReports.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list delivery reports:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "chartering:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createDeliveryReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { reportDate, ...rest } = parsed.data;
    const [created] = await db
      .insert(cvmDeliveryReports)
      .values({
        tenantId: user.tenantId,
        ...rest,
        reportDate: new Date(reportDate),
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "delivery-reports", entityId: created?.id, module: "chartering-vessel-management", newData: created as Record<string, unknown>, request });

    // Delivery report = cargo released to charterer
    eventBus.emit({
      type: "CARGO_RELEASED",
      tenantId: user.tenantId,
      userId: user.id,
      entityId: created.id,
      entityType: "delivery_order",
      timestamp: new Date(),
      data: {
        deliveryOrderId: created.id,
        bookingId: parsed.data.charterPartyId,
        consigneeId: "",
        containerNumbers: [],
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create delivery report:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
