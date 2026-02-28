import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { melsSettlementBatches } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createSettlementBatchSchema } from "@/lib/multi-entity-legal-structure/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "entities:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);
    const status = url.searchParams.get("status");
    const currency = url.searchParams.get("currency");

    const conditions = [eq(melsSettlementBatches.tenantId, user.tenantId), isNull(melsSettlementBatches.deletedAt)];
    if (search) conditions.push(ilike(melsSettlementBatches.batchNumber, `%${search}%`));
    if (status) conditions.push(eq(melsSettlementBatches.status, status));
    if (currency) conditions.push(eq(melsSettlementBatches.currency, currency));
    if (cursor) conditions.push(gt(melsSettlementBatches.createdAt, new Date(cursor)));

    const results = await db.select().from(melsSettlementBatches).where(and(...conditions))
      .orderBy(desc(melsSettlementBatches.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list settlement batches:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "entities:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createSettlementBatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { settlementDate, ...rest } = parsed.data;
    const [created] = await db.insert(melsSettlementBatches).values({
      tenantId: user.tenantId,
      ...rest,
      settlementDate: new Date(settlementDate),
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create settlement batch:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
