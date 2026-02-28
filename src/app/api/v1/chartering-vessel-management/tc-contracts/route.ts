import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmTcContracts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createTcContractSchema } from "@/lib/chartering-vessel-management/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const direction = url.searchParams.get("direction") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(cvmTcContracts.tenantId, user.tenantId), isNull(cvmTcContracts.deletedAt)];
    if (search) conditions.push(ilike(cvmTcContracts.counterpartyName, `%${search}%`));
    if (direction) conditions.push(eq(cvmTcContracts.direction, direction));
    if (status) conditions.push(eq(cvmTcContracts.status, status));
    if (cursor) conditions.push(gt(cvmTcContracts.createdAt, new Date(cursor)));

    const results = await db.select().from(cvmTcContracts)
      .where(and(...conditions))
      .orderBy(desc(cvmTcContracts.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list TC contracts:", error);
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
    const parsed = createTcContractSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { deliveryDate, redeliveryDate, commissionPercent, ...rest } = parsed.data;

    const [created] = await db.insert(cvmTcContracts).values({
      tenantId: user.tenantId,
      ...rest,
      ...(deliveryDate !== undefined && { deliveryDate: new Date(deliveryDate) }),
      ...(redeliveryDate !== undefined && { redeliveryDate: new Date(redeliveryDate) }),
      ...(commissionPercent !== undefined && { commissionPercent: commissionPercent.toString() }),
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create TC contract:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
