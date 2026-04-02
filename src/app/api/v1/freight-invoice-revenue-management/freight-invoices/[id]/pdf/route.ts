import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { firmFreightInvoices, firmInvoiceLineItems, tenants } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { renderPdfToBuffer } from "@/lib/pdf/renderer";
import { FreightInvoicePdf } from "@/lib/pdf/templates/freight-invoice";
import type { FreightInvoiceData } from "@/lib/pdf/templates/freight-invoice";
import React from "react";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:read")))
      return forbiddenResponse();

    const { id } = await params;

    // Fetch invoice
    const [invoice] = await db
      .select()
      .from(firmFreightInvoices)
      .where(
        and(
          eq(firmFreightInvoices.id, id),
          eq(firmFreightInvoices.tenantId, user.tenantId),
          isNull(firmFreightInvoices.deletedAt)
        )
      )
      .limit(1);

    if (!invoice) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Freight invoice not found" } },
        { status: 404 }
      );
    }

    // Fetch line items
    const lineItems = await db
      .select()
      .from(firmInvoiceLineItems)
      .where(
        and(
          eq(firmInvoiceLineItems.invoiceId, id),
          eq(firmInvoiceLineItems.tenantId, user.tenantId),
          isNull(firmInvoiceLineItems.deletedAt)
        )
      );

    // Fetch tenant name
    const [tenant] = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1);

    const data: FreightInvoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceType: invoice.invoiceType,
      customerName: invoice.customerName,
      customerCode: invoice.customerCode ?? undefined,
      billingAddress: invoice.billingAddress ?? undefined,
      currency: invoice.currency,
      lineItems: lineItems.map((li) => ({
        lineNumber: li.lineNumber,
        chargeCode: li.chargeCode,
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        amount: li.amount,
        taxAmount: li.taxAmount,
        totalAmount: li.totalAmount,
        currency: li.currency,
      })),
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      outstandingAmount: invoice.outstandingAmount,
      paymentTerms: invoice.paymentTerms ?? undefined,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-GB") : undefined,
      issuedAt: invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString("en-GB") : undefined,
      blNumber: invoice.blNumber ?? undefined,
      voyageRef: invoice.voyageRef ?? undefined,
      bookingRef: invoice.bookingRef ?? undefined,
      notes: invoice.notes ?? undefined,
      companyName: tenant?.name ?? undefined,
    };

    const pdfBytes = await renderPdfToBuffer(
      React.createElement(FreightInvoicePdf, { data })
    );

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
        "Content-Length": String(pdfBytes.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to generate freight invoice PDF:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
