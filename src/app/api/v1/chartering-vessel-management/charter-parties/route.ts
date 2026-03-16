import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, lt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmCharterParties } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCharterPartySchema } from "@/lib/chartering-vessel-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const charterType = url.searchParams.get("charterType") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(cvmCharterParties.tenantId, user.tenantId),
      isNull(cvmCharterParties.deletedAt),
    ];
    if (search) conditions.push(ilike(cvmCharterParties.chartererName, `%${search}%`));
    if (charterType) conditions.push(eq(cvmCharterParties.charterType, charterType));
    if (status) conditions.push(eq(cvmCharterParties.status, status));
    if (cursor) conditions.push(lt(cvmCharterParties.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(cvmCharterParties)
      .where(and(...conditions))
      .orderBy(desc(cvmCharterParties.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list charter parties:", error);
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
    const parsed = createCharterPartySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { laycanFrom, laycanTo, commencedAt, terminatedAt, commissionPercent, ...rest } = parsed.data;

    const [created] = await db
      .insert(cvmCharterParties)
      .values({
        tenantId: user.tenantId,
        ...rest,
        ...(laycanFrom && { laycanFrom: new Date(laycanFrom) }),
        ...(laycanTo && { laycanTo: new Date(laycanTo) }),
        ...(commencedAt && { commencedAt: new Date(commencedAt) }),
        ...(terminatedAt && { terminatedAt: new Date(terminatedAt) }),
        ...(commissionPercent !== undefined && { commissionPercent: commissionPercent.toString() }),
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "charter-parties", entityId: created?.id, module: "chartering-vessel-management", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create charter party:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
