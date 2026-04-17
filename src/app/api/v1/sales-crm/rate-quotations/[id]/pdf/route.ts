import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  scmRateQuotations,
  scmQuotationLineItems,
  scmCustomers,
  tenants,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { renderPdfToBuffer } from "@/lib/pdf/renderer";
import { QuotationPdf } from "@/lib/pdf/templates/quotation";
import type { QuotationData } from "@/lib/pdf/templates/quotation";
import React from "react";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:read")))
      return forbiddenResponse();

    const { id } = await params;

    // Fetch quotation
    const [quotation] = await db
      .select()
      .from(scmRateQuotations)
      .where(
        and(
          eq(scmRateQuotations.id, id),
          eq(scmRateQuotations.tenantId, user.tenantId),
          isNull(scmRateQuotations.deletedAt)
        )
      )
      .limit(1);

    if (!quotation) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Quotation not found" } },
        { status: 404 }
      );
    }

    // Fetch line items
    const lineItems = await db
      .select()
      .from(scmQuotationLineItems)
      .where(
        and(
          eq(scmQuotationLineItems.quotationId, id),
          eq(scmQuotationLineItems.tenantId, user.tenantId),
          isNull(scmQuotationLineItems.deletedAt)
        )
      );

    // Fetch customer name
    const [customer] = quotation.customerId
      ? await db
          .select({ companyName: scmCustomers.companyName })
          .from(scmCustomers)
          .where(eq(scmCustomers.id, quotation.customerId))
          .limit(1)
      : [null];

    // Fetch tenant name (company branding)
    const [tenant] = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1);

    // Build data
    const data: QuotationData = {
      quotationNumber: quotation.quotationNumber,
      status: quotation.status ?? "draft",
      companyName: tenant?.name ?? undefined,
      customerName: customer?.companyName ?? "Unknown Customer",
      originPort: quotation.originPort,
      destinationPort: quotation.destinationPort,
      tradeLane: quotation.tradeLane ?? undefined,
      serviceType: quotation.serviceType ?? undefined,
      containerType: quotation.containerType ?? undefined,
      containerSize: quotation.containerSize ?? undefined,
      estimatedTeu: quotation.estimatedTeu ?? undefined,
      totalAmount: quotation.totalAmount ?? undefined,
      currency: quotation.currency ?? "USD",
      validFrom: quotation.validFrom
        ? new Date(quotation.validFrom).toLocaleDateString("en-GB")
        : "-",
      validTo: quotation.validTo
        ? new Date(quotation.validTo).toLocaleDateString("en-GB")
        : "-",
      transitTimeDays: quotation.transitTimeDays ?? undefined,
      freeTimeDays: quotation.freeTimeDays ?? undefined,
      incoterm: quotation.incoterm ?? undefined,
      notes: quotation.notes ?? undefined,
      lineItems: lineItems.map((li) => ({
        chargeCode: li.chargeCode,
        chargeName: li.chargeName,
        chargeType: li.chargeType,
        basis: li.basis,
        unitPrice: li.unitPrice,
        quantity: li.quantity,
        totalPrice: li.totalPrice,
        currency: li.currency ?? "USD",
      })),
    };

    // Render PDF
    const pdfBytes = await renderPdfToBuffer(
      React.createElement(QuotationPdf, { data })
    );

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Quotation-${quotation.quotationNumber}.pdf"`,
        "Content-Length": String(pdfBytes.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to generate quotation PDF:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
