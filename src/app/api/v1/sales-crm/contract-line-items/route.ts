import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmContractLineItems } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createContractLineItemSchema } from "@/lib/sales-crm/validation";

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
    if (search) conditions.push(ilike(scmContractLineItems.chargeName, `%${search}%`));
    if (contractId) conditions.push(eq(scmContractLineItems.contractId, contractId));
    if (cursor) conditions.push(gt(scmContractLineItems.createdAt, new Date(cursor)));

    const results = await db.select().from(scmContractLineItems).where(and(...conditions))
      .orderBy(desc(scmContractLineItems.createdAt)).limit(limit + 1);

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

    const body = await request.json();
    const parsed = createContractLineItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
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

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Contract line item create error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create contract line item" } },
      { status: 500 }
    );
  }
}
