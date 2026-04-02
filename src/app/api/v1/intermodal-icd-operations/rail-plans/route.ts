import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import crypto from "crypto";
import { db } from "@/lib/db";
import { icdRailPlans } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createRailPlanSchema } from "@/lib/intermodal-icd-operations/validation";
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm";
import { formatZodErrors , escapeIlike } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "intermodal:read"))) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const cursor = searchParams.get("cursor") ?? "";
    const limit = 50;

    const conditions = [
      eq(icdRailPlans.tenantId, user.tenantId),
      isNull(icdRailPlans.deletedAt),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(icdRailPlans.railPlanRef, `%${escapeIlike(search)}%`),
          ilike(icdRailPlans.trainNumber, `%${escapeIlike(search)}%`),
          ilike(icdRailPlans.trainOperator, `%${escapeIlike(search)}%`)
        )!
      );
    }

    if (status) {
      conditions.push(eq(icdRailPlans.status, status));
    }

    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) {
      conditions.push(cursorCondition(icdRailPlans.createdAt, icdRailPlans.id, parsedCursor));
    }

    const results = await db
      .select()
      .from(icdRailPlans)
      .where(and(...conditions))
      .orderBy(desc(icdRailPlans.createdAt), desc(icdRailPlans.id))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({
      data,
      meta: {
        cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Failed to list rail plans:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "intermodal:create"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createRailPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const railPlanRef = `IRP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await db
      .insert(icdRailPlans)
      .values({
        ...parsed.data,
        railPlanRef,
        tenantId: user.tenantId,
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "rail-plans", entityId: created.id, module: "intermodal-icd-operations", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create rail plan:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
