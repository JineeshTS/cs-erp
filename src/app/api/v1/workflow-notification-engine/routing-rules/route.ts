import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneRoutingRules } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createRoutingRuleSchema } from "@/lib/workflow-notification-engine/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const entityType = url.searchParams.get("entityType") || "";
    const triggerEvent = url.searchParams.get("triggerEvent") || "";
    const isActive = url.searchParams.get("isActive");
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(wneRoutingRules.tenantId, user.tenantId), isNull(wneRoutingRules.deletedAt)];
    if (search) conditions.push(ilike(wneRoutingRules.name, `%${search}%`));
    if (entityType) conditions.push(eq(wneRoutingRules.entityType, entityType));
    if (triggerEvent) conditions.push(eq(wneRoutingRules.triggerEvent, triggerEvent));
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      conditions.push(eq(wneRoutingRules.isActive, isActive === "true"));
    }
    if (cursor) conditions.push(gt(wneRoutingRules.createdAt, new Date(cursor)));

    const results = await db.select().from(wneRoutingRules).where(and(...conditions))
      .orderBy(desc(wneRoutingRules.priority), desc(wneRoutingRules.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("GET /routing-rules error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch routing rules" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createRoutingRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [created] = await db.insert(wneRoutingRules).values({
      tenantId: user.tenantId,
      ...parsed.data,
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "routing-rules", entityId: created?.id, module: "workflow-notification-engine", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /routing-rules error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create routing rule" } },
      { status: 500 }
    );
  }
}
