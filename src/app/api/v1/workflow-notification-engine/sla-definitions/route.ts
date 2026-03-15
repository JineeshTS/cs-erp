import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneSlaDefinitions } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createSlaDefinitionSchema } from "@/lib/workflow-notification-engine/validation";
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
    const isActive = url.searchParams.get("isActive");
    const priority = url.searchParams.get("priority") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(wneSlaDefinitions.tenantId, user.tenantId), isNull(wneSlaDefinitions.deletedAt)];
    if (search) conditions.push(ilike(wneSlaDefinitions.name, `%${search}%`));
    if (entityType) conditions.push(eq(wneSlaDefinitions.entityType, entityType));
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      conditions.push(eq(wneSlaDefinitions.isActive, isActive === "true"));
    }
    if (priority) conditions.push(eq(wneSlaDefinitions.priority, priority));
    if (cursor) conditions.push(gt(wneSlaDefinitions.createdAt, new Date(cursor)));

    const results = await db.select().from(wneSlaDefinitions).where(and(...conditions))
      .orderBy(desc(wneSlaDefinitions.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("SLA definitions list error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch SLA definitions" } },
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
    const parsed = createSlaDefinitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [created] = await db.insert(wneSlaDefinitions).values({
      tenantId: user.tenantId,
      ...parsed.data,
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "sla-definitions", entityId: created?.id, module: "workflow-notification-engine", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("SLA definition create error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create SLA definition" } },
      { status: 500 }
    );
  }
}
