import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { dmsSearchIndex } from "@/db/schema";
import { updateSearchIndexSchema } from "@/lib/document-management-system/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(dmsSearchIndex)
      .where(
        and(
          eq(dmsSearchIndex.id, id),
          eq(dmsSearchIndex.tenantId, user.tenantId),
          isNull(dmsSearchIndex.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Search index entry not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Search index get error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch search index entry" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSearchIndexSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.indexStatus === "completed") {
      updateData.lastIndexedAt = new Date();
    }

    const [updated] = await db
      .update(dmsSearchIndex)
      .set(updateData)
      .where(
        and(
          eq(dmsSearchIndex.id, id),
          eq(dmsSearchIndex.tenantId, user.tenantId),
          isNull(dmsSearchIndex.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Search index entry not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Search index update error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update search index entry" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db
      .update(dmsSearchIndex)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(dmsSearchIndex.id, id),
          eq(dmsSearchIndex.tenantId, user.tenantId),
          isNull(dmsSearchIndex.deletedAt)
        )
      )
      .returning({ id: dmsSearchIndex.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Search index entry not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    console.error("Search index delete error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete search index entry" } },
      { status: 500 }
    );
  }
}
