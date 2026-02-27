import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { glAccounts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createGlAccountSchema } from "@/lib/master-data-management/validation";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "finance:read"))) return forbiddenResponse();

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const accountType = url.searchParams.get("accountType") || "";
  const active = url.searchParams.get("active");
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

  const conditions = [eq(glAccounts.tenantId, user.tenantId), isNull(glAccounts.deletedAt)];
  if (search) conditions.push(ilike(glAccounts.name, `%${search}%`));
  if (accountType) conditions.push(eq(glAccounts.accountType, accountType));
  if (active === "true") conditions.push(eq(glAccounts.isActive, true));
  if (active === "false") conditions.push(eq(glAccounts.isActive, false));
  if (cursor) conditions.push(gt(glAccounts.createdAt, new Date(cursor)));

  const results = await db.select().from(glAccounts).where(and(...conditions))
    .orderBy(desc(glAccounts.createdAt)).limit(limit + 1);

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
  const parsed = createGlAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
      { status: 422 }
    );
  }

  const [created] = await db.insert(glAccounts).values({
    tenantId: user.tenantId,
    ...parsed.data,
  }).returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
