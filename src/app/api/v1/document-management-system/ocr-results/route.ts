import { NextRequest, NextResponse } from "next/server";
import { eq, and, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { dmsOcrResults } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createOcrResultSchema } from "@/lib/document-management-system/validation";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "documents:read"))) return forbiddenResponse();

  try {
    const url = new URL(request.url);
    const documentId = url.searchParams.get("documentId") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(dmsOcrResults.tenantId, user.tenantId), isNull(dmsOcrResults.deletedAt)];
    if (documentId) conditions.push(eq(dmsOcrResults.documentId, documentId));
    if (cursor) conditions.push(gt(dmsOcrResults.createdAt, new Date(cursor)));

    const results = await db.select().from(dmsOcrResults)
      .where(and(...conditions))
      .orderBy(desc(dmsOcrResults.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("List OCR results error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to list OCR results" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "documents:read"))) return forbiddenResponse();

  try {
    const body = await request.json();
    const parsed = createOcrResultSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [created] = await db.insert(dmsOcrResults).values({
      tenantId: user.tenantId,
      status: "pending",
      ...parsed.data,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Create OCR result error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create OCR result" } },
      { status: 500 }
    );
  }
}
