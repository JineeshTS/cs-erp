import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { firmDebitCreditNotes } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateDebitCreditNoteSchema } from "@/lib/freight-invoice-revenue-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "invoice:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(firmDebitCreditNotes)
      .where(and(
        eq(firmDebitCreditNotes.id, id),
        eq(firmDebitCreditNotes.tenantId, user.tenantId),
        isNull(firmDebitCreditNotes.deletedAt)
      )).limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Debit/credit note not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get debit/credit note:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "invoice:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateDebitCreditNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(firmDebitCreditNotes).set(parsed.data)
      .where(and(
        eq(firmDebitCreditNotes.id, id),
        eq(firmDebitCreditNotes.tenantId, user.tenantId),
        isNull(firmDebitCreditNotes.deletedAt)
      )).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "debit-credit-notes", entityId: updated?.id, module: "freight-invoice-revenue-management", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Debit/credit note not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update debit/credit note:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "invoice:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const [deleted] = await db.update(firmDebitCreditNotes).set({ deletedAt: new Date() })
      .where(and(
        eq(firmDebitCreditNotes.id, id),
        eq(firmDebitCreditNotes.tenantId, user.tenantId),
        isNull(firmDebitCreditNotes.deletedAt)
      )).returning({ id: firmDebitCreditNotes.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "debit-credit-notes", entityId: deleted?.id, module: "freight-invoice-revenue-management", previousData: null, request });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Debit/credit note not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete debit/credit note:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
