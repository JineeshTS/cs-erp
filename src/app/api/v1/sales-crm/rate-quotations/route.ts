import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmRateQuotations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createRateQuotationSchema } from "@/lib/sales-crm/validation";
import { eventBus } from "@/lib/events/event-bus";

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

    const conditions = [eq(scmRateQuotations.tenantId, user.tenantId), isNull(scmRateQuotations.deletedAt)];
    if (search) conditions.push(ilike(scmRateQuotations.quotationNumber, `%${search}%`));
    if (status) conditions.push(eq(scmRateQuotations.status, status));
    if (cursor) conditions.push(gt(scmRateQuotations.createdAt, new Date(cursor)));

    const results = await db.select().from(scmRateQuotations).where(and(...conditions))
      .orderBy(desc(scmRateQuotations.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("Rate quotations list error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch rate quotations" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createRateQuotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { validFrom, validTo, ...rest } = parsed.data;
    const [created] = await db.insert(scmRateQuotations).values({
      tenantId: user.tenantId,
      ...rest,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
    }).returning();

    eventBus.emit({
      type: "QUOTATION_CREATED",
      tenantId: user.tenantId,
      userId: user.id,
      entityId: created.id,
      entityType: "rate_quotation",
      timestamp: new Date(),
      data: {
        quotationNumber: created.quotationNumber,
        customerId: created.customerId,
        originPort: created.originPort,
        destinationPort: created.destinationPort,
        totalAmount: created.totalAmount ?? undefined,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Rate quotation create error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create rate quotation" } },
      { status: 500 }
    );
  }
}
