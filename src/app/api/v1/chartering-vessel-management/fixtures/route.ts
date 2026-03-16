import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, lt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmFixtures } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createFixtureSchema } from "@/lib/chartering-vessel-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const fixtureType = url.searchParams.get("fixtureType") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(cvmFixtures.tenantId, user.tenantId), isNull(cvmFixtures.deletedAt)];
    if (search) conditions.push(ilike(cvmFixtures.counterpartyName, `%${search}%`));
    if (fixtureType) conditions.push(eq(cvmFixtures.fixtureType, fixtureType));
    if (status) conditions.push(eq(cvmFixtures.status, status));
    if (cursor) conditions.push(lt(cvmFixtures.createdAt, new Date(cursor)));

    const results = await db.select().from(cvmFixtures)
      .where(and(...conditions))
      .orderBy(desc(cvmFixtures.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list fixtures:", error);
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

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createFixtureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { laycanFrom, laycanTo, commissionPercent, ...rest } = parsed.data;

    const [created] = await db.insert(cvmFixtures).values({
      tenantId: user.tenantId,
      ...rest,
      ...(laycanFrom !== undefined && { laycanFrom: new Date(laycanFrom) }),
      ...(laycanTo !== undefined && { laycanTo: new Date(laycanTo) }),
      ...(commissionPercent !== undefined && { commissionPercent: commissionPercent.toString() }),
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "fixtures", entityId: created?.id, module: "chartering-vessel-management", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create fixture:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
