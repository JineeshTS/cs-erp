import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCustomerSchema } from "@/lib/master-data-management/validation";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "bookings:read"))) return forbiddenResponse();

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const customerType = url.searchParams.get("customerType") || "";
  const country = url.searchParams.get("country") || "";
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

  const conditions = [eq(customers.tenantId, user.tenantId), isNull(customers.deletedAt)];
  if (search) conditions.push(ilike(customers.name, `%${search}%`));
  if (status) conditions.push(eq(customers.status, status));
  if (customerType) conditions.push(eq(customers.customerType, customerType));
  if (country) conditions.push(eq(customers.country, country));
  if (cursor) conditions.push(gt(customers.createdAt, new Date(cursor)));

  const results = await db.select().from(customers).where(and(...conditions))
    .orderBy(desc(customers.createdAt)).limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

  return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "bookings:create"))) return forbiddenResponse();

  const body = await request.json();
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
      { status: 422 }
    );
  }

  const [created] = await db.insert(customers).values({
    tenantId: user.tenantId,
    ...parsed.data,
  }).returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
