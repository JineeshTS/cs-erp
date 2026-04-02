import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { db } from "@/lib/db";
import { firmFreightInvoices } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listFreightInvoices } from "@/lib/freight-invoice-revenue-management/service";
import { createFreightInvoiceSchema } from "@/lib/freight-invoice-revenue-management/validation";
import { eventBus } from "@/lib/events/event-bus";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";
import { generateNextNumber } from "@/lib/number-sequence";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "invoice:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const cursor = url.searchParams.get("cursor") || undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const result = await listFreightInvoices({
      tenantId: user.tenantId,
      search,
      status,
      cursor,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list freight invoices:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "invoice:create"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createFreightInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const invoiceNumber = await generateNextNumber("invoice", user.tenantId);

    const [created] = await db.insert(firmFreightInvoices).values({
      tenantId: user.tenantId,
      invoiceNumber,
      ...parsed.data,
      paidAmount: 0,
      outstandingAmount: parsed.data.totalAmount,
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "freight-invoices", entityId: created.id, module: "freight-invoice-revenue-management", newData: created as Record<string, unknown>, request });

    eventBus.emit({
      type: "INVOICE_GENERATED",
      tenantId: user.tenantId,
      userId: user.id,
      entityId: created.id,
      entityType: "invoice",
      timestamp: new Date(),
      data: {
        invoiceNumber,
        customerId: parsed.data.customerCode ?? "",
        amount: parsed.data.totalAmount,
        currency: parsed.data.currency ?? "USD",
        dueDate: (parsed.data.dueDate ?? created.dueDate)?.toISOString() ?? "",
        bookingId: parsed.data.bookingRef,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create freight invoice:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
