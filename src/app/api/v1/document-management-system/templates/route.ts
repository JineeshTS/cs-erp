import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { dmsDocumentTemplates } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createDocumentTemplateSchema } from "@/lib/document-management-system/validation";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "templates:read"))) return forbiddenResponse();

  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(dmsDocumentTemplates.tenantId, user.tenantId), isNull(dmsDocumentTemplates.deletedAt)];
    if (search) conditions.push(ilike(dmsDocumentTemplates.name, `%${search}%`));
    if (cursor) conditions.push(gt(dmsDocumentTemplates.createdAt, new Date(cursor)));

    const results = await db.select().from(dmsDocumentTemplates)
      .where(and(...conditions))
      .orderBy(desc(dmsDocumentTemplates.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("List document templates error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to list document templates" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "templates:create"))) return forbiddenResponse();

  try {
    const body = await request.json();
    const parsed = createDocumentTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [created] = await db.insert(dmsDocumentTemplates).values({
      tenantId: user.tenantId,
      ...parsed.data,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Create document template error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create document template" } },
      { status: 500 }
    );
  }
}
