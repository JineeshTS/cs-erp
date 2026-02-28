import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { melsLocaleConfigs } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createLocaleConfigSchema } from "@/lib/multi-entity-legal-structure/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "entities:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);
    const language = url.searchParams.get("language");
    const direction = url.searchParams.get("direction");
    const isActive = url.searchParams.get("isActive");

    const conditions = [eq(melsLocaleConfigs.tenantId, user.tenantId), isNull(melsLocaleConfigs.deletedAt)];
    if (search) conditions.push(ilike(melsLocaleConfigs.localeName, `%${search}%`));
    if (language) conditions.push(eq(melsLocaleConfigs.language, language));
    if (direction) conditions.push(eq(melsLocaleConfigs.direction, direction));
    if (isActive !== null && isActive !== undefined && isActive !== "") conditions.push(eq(melsLocaleConfigs.isActive, isActive === "true"));
    if (cursor) conditions.push(gt(melsLocaleConfigs.createdAt, new Date(cursor)));

    const results = await db.select().from(melsLocaleConfigs).where(and(...conditions))
      .orderBy(desc(melsLocaleConfigs.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list locale configs:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "entities:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createLocaleConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [created] = await db.insert(melsLocaleConfigs).values({
      tenantId: user.tenantId,
      ...parsed.data,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create locale config:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
