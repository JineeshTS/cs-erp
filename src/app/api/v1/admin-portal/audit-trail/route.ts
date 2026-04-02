import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authAuditLog } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";

const querySchema = z.object({
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(50),
});

/**
 * GET /api/v1/admin-portal/audit-trail
 *
 * ERP-091: Retrieve field-level change history for a specific entity.
 * Queries auth_audit_log for field_change events matching entityType + entityId.
 * Returns changes sorted by date desc with cursor pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:read")))
      return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      entityType: searchParams.get("entityType"),
      entityId: searchParams.get("entityId"),
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? 50,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "entityType and entityId query params are required",
          },
        },
        { status: 422 }
      );
    }

    const { entityType, entityId, cursor, limit } = parsed.data;

    const conditions = [
      eq(authAuditLog.tenantId, user.tenantId),
      eq(authAuditLog.eventType, "field_change"),
      sql`${authAuditLog.metadata}->>'entityType' = ${entityType}`,
      sql`${authAuditLog.metadata}->>'entityId' = ${entityId}`,
    ];

    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) {
      conditions.push(
        cursorCondition(authAuditLog.createdAt, authAuditLog.id, parsedCursor)
      );
    }

    const results = await db
      .select()
      .from(authAuditLog)
      .where(and(...conditions))
      .orderBy(desc(authAuditLog.createdAt), desc(authAuditLog.id))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor =
      hasMore && data.length > 0
        ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id)
        : undefined;

    // Transform into a cleaner response shape
    const changes = data.map((row) => {
      const meta = (row.metadata ?? {}) as Record<string, unknown>;
      return {
        id: row.id,
        userId: row.userId,
        field: meta.field ?? null,
        oldValue: meta.oldValue ?? null,
        newValue: meta.newValue ?? null,
        changedAt: row.createdAt,
      };
    });

    return NextResponse.json({
      data: changes,
      meta: { cursor: nextCursor, hasMore },
    });
  } catch (error) {
    console.error("[audit-trail] Error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
