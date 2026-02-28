import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmOpportunityActivities } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createOpportunityActivitySchema } from "@/lib/sales-crm/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const opportunityId = url.searchParams.get("opportunityId") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(scmOpportunityActivities.tenantId, user.tenantId), isNull(scmOpportunityActivities.deletedAt)];
    if (search) conditions.push(ilike(scmOpportunityActivities.subject, `%${search}%`));
    if (status) conditions.push(eq(scmOpportunityActivities.status, status));
    if (opportunityId) conditions.push(eq(scmOpportunityActivities.opportunityId, opportunityId));
    if (cursor) conditions.push(gt(scmOpportunityActivities.createdAt, new Date(cursor)));

    const results = await db.select().from(scmOpportunityActivities).where(and(...conditions))
      .orderBy(desc(scmOpportunityActivities.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("Opportunity activities list error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch opportunity activities" } },
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
    const parsed = createOpportunityActivitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { activityDate, dueDate, ...rest } = parsed.data;
    const [created] = await db.insert(scmOpportunityActivities).values({
      tenantId: user.tenantId,
      ...rest,
      activityDate: new Date(activityDate),
      ...(dueDate && { dueDate: new Date(dueDate) }),
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Opportunity activity create error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create opportunity activity" } },
      { status: 500 }
    );
  }
}
