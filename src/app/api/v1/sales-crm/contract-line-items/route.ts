import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, ilike, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmContractLineItems } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createContractLineItemSchema } from "@/lib/sales-crm/validation";
import { formatZodErrors , escapeIlike } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const contractId = url.searchParams.get("contractId") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(scmContractLineItems.tenantId, user.tenantId), isNull(scmContractLineItems.deletedAt)];
    if (search) conditions.push(ilike(scmContractLineItems.chargeName, `%${escapeIlike(search)}%`));
    if (contractId) conditions.push(eq(scmContractLineItems.contractId, contractId));
    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(scmContractLineItems.createdAt, scmContractLineItems.id, parsedCursor));

    const results = await db.select().from(scmContractLineItems).where(and(...conditions))
      .orderBy(desc(scmContractLineItems.createdAt), desc(scmContractLineItems.id)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("Contract line items list error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch contract line items" } },
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
    const parsed = createContractLineItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { validFrom, validTo, ...rest } = parsed.data;
    const [created] = await db.insert(scmContractLineItems).values({
      tenantId: user.tenantId,
      ...rest,
      ...(validFrom !== undefined && { validFrom: new Date(validFrom) }),
      ...(validTo !== undefined && { validTo: new Date(validTo) }),
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "contract-line-items", entityId: created.id, module: "sales-crm", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Contract line item create error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create contract line item" } },
      { status: 500 }
    );
  }
}
