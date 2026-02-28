import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmIncentiveRules } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createIncentiveRuleSchema } from "@/lib/sales-crm/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(scmIncentiveRules.tenantId, user.tenantId), isNull(scmIncentiveRules.deletedAt)];
    if (search) conditions.push(ilike(scmIncentiveRules.ruleName, `%${search}%`));
    if (cursor) conditions.push(gt(scmIncentiveRules.createdAt, new Date(cursor)));

    const results = await db.select().from(scmIncentiveRules).where(and(...conditions))
      .orderBy(desc(scmIncentiveRules.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("Incentive rules list error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch incentive rules" } },
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
    const parsed = createIncentiveRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { effectiveFrom, effectiveTo, ...rest } = parsed.data;
    const [created] = await db.insert(scmIncentiveRules).values({
      tenantId: user.tenantId,
      ...rest,
      effectiveFrom: new Date(effectiveFrom),
      ...(effectiveTo && { effectiveTo: new Date(effectiveTo) }),
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Incentive rule create error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create incentive rule" } },
      { status: 500 }
    );
  }
}
