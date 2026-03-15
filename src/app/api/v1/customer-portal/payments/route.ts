import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cspPortalPayments, cspPaymentTransactions } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listPayments, getInvoice } from "@/lib/customer-portal/service";
import { createPaymentSchema } from "@/lib/customer-portal/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "portal:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || undefined;
    const cursor = url.searchParams.get("cursor") || undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const result = await listPayments({
      tenantId: user.tenantId,
      search,
      status,
      cursor,
      limit,
    });

    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list payments:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "portal:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    // Verify the invoice exists and belongs to this tenant
    const invoice = await getInvoice(parsed.data.invoiceId, user.tenantId);
    if (!invoice) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Invoice not found" } },
        { status: 404 }
      );
    }

    const paymentRef = `PAY-${Date.now()}`;
    const customerId = invoice.customerId;

    const [payment] = await db.insert(cspPortalPayments).values({
      tenantId: user.tenantId,
      paymentRef,
      invoiceId: parsed.data.invoiceId,
      customerId,
      amount: parsed.data.amount,
      currency: parsed.data.currency ?? invoice.currency,
      paymentMethod: parsed.data.paymentMethod,
      gatewayProvider: parsed.data.gatewayProvider,
      status: "pending",
      notes: parsed.data.notes,
      metadata: parsed.data.metadata,
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "payments", entityId: payment?.id, module: "customer-portal", newData: payment as Record<string, unknown>, request });

    // Create initial transaction record
    const transactionRef = `TXN-${Date.now()}`;
    await db.insert(cspPaymentTransactions).values({
      tenantId: user.tenantId,
      paymentId: payment.id,
      transactionRef,
      transactionType: "charge",
      amount: parsed.data.amount,
      currency: parsed.data.currency ?? invoice.currency,
      status: "pending",
    });

    return NextResponse.json(
      { data: { paymentId: payment.id, paymentRef: payment.paymentRef, status: "pending" } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create payment:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
