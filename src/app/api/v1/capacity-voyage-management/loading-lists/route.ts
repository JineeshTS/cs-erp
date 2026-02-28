import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { capLoadingLists } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createLoadingListSchema } from "@/lib/capacity-voyage-management/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "capacity:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(capLoadingLists.tenantId, user.tenantId),
      isNull(capLoadingLists.deletedAt),
    ];
    if (search) conditions.push(ilike(capLoadingLists.listReference, `%${search}%`));
    if (status) conditions.push(eq(capLoadingLists.status, status));
    if (cursor) conditions.push(gt(capLoadingLists.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(capLoadingLists)
      .where(and(...conditions))
      .orderBy(desc(capLoadingLists.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list loading lists:", error);
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

    const body = await request.json();
    const parsed = createLoadingListSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { cutOffCargo, cutOffDocumentation, cutOffVgm, ...rest } = parsed.data;

    const [created] = await db
      .insert(capLoadingLists)
      .values({
        tenantId: user.tenantId,
        ...rest,
        ...(cutOffCargo && { cutOffCargo: new Date(cutOffCargo) }),
        ...(cutOffDocumentation && { cutOffDocumentation: new Date(cutOffDocumentation) }),
        ...(cutOffVgm && { cutOffVgm: new Date(cutOffVgm) }),
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create loading list:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
