import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { costCentres } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCostCentreSchema } from "@/lib/master-data-management/validation";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "finance:read"))) return forbiddenResponse();

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const department = url.searchParams.get("department") || "";
  const active = url.searchParams.get("active");
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

  const conditions = [eq(costCentres.tenantId, user.tenantId), isNull(costCentres.deletedAt)];
  if (search) conditions.push(ilike(costCentres.name, `%${search}%`));
  if (department) conditions.push(eq(costCentres.department, department));
  if (active === "true") conditions.push(eq(costCentres.isActive, true));
  if (active === "false") conditions.push(eq(costCentres.isActive, false));
  if (cursor) conditions.push(gt(costCentres.createdAt, new Date(cursor)));

  const results = await db.select().from(costCentres).where(and(...conditions))
    .orderBy(desc(costCentres.createdAt)).limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

  return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "finance:create"))) return forbiddenResponse();

  const body = await request.json();
  const parsed = createCostCentreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
      { status: 422 }
    );
  }

  const [created] = await db.insert(costCentres).values({
    tenantId: user.tenantId,
    ...parsed.data,
  }).returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
