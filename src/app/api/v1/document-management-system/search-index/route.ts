import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, gt } from "drizzle-orm";
import { dmsSearchIndex } from "@/db/schema";
import { createSearchIndexSchema } from "@/lib/document-management-system/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const documentId = url.searchParams.get("documentId");
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(dmsSearchIndex.tenantId, user.tenantId), isNull(dmsSearchIndex.deletedAt)];
    if (documentId) conditions.push(eq(dmsSearchIndex.documentId, documentId));
    if (cursor) conditions.push(gt(dmsSearchIndex.createdAt, new Date(cursor)));

    const results = await db.select().from(dmsSearchIndex).where(and(...conditions))
      .orderBy(desc(dmsSearchIndex.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list search index entries:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "documents:read"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createSearchIndexSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [created] = await db.insert(dmsSearchIndex).values({
      tenantId: user.tenantId,
      indexStatus: "pending",
      ...parsed.data,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create search index entry:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
