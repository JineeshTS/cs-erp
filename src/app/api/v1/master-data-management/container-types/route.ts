import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { containerTypes } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createContainerTypeSchema } from "@/lib/master-data-management/validation";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "containers:read"))) return forbiddenResponse();

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const sizeType = url.searchParams.get("sizeType") || "";
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

  const conditions = [eq(containerTypes.tenantId, user.tenantId), isNull(containerTypes.deletedAt)];
  if (search) conditions.push(ilike(containerTypes.description, `%${search}%`));
  if (status) conditions.push(eq(containerTypes.status, status));
  if (sizeType) conditions.push(eq(containerTypes.sizeType, sizeType));
  if (cursor) conditions.push(gt(containerTypes.createdAt, new Date(cursor)));

  const results = await db.select().from(containerTypes).where(and(...conditions))
    .orderBy(desc(containerTypes.createdAt)).limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

  return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "containers:create"))) return forbiddenResponse();

  const body = await request.json();
  const parsed = createContainerTypeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
      { status: 422 }
    );
  }

  const [created] = await db.insert(containerTypes).values({
    tenantId: user.tenantId,
    ...parsed.data,
    lengthFt: parsed.data.lengthFt?.toString(),
    widthFt: parsed.data.widthFt?.toString(),
    heightFt: parsed.data.heightFt?.toString(),
    tareWeightKg: parsed.data.tareWeightKg?.toString(),
    maxPayloadKg: parsed.data.maxPayloadKg?.toString(),
    cubicCapacityCbm: parsed.data.cubicCapacityCbm?.toString(),
  }).returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
