import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, lt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyLeasedContainers } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createLeasedContainerSchema } from "@/lib/equipment-control-yard-managem/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

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

    const conditions = [
      eq(eqyLeasedContainers.tenantId, user.tenantId),
      isNull(eqyLeasedContainers.deletedAt),
    ];
    if (search) conditions.push(ilike(eqyLeasedContainers.leaseReference, `%${search}%`));
    if (status) conditions.push(eq(eqyLeasedContainers.status, status));
    if (cursor) conditions.push(lt(eqyLeasedContainers.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(eqyLeasedContainers)
      .where(and(...conditions))
      .orderBy(desc(eqyLeasedContainers.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list leased containers:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "equipment:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createLeasedContainerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { leaseStartDate, leaseEndDate, ...rest } = parsed.data;

    const [created] = await db
      .insert(eqyLeasedContainers)
      .values({
        tenantId: user.tenantId,
        ...rest,
        leaseStartDate: new Date(leaseStartDate),
        ...(leaseEndDate && { leaseEndDate: new Date(leaseEndDate) }),
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "leased-containers", entityId: created?.id, module: "equipment-control-yard-managem", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create leased container:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
