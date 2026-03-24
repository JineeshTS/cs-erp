import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { dmsDocumentSignatures } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { actionSignatureSchema } from "@/lib/document-management-system/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(dmsDocumentSignatures)
      .where(and(eq(dmsDocumentSignatures.id, id), eq(dmsDocumentSignatures.tenantId, user.tenantId), isNull(dmsDocumentSignatures.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Document signature not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get document signature:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:sign"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = actionSignatureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { action, signatureData, reason, ipAddress } = parsed.data;

    const updateData: Record<string, unknown> = {};

    if (action === "sign") {
      updateData.status = "signed";
      updateData.signedAt = new Date();
      if (signatureData) updateData.signatureData = signatureData;
      if (ipAddress) updateData.ipAddress = ipAddress;
    } else if (action === "reject") {
      updateData.status = "rejected";
    } else if (action === "revoke") {
      updateData.status = "revoked";
    }

    if (reason) updateData.reason = reason;

    const [updated] = await db.update(dmsDocumentSignatures).set(updateData)
      .where(and(eq(dmsDocumentSignatures.id, id), eq(dmsDocumentSignatures.tenantId, user.tenantId), isNull(dmsDocumentSignatures.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Document signature not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "signatures", entityId: updated.id, module: "document-management-system", previousData: null, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update document signature:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:delete"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const [deleted] = await db.update(dmsDocumentSignatures).set({ deletedAt: new Date() })
      .where(and(eq(dmsDocumentSignatures.id, id), eq(dmsDocumentSignatures.tenantId, user.tenantId), isNull(dmsDocumentSignatures.deletedAt))).returning({ id: dmsDocumentSignatures.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Document signature not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "signatures", entityId: deleted.id, module: "document-management-system", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete document signature:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
