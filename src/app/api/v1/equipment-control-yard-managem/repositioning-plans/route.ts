import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, ilike, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyRepositioningPlans } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createRepositioningPlanSchema } from "@/lib/equipment-control-yard-managem/validation";
import { formatZodErrors , escapeIlike } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
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
    if (search) conditions.push(ilike(eqyRepositioningPlans.planReference, `%${escapeIlike(search)}%`));
    if (status) conditions.push(eq(eqyRepositioningPlans.status, status));
    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(eqyRepositioningPlans.createdAt, eqyRepositioningPlans.id, parsedCursor));

    const results = await db.select().from(eqyRepositioningPlans).where(and(...conditions)).orderBy(desc(eqyRepositioningPlans.createdAt), desc(eqyRepositioningPlans.id)).limit(limit + 1);
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

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createRepositioningPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    const { scheduledDate, completedDate, ...rest } = parsed.data;
    const [created] = await db.insert(eqyRepositioningPlans).values({
      tenantId: user.tenantId,
      ...rest,
      ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
      ...(completedDate && { completedDate: new Date(completedDate) }),
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "repositioning-plans", entityId: created.id, module: "equipment-control-yard-managem", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create repositioning plan:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
