import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { odmManifests, odmManifestItems, tenants } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { renderPdfToBuffer } from "@/lib/pdf/renderer";
import { ManifestPdf } from "@/lib/pdf/templates/manifest";
import type { ManifestData } from "@/lib/pdf/templates/manifest";
import React from "react";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "documents:read")))
      return forbiddenResponse();

    const { id } = await params;

    // Fetch manifest
    const [manifest] = await db
      .select()
      .from(odmManifests)
      .where(
        and(
          eq(odmManifests.id, id),
          eq(odmManifests.tenantId, user.tenantId),
          isNull(odmManifests.deletedAt)
        )
      )
      .limit(1);

    if (!manifest) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Manifest not found" } },
        { status: 404 }
      );
    }

    // Fetch manifest items
    const items = await db
      .select()
      .from(odmManifestItems)
      .where(
        and(
          eq(odmManifestItems.manifestId, id),
          eq(odmManifestItems.tenantId, user.tenantId),
          isNull(odmManifestItems.deletedAt)
        )
      );

    // Fetch tenant name
    const [tenant] = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1);

    const data: ManifestData = {
      manifestNumber: manifest.manifestNumber,
      manifestType: manifest.manifestType,
      vessel: manifest.vesselName,
      voyage: manifest.voyageNumber,
      portOfLoading: manifest.portOfLoading ?? undefined,
      portOfDischarge: manifest.portOfDischarge ?? undefined,
      estimatedDeparture: manifest.estimatedDeparture
        ? new Date(manifest.estimatedDeparture).toLocaleDateString("en-GB")
        : undefined,
      estimatedArrival: manifest.estimatedArrival
        ? new Date(manifest.estimatedArrival).toLocaleDateString("en-GB")
        : undefined,
      cargoItems: items.map((item) => ({
        blNumber: item.blNumber ?? undefined,
        containerNumber: item.containerNumber ?? undefined,
        shipperName: item.shipperName ?? undefined,
        consigneeName: item.consigneeName ?? undefined,
        cargoDescription: item.cargoDescription ?? undefined,
        hsCode: item.hsCode ?? undefined,
        packageCount: item.packageCount ?? undefined,
        packageType: item.packageType ?? undefined,
        grossWeight: item.grossWeight ?? undefined,
        volumeCbm: item.volumeCbm ?? undefined,
      })),
      totalBls: manifest.totalBls ?? 0,
      totalContainers: manifest.totalContainers ?? 0,
      totalWeight: manifest.totalWeight ?? undefined,
      weightUnit: manifest.weightUnit ?? "KG",
      status: manifest.status,
      submittedTo: manifest.submittedTo ?? undefined,
      companyName: tenant?.name ?? undefined,
    };

    const pdfBytes = await renderPdfToBuffer(
      React.createElement(ManifestPdf, { data })
    );

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Manifest-${manifest.manifestNumber}.pdf"`,
        "Content-Length": String(pdfBytes.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to generate manifest PDF:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
