import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { odmBillsOfLading, odmBlContainers, tenants } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { renderPdfToBuffer } from "@/lib/pdf/renderer";
import { BillOfLadingPdf } from "@/lib/pdf/templates/bill-of-lading";
import type { BillOfLadingData } from "@/lib/pdf/templates/bill-of-lading";
import React from "react";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:read")))
      return forbiddenResponse();

    const { id } = await params;

    // Fetch BL record
    const [bl] = await db
      .select()
      .from(odmBillsOfLading)
      .where(
        and(
          eq(odmBillsOfLading.id, id),
          eq(odmBillsOfLading.tenantId, user.tenantId),
          isNull(odmBillsOfLading.deletedAt)
        )
      )
      .limit(1);

    if (!bl) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Bill of lading not found" } },
        { status: 404 }
      );
    }

    // Fetch associated containers
    const containers = await db
      .select()
      .from(odmBlContainers)
      .where(
        and(
          eq(odmBlContainers.blId, id),
          eq(odmBlContainers.tenantId, user.tenantId),
          isNull(odmBlContainers.deletedAt)
        )
      );

    // Fetch tenant name for company header
    const [tenant] = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1);

    // Build PDF data
    const data: BillOfLadingData = {
      blNumber: bl.blNumber,
      shipper: bl.shipperName,
      shipperAddress: bl.shipperAddress ?? undefined,
      consignee: bl.consigneeName,
      consigneeAddress: bl.consigneeAddress ?? undefined,
      notifyParty: bl.notifyPartyName ?? undefined,
      notifyPartyAddress: bl.notifyPartyAddress ?? undefined,
      vessel: bl.vesselName ?? undefined,
      voyage: bl.voyageNumber ?? undefined,
      portOfLoading: bl.portOfLoading ?? undefined,
      portOfDischarge: bl.portOfDischarge ?? undefined,
      placeOfReceipt: bl.placeOfReceipt ?? undefined,
      placeOfDelivery: bl.placeOfDelivery ?? undefined,
      containers: containers.map((c) => ({
        containerNumber: c.containerNumber,
        sealNumber: c.sealNumber ?? undefined,
        containerType: c.containerType ?? undefined,
        containerSize: c.containerSize ?? undefined,
        grossWeight: c.grossWeight ?? undefined,
        packageCount: c.packageCount ?? undefined,
        packageType: c.packageType ?? undefined,
        cargoDescription: c.cargoDescription ?? undefined,
      })),
      description: bl.cargoDescription ?? undefined,
      weight: bl.grossWeight ?? undefined,
      weightUnit: bl.weightUnit ?? "KG",
      measurement: bl.volume ?? undefined,
      measurementUnit: bl.volumeUnit ?? "CBM",
      freightTerms: bl.freightTerms ?? "prepaid",
      dateOfIssue: bl.dateOfIssue ?? undefined,
      placeOfIssue: bl.portOfLoading ?? undefined,
      numberOfOriginals: bl.numberOfOriginals ?? 3,
      companyName: tenant?.name ?? undefined,
    };

    const pdfBytes = await renderPdfToBuffer(
      React.createElement(BillOfLadingPdf, { data })
    );

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="BL-${bl.blNumber}.pdf"`,
        "Content-Length": String(pdfBytes.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to generate BL PDF:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
