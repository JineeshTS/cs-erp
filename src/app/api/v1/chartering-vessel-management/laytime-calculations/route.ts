import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, ilike, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmLaytimeCalculations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createLaytimeCalculationSchema } from "@/lib/chartering-vessel-management/validation";
import { formatZodErrors , escapeIlike } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const operationType = url.searchParams.get("operationType") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(cvmLaytimeCalculations.tenantId, user.tenantId),
      isNull(cvmLaytimeCalculations.deletedAt),
    ];
    if (search) conditions.push(ilike(cvmLaytimeCalculations.portName, `%${escapeIlike(search)}%`));
    if (operationType) conditions.push(eq(cvmLaytimeCalculations.operationType, operationType));
    if (status) conditions.push(eq(cvmLaytimeCalculations.status, status));
    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(cvmLaytimeCalculations.createdAt, cvmLaytimeCalculations.id, parsedCursor));

    const results = await db
      .select()
      .from(cvmLaytimeCalculations)
      .where(and(...conditions))
      .orderBy(desc(cvmLaytimeCalculations.createdAt), desc(cvmLaytimeCalculations.id))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list laytime calculations:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "chartering:create"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createLaytimeCalculationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { allowedHours, usedHours, excessHours, commencedAt, completedAt, ...rest } = parsed.data;

    const [created] = await db
      .insert(cvmLaytimeCalculations)
      .values({
        tenantId: user.tenantId,
        ...rest,
        allowedHours: allowedHours.toString(),
        usedHours: usedHours.toString(),
        ...(excessHours !== undefined && { excessHours: excessHours.toString() }),
        ...(commencedAt && { commencedAt: new Date(commencedAt) }),
        ...(completedAt && { completedAt: new Date(completedAt) }),
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "laytime-calculations", entityId: created.id, module: "chartering-vessel-management", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create laytime calculation:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
