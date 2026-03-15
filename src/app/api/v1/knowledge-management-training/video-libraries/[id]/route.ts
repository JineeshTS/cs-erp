import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getVideoLibrary } from "@/lib/knowledge-management-training/service";
import { updateVideoLibrarySchema } from "@/lib/knowledge-management-training/validation";
import { db } from "@/lib/db";
import { kmtVideoLibraries } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "kmt:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getVideoLibrary(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Video library not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get video library:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "kmt:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getVideoLibrary(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Video library not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateVideoLibrarySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(kmtVideoLibraries)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(kmtVideoLibraries.id, id), eq(kmtVideoLibraries.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "video-libraries", entityId: updated?.id, module: "knowledge-management-training", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update video library:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "kmt:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getVideoLibrary(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Video library not found" } },
        { status: 404 }
      );
    }

    const [deleted] = await db.update(kmtVideoLibraries)
      .set({ deletedAt: new Date() })
      .where(and(eq(kmtVideoLibraries.id, id), eq(kmtVideoLibraries.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "video-libraries", entityId: deleted?.id, module: "knowledge-management-training", previousData: existing as Record<string, unknown>, request });

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete video library:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
