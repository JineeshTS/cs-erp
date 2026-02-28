import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { melsCurrencyConfigs } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCurrencyConfigSchema } from "@/lib/multi-entity-legal-structure/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "entities:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);
    const legalEntityId = url.searchParams.get("legalEntityId");
    const currencyCode = url.searchParams.get("currencyCode");

    const conditions = [eq(melsCurrencyConfigs.tenantId, user.tenantId), isNull(melsCurrencyConfigs.deletedAt)];
    if (search) conditions.push(ilike(melsCurrencyConfigs.currencyName, `%${search}%`));
    if (legalEntityId) conditions.push(eq(melsCurrencyConfigs.legalEntityId, legalEntityId));
    if (currencyCode) conditions.push(eq(melsCurrencyConfigs.currencyCode, currencyCode));
    if (cursor) conditions.push(gt(melsCurrencyConfigs.createdAt, new Date(cursor)));

    const results = await db.select().from(melsCurrencyConfigs).where(and(...conditions))
      .orderBy(desc(melsCurrencyConfigs.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list currency configs:", error);
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
    const parsed = createCurrencyConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [created] = await db.insert(melsCurrencyConfigs).values({
      tenantId: user.tenantId,
      ...parsed.data,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create currency config:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
