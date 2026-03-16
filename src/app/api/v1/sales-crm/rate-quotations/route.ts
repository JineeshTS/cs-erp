import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, lt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmRateQuotations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createRateQuotationSchema } from "@/lib/sales-crm/validation";
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

    const conditions = [eq(scmRateQuotations.tenantId, user.tenantId), isNull(scmRateQuotations.deletedAt)];
    if (search) conditions.push(ilike(scmRateQuotations.quotationNumber, `%${search}%`));
    if (status) conditions.push(eq(scmRateQuotations.status, status));
    if (cursor) conditions.push(lt(scmRateQuotations.createdAt, new Date(cursor)));

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

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createRateQuotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
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

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "rate-quotations", entityId: created?.id, module: "sales-crm", newData: created as Record<string, unknown>, request });

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
