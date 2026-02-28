import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmVoyageEstimates } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createVoyageEstimateSchema } from "@/lib/chartering-vessel-management/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(cvmVoyageEstimates.tenantId, user.tenantId),
      isNull(cvmVoyageEstimates.deletedAt),
    ];
    if (search) conditions.push(ilike(cvmVoyageEstimates.voyageNumber, `%${search}%`));
    if (status) conditions.push(eq(cvmVoyageEstimates.status, status));
    if (cursor) conditions.push(gt(cvmVoyageEstimates.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(cvmVoyageEstimates)
      .where(and(...conditions))
      .orderBy(desc(cvmVoyageEstimates.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list voyage estimates:", error);
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
    const parsed = createVoyageEstimateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { distanceNm, ...rest } = parsed.data;

    const [created] = await db
      .insert(cvmVoyageEstimates)
      .values({
        tenantId: user.tenantId,
        ...rest,
        ...(distanceNm !== undefined && { distanceNm: distanceNm.toString() }),
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create voyage estimate:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
