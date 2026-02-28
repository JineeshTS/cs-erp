import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyRepositioningPlans } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createRepositioningPlanSchema } from "@/lib/equipment-control-yard-managem/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(eqyRepositioningPlans.tenantId, user.tenantId), isNull(eqyRepositioningPlans.deletedAt)];
    if (search) conditions.push(ilike(eqyRepositioningPlans.planReference, `%${search}%`));
    if (status) conditions.push(eq(eqyRepositioningPlans.status, status));
    if (cursor) conditions.push(gt(eqyRepositioningPlans.createdAt, new Date(cursor)));

    const results = await db.select().from(eqyRepositioningPlans).where(and(...conditions)).orderBy(desc(eqyRepositioningPlans.createdAt)).limit(limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list repositioning plans:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createRepositioningPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const { scheduledDate, completedDate, ...rest } = parsed.data;
    const [created] = await db.insert(eqyRepositioningPlans).values({
      tenantId: user.tenantId,
      ...rest,
      ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
      ...(completedDate && { completedDate: new Date(completedDate) }),
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create repositioning plan:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
