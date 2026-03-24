import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, ilike, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneDoaMatrix } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createDoaMatrixSchema } from "@/lib/workflow-notification-engine/validation";
import { formatZodErrors , escapeIlike } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const entityType = url.searchParams.get("entityType") || "";
    const actionType = url.searchParams.get("actionType") || "";
    const isActive = url.searchParams.get("isActive");
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(wneDoaMatrix.tenantId, user.tenantId), isNull(wneDoaMatrix.deletedAt)];
    if (search) conditions.push(ilike(wneDoaMatrix.name, `%${escapeIlike(search)}%`));
    if (entityType) conditions.push(eq(wneDoaMatrix.entityType, entityType));
    if (actionType) conditions.push(eq(wneDoaMatrix.actionType, actionType));
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      conditions.push(eq(wneDoaMatrix.isActive, isActive === "true"));
    }
    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(wneDoaMatrix.createdAt, wneDoaMatrix.id, parsedCursor));

    const results = await db.select().from(wneDoaMatrix).where(and(...conditions))
      .orderBy(desc(wneDoaMatrix.createdAt), desc(wneDoaMatrix.id)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("GET /doa-matrix error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch DOA matrix entries" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createDoaMatrixSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { delegatedUntil, ...rest } = parsed.data;

    const [created] = await db.insert(wneDoaMatrix).values({
      tenantId: user.tenantId,
      ...rest,
      ...(delegatedUntil ? { delegatedUntil: new Date(delegatedUntil) } : {}),
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "doa-matrix", entityId: created.id, module: "workflow-notification-engine", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /doa-matrix error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create DOA matrix entry" } },
      { status: 500 }
    );
  }
}
