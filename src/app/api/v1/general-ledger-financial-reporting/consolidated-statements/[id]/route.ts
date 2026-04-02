import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { glfrConsolidatedStatements } from "@/db/schema";
import { getConsolidatedStatement } from "@/lib/general-ledger-financial-reporting/service";
import { updateConsolidatedStatementSchema } from "@/lib/general-ledger-financial-reporting/validation";
import { eq, and, isNull } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "gl:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getConsolidatedStatement(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Consolidated statement not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get consolidated statement:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "gl:edit")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateConsolidatedStatementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [record] = await db
      .update(glfrConsolidatedStatements)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(glfrConsolidatedStatements.id, id), eq(glfrConsolidatedStatements.tenantId, user.tenantId), isNull(glfrConsolidatedStatements.deletedAt)))
      .returning();

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Consolidated statement not found" } },
        { status: 404 }
      );
    }

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "consolidated-statements", entityId: record.id, module: "general-ledger-financial-reporting", previousData: null, newData: record as Record<string, unknown>, request });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to update consolidated statement:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "gl:delete")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const [record] = await db
      .update(glfrConsolidatedStatements)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(glfrConsolidatedStatements.id, id), eq(glfrConsolidatedStatements.tenantId, user.tenantId), isNull(glfrConsolidatedStatements.deletedAt)))
      .returning();

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Consolidated statement not found" } },
        { status: 404 }
      );
    }

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "consolidated-statements", entityId: record.id, module: "general-ledger-financial-reporting", previousData: null, request });
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete consolidated statement:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
