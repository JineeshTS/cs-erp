import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { melsOracleSyncLogs } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createOracleSyncLogSchema } from "@/lib/multi-entity-legal-structure/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "entities:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);
    const integrationConfigId = url.searchParams.get("integrationConfigId");
    const syncType = url.searchParams.get("syncType");
    const status = url.searchParams.get("status");

    const conditions = [eq(melsOracleSyncLogs.tenantId, user.tenantId), isNull(melsOracleSyncLogs.deletedAt)];
    if (integrationConfigId) conditions.push(eq(melsOracleSyncLogs.integrationConfigId, integrationConfigId));
    if (syncType) conditions.push(eq(melsOracleSyncLogs.syncType, syncType));
    if (status) conditions.push(eq(melsOracleSyncLogs.status, status));
    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(melsOracleSyncLogs.createdAt, melsOracleSyncLogs.id, parsedCursor));

    const results = await db.select().from(melsOracleSyncLogs).where(and(...conditions))
      .orderBy(desc(melsOracleSyncLogs.createdAt), desc(melsOracleSyncLogs.id)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list oracle sync logs:", error);
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

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createOracleSyncLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { startedAt, completedAt, ...rest } = parsed.data;

    const [created] = await db.insert(melsOracleSyncLogs).values({
      tenantId: user.tenantId,
      ...rest,
      ...(startedAt ? { startedAt: new Date(startedAt) } : {}),
      ...(completedAt ? { completedAt: new Date(completedAt) } : {}),
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "oracle-sync-logs", entityId: created.id, module: "multi-entity-legal-structure", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create oracle sync log:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
