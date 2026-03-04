import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getGoLiveChecklist } from "@/lib/implementation-change-management/service";
import { updateGoLiveChecklistSchema } from "@/lib/implementation-change-management/validation";
import { db } from "@/lib/db";
import { icmGoLiveChecklists } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "icm:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getGoLiveChecklist(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Go-live checklist not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get go-live checklist:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "icm:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getGoLiveChecklist(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Go-live checklist not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateGoLiveChecklistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(icmGoLiveChecklists)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(icmGoLiveChecklists.id, id), eq(icmGoLiveChecklists.tenantId, user.tenantId)))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update go-live checklist:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "icm:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getGoLiveChecklist(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Go-live checklist not found" } },
        { status: 404 }
      );
    }

    const [deleted] = await db.update(icmGoLiveChecklists)
      .set({ deletedAt: new Date() })
      .where(and(eq(icmGoLiveChecklists.id, id), eq(icmGoLiveChecklists.tenantId, user.tenantId)))
      .returning();

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete go-live checklist:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
