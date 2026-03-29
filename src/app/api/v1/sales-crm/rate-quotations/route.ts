import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, ilike, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmRateQuotations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createRateQuotationSchema } from "@/lib/sales-crm/validation";
import { eventBus } from "@/lib/events/event-bus";
import { formatZodErrors , escapeIlike } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";
import { generateNextNumber } from "@/lib/number-sequence";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
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
    if (search) conditions.push(ilike(scmRateQuotations.quotationNumber, `%${escapeIlike(search)}%`));
    if (status) conditions.push(eq(scmRateQuotations.status, status));
    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(scmRateQuotations.createdAt, scmRateQuotations.id, parsedCursor));

    const results = await db.select().from(scmRateQuotations).where(and(...conditions))
      .orderBy(desc(scmRateQuotations.createdAt), desc(scmRateQuotations.id)).limit(limit + 1);

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

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createRateQuotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { validFrom, validTo, quotationNumber: clientQuotationNumber, ...rest } = parsed.data;
    const quotationNumber = clientQuotationNumber || await generateNextNumber("quotation", user.tenantId);

    const [created] = await db.insert(scmRateQuotations).values({
      tenantId: user.tenantId,
      ...rest,
      quotationNumber,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "rate-quotations", entityId: created.id, module: "sales-crm", newData: created as Record<string, unknown>, request });

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
