import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { dmsDocumentTemplates } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateDocumentTemplateSchema } from "@/lib/document-management-system/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "templates:read"))) return forbiddenResponse();

  try {
    const { id } = await params;
    const [record] = await db.select().from(dmsDocumentTemplates)
      .where(and(
        eq(dmsDocumentTemplates.id, id),
        eq(dmsDocumentTemplates.tenantId, user.tenantId),
        isNull(dmsDocumentTemplates.deletedAt)
      )).limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Document template not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Get document template error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch document template" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "templates:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateDocumentTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(dmsDocumentTemplates).set(parsed.data)
      .where(and(
        eq(dmsDocumentTemplates.id, id),
        eq(dmsDocumentTemplates.tenantId, user.tenantId),
        isNull(dmsDocumentTemplates.deletedAt)
      )).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "templates", entityId: updated?.id, module: "document-management-system", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Document template not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Update document template error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update document template" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "templates:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

  try {
    const { id } = await params;
    const [deleted] = await db.update(dmsDocumentTemplates).set({ deletedAt: new Date() })
      .where(and(
        eq(dmsDocumentTemplates.id, id),
        eq(dmsDocumentTemplates.tenantId, user.tenantId),
        isNull(dmsDocumentTemplates.deletedAt)
      )).returning({ id: dmsDocumentTemplates.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "templates", entityId: deleted?.id, module: "document-management-system", previousData: null, request });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Document template not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    console.error("Delete document template error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete document template" } },
      { status: 500 }
    );
  }
}
