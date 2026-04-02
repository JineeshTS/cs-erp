import { NextRequest, NextResponse } from "next/server";
import { eq, isNull, and, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  odmBillsOfLading,
  odmBlContainers,
  odmBlCharges,
  odmManifests,
  odmManifestItems,
  odmRegulatoryFilings,
  odmVgmRecords,
  odmShippingInstructions,
  odmCargoTrackingEvents,
  odmDocumentAmendments,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:read")))
      return forbiddenResponse();

    const [
      [billsOfLading],
      [blContainers],
      [blCharges],
      [manifests],
      [manifestItems],
      [regulatoryFilings],
      [vgmRecords],
      [shippingInstructions],
      [cargoTrackingEvents],
      [documentAmendments],
    ] = await Promise.all([
      db.select({ count: count() }).from(odmBillsOfLading).where(and(eq(odmBillsOfLading.tenantId, user.tenantId), isNull(odmBillsOfLading.deletedAt))),
      db.select({ count: count() }).from(odmBlContainers).where(and(eq(odmBlContainers.tenantId, user.tenantId), isNull(odmBlContainers.deletedAt))),
      db.select({ count: count() }).from(odmBlCharges).where(and(eq(odmBlCharges.tenantId, user.tenantId), isNull(odmBlCharges.deletedAt))),
      db.select({ count: count() }).from(odmManifests).where(and(eq(odmManifests.tenantId, user.tenantId), isNull(odmManifests.deletedAt))),
      db.select({ count: count() }).from(odmManifestItems).where(and(eq(odmManifestItems.tenantId, user.tenantId), isNull(odmManifestItems.deletedAt))),
      db.select({ count: count() }).from(odmRegulatoryFilings).where(and(eq(odmRegulatoryFilings.tenantId, user.tenantId), isNull(odmRegulatoryFilings.deletedAt))),
      db.select({ count: count() }).from(odmVgmRecords).where(and(eq(odmVgmRecords.tenantId, user.tenantId), isNull(odmVgmRecords.deletedAt))),
      db.select({ count: count() }).from(odmShippingInstructions).where(and(eq(odmShippingInstructions.tenantId, user.tenantId), isNull(odmShippingInstructions.deletedAt))),
      db.select({ count: count() }).from(odmCargoTrackingEvents).where(and(eq(odmCargoTrackingEvents.tenantId, user.tenantId), isNull(odmCargoTrackingEvents.deletedAt))),
      db.select({ count: count() }).from(odmDocumentAmendments).where(and(eq(odmDocumentAmendments.tenantId, user.tenantId), isNull(odmDocumentAmendments.deletedAt))),
    ]);

    return NextResponse.json({
      data: {
        billsOfLading: billsOfLading.count,
        blContainers: blContainers.count,
        blCharges: blCharges.count,
        manifests: manifests.count,
        manifestItems: manifestItems.count,
        regulatoryFilings: regulatoryFilings.count,
        vgmRecords: vgmRecords.count,
        shippingInstructions: shippingInstructions.count,
        cargoTrackingEvents: cargoTrackingEvents.count,
        documentAmendments: documentAmendments.count,
      },
    });
  } catch (error) {
    console.error("Failed to get ODM summary:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
