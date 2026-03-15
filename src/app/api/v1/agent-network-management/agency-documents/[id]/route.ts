import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getAgencyDocument } from "@/lib/agent-network-management/service";
import { updateAgencyDocumentSchema } from "@/lib/agent-network-management/validation";
import { db } from "@/lib/db";
import { anmAgencyDocuments } from "@/db/schema";
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
    if (!(await hasPermission(user.id, user.tenantId, "anm:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getAgencyDocument(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Agency document not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get agency document:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "anm:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getAgencyDocument(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Agency document not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateAgencyDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(anmAgencyDocuments)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(anmAgencyDocuments.id, id), eq(anmAgencyDocuments.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "agency-documents", entityId: updated?.id, module: "agent-network-management", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update agency document:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "anm:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getAgencyDocument(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Agency document not found" } },
        { status: 404 }
      );
    }

    const [deleted] = await db.update(anmAgencyDocuments)
      .set({ deletedAt: new Date() })
      .where(and(eq(anmAgencyDocuments.id, id), eq(anmAgencyDocuments.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "agency-documents", entityId: deleted?.id, module: "agent-network-management", previousData: existing as Record<string, unknown>, request });

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete agency document:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
