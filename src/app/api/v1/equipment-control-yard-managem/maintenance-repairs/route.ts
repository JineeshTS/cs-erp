import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyMaintenanceRepairs } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createMaintenanceRepairSchema } from "@/lib/equipment-control-yard-managem/validation";

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
      eq(eqyMaintenanceRepairs.tenantId, user.tenantId),
      isNull(eqyMaintenanceRepairs.deletedAt),
    ];
    if (search) conditions.push(ilike(eqyMaintenanceRepairs.mnrReference, `%${search}%`));
    if (status) conditions.push(eq(eqyMaintenanceRepairs.status, status));
    if (cursor) conditions.push(gt(eqyMaintenanceRepairs.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(eqyMaintenanceRepairs)
      .where(and(...conditions))
      .orderBy(desc(eqyMaintenanceRepairs.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list maintenance repairs:", error);
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

    const body = await request.json();
    const parsed = createMaintenanceRepairSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { inspectionDate, repairStartDate, repairCompleteDate, ...rest } = parsed.data;

    const [created] = await db
      .insert(eqyMaintenanceRepairs)
      .values({
        tenantId: user.tenantId,
        ...rest,
        ...(inspectionDate && { inspectionDate: new Date(inspectionDate) }),
        ...(repairStartDate && { repairStartDate: new Date(repairStartDate) }),
        ...(repairCompleteDate && { repairCompleteDate: new Date(repairCompleteDate) }),
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create maintenance repair:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
