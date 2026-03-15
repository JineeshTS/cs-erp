import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmCampaigns } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCampaignSchema } from "@/lib/sales-crm/validation";
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

    const conditions = [eq(scmCampaigns.tenantId, user.tenantId), isNull(scmCampaigns.deletedAt)];
    if (search) conditions.push(ilike(scmCampaigns.campaignName, `%${search}%`));
    if (status) conditions.push(eq(scmCampaigns.status, status));
    if (cursor) conditions.push(gt(scmCampaigns.createdAt, new Date(cursor)));

    const results = await db.select().from(scmCampaigns).where(and(...conditions))
      .orderBy(desc(scmCampaigns.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("Campaigns list error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch campaigns" } },
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
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { startDate, endDate, ...rest } = parsed.data;
    const [created] = await db.insert(scmCampaigns).values({
      tenantId: user.tenantId,
      ...rest,
      startDate: new Date(startDate),
      ...(endDate && { endDate: new Date(endDate) }),
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "campaigns", entityId: created?.id, module: "sales-crm", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Campaign create error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create campaign" } },
      { status: 500 }
    );
  }
}
