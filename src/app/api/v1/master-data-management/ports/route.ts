import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { ports } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createPortSchema } from "@/lib/master-data-management/validation";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "vessels:read"))) return forbiddenResponse();

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const country = url.searchParams.get("country") || "";
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

  const conditions = [eq(ports.tenantId, user.tenantId), isNull(ports.deletedAt)];
  if (search) conditions.push(ilike(ports.name, `%${search}%`));
  if (status) conditions.push(eq(ports.status, status));
  if (country) conditions.push(eq(ports.country, country));
  if (cursor) conditions.push(gt(ports.createdAt, new Date(cursor)));

  const results = await db.select().from(ports).where(and(...conditions))
    .orderBy(desc(ports.createdAt)).limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

  return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "vessels:create"))) return forbiddenResponse();

  const body = await request.json();
  const parsed = createPortSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
      { status: 422 }
    );
  }

  const [created] = await db.insert(ports).values({
    tenantId: user.tenantId,
    ...parsed.data,
    latitude: parsed.data.latitude?.toString(),
    longitude: parsed.data.longitude?.toString(),
  }).returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
