import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmHireStatements } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createHireStatementSchema } from "@/lib/chartering-vessel-management/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const charterPartyId = url.searchParams.get("charterPartyId") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(cvmHireStatements.tenantId, user.tenantId),
      isNull(cvmHireStatements.deletedAt),
    ];
    if (search) conditions.push(ilike(cvmHireStatements.statementNumber, `%${search}%`));
    if (status) conditions.push(eq(cvmHireStatements.status, status));
    if (charterPartyId) conditions.push(eq(cvmHireStatements.charterPartyId, charterPartyId));
    if (cursor) conditions.push(gt(cvmHireStatements.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(cvmHireStatements)
      .where(and(...conditions))
      .orderBy(desc(cvmHireStatements.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list hire statements:", error);
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

    const body = await request.json();
    const parsed = createHireStatementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { periodFrom, periodTo, hireDays, ...rest } = parsed.data;

    const [created] = await db
      .insert(cvmHireStatements)
      .values({
        tenantId: user.tenantId,
        ...rest,
        periodFrom: new Date(periodFrom),
        periodTo: new Date(periodTo),
        hireDays: hireDays.toString(),
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create hire statement:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
