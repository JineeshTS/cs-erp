import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { capPortRotations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createPortRotationSchema } from "@/lib/capacity-voyage-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "capacity:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const vesselScheduleId = url.searchParams.get("vesselScheduleId") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(capPortRotations.tenantId, user.tenantId),
      isNull(capPortRotations.deletedAt),
    ];
    if (search) conditions.push(ilike(capPortRotations.portName, `%${search}%`));
    if (status) conditions.push(eq(capPortRotations.status, status));
    if (vesselScheduleId) conditions.push(eq(capPortRotations.vesselScheduleId, vesselScheduleId));
    if (cursor) conditions.push(gt(capPortRotations.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(capPortRotations)
      .where(and(...conditions))
      .orderBy(desc(capPortRotations.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list port rotations:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "capacity:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createPortRotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { arrivalEta, departureEtd, actualArrival, actualDeparture, ...rest } = parsed.data;

    const [created] = await db
      .insert(capPortRotations)
      .values({
        tenantId: user.tenantId,
        ...rest,
        ...(arrivalEta && { arrivalEta: new Date(arrivalEta) }),
        ...(departureEtd && { departureEtd: new Date(departureEtd) }),
        ...(actualArrival && { actualArrival: new Date(actualArrival) }),
        ...(actualDeparture && { actualDeparture: new Date(actualDeparture) }),
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "port-rotations", entityId: created?.id, module: "capacity-voyage-management", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create port rotation:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
