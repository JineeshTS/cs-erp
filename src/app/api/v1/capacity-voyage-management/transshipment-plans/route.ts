import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { capTransshipmentPlans } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createTransshipmentPlanSchema } from "@/lib/capacity-voyage-management/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "capacity:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(capTransshipmentPlans.tenantId, user.tenantId),
      isNull(capTransshipmentPlans.deletedAt),
    ];
    if (search) conditions.push(ilike(capTransshipmentPlans.transshipmentPort, `%${search}%`));
    if (status) conditions.push(eq(capTransshipmentPlans.status, status));
    if (cursor) conditions.push(gt(capTransshipmentPlans.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(capTransshipmentPlans)
      .where(and(...conditions))
      .orderBy(desc(capTransshipmentPlans.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list transshipment plans:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "capacity:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createTransshipmentPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { expectedArrival, expectedConnection, ...rest } = parsed.data;

    const [created] = await db
      .insert(capTransshipmentPlans)
      .values({
        tenantId: user.tenantId,
        ...rest,
        ...(expectedArrival && { expectedArrival: new Date(expectedArrival) }),
        ...(expectedConnection && { expectedConnection: new Date(expectedConnection) }),
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create transshipment plan:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
