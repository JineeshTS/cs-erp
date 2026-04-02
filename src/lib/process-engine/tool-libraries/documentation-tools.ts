/**
 * Documentation Tool Library (D-006 Phase 4)
 *
 * 5 tool implementations for E2E-04 Booking-to-Cash (steps 15-21).
 * Covers: customs declarations, shipping instructions, bills of lading,
 * release type determination, manifest compilation.
 *
 * Real DB operations on: ccr_export_filings, odm_shipping_instructions,
 * odm_bills_of_lading, odm_manifests, odm_manifest_items
 */

import { db } from "@/lib/db";
import {
  ccrExportFilings,
  odmShippingInstructions,
  odmBillsOfLading,
  odmManifests,
  odmManifestItems,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createEntityBinding,
  resolveEntityInFlow,
} from "../entity-binding-service";
import type { ToolCallContext, ToolCallResult } from "./types";

// ═══════════════════════════════════════════════════════════
// STEP 15: CUSTOMS DECLARATION FILING
// ═══════════════════════════════════════════════════════════

export async function executeFileCustomsDeclaration(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const exporterName = (input.exporterName as string) ?? "";
  const exporterCode = (input.exporterCode as string) ?? "";
  const portOfLoading = (input.portOfLoading as string) ?? "";
  const portOfDischarge = (input.portOfDischarge as string) ?? "";
  const blNumber = (input.blNumber as string) ?? "";
  const hsCode = (input.hsCode as string) ?? "";
  const cargoDescription = (input.cargoDescription as string) ?? "";
  const cargoValue = (input.cargoValue as number) ?? 0;
  const currency = (input.currency as string) ?? "USD";

  const [filing] = await db
    .insert(ccrExportFilings)
    .values({
      tenantId,
      filingRef: `EXP-${Date.now().toString(36).toUpperCase()}`,
      declarationType: (input.declarationType as string) ?? "export",
      exporterName,
      exporterCode,
      blNumber,
      portOfLoading,
      portOfDischarge,
      status: "submitted",
      metadata: {
        hsCode,
        cargoDescription,
        cargoValue,
        currency,
        filedBy: "ai_customs_agent",
        filedAt: new Date().toISOString(),
      },
    })
    .returning();

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "ccr_export_filings",
    entityId: filing.id,
    entityAction: "create",
    entityData: filing as unknown as Record<string, unknown>,
  });

  return {
    result: {
      filingId: filing.id,
      filingRef: filing.filingRef,
      exporterName,
      portOfLoading,
      portOfDischarge,
      status: "submitted",
    },
    entityTable: "ccr_export_filings",
    entityId: filing.id,
    entityAction: "create",
    entityData: filing as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 16-17: SHIPPING INSTRUCTIONS
// ═══════════════════════════════════════════════════════════

export async function executeProcessShippingInstructions(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const bookingReference = (input.bookingReference as string) ?? "";
  const shipperName = (input.shipperName as string) ?? "";
  const consigneeName = (input.consigneeName as string) ?? "";
  const notifyParty = (input.notifyParty as string) ?? "";
  const cargoDescription = (input.cargoDescription as string) ?? "";
  const marksAndNumbers = (input.marksAndNumbers as string) ?? "";
  const numberOfPackages = (input.numberOfPackages as number) ?? 0;
  const grossWeight = (input.grossWeight as number) ?? 0;

  const [si] = await db
    .insert(odmShippingInstructions)
    .values({
      tenantId,
      siReference: `SI-${Date.now().toString(36).toUpperCase()}`,
      bookingReference,
      shipperName,
      consigneeName,
      status: "submitted",
      metadata: {
        notifyParty,
        cargoDescription,
        marksAndNumbers,
        numberOfPackages,
        grossWeight,
        processedBy: "ai_si_processor",
        processedAt: new Date().toISOString(),
      },
    })
    .returning();

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "odm_shipping_instructions",
    entityId: si.id,
    entityAction: "create",
    entityData: si as unknown as Record<string, unknown>,
  });

  return {
    result: {
      siId: si.id,
      siReference: si.siReference,
      bookingReference,
      shipperName,
      consigneeName,
      status: "submitted",
    },
    entityTable: "odm_shipping_instructions",
    entityId: si.id,
    entityAction: "create",
    entityData: si as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 18: BILL OF LADING GENERATION
// ═══════════════════════════════════════════════════════════

export async function executeGenerateBillOfLading(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const blType = (input.blType as string) ?? "original";
  const bookingReference = (input.bookingReference as string) ?? "";
  const shipperName = (input.shipperName as string) ?? "";
  const consigneeName = (input.consigneeName as string) ?? "";
  const vesselName = (input.vesselName as string) ?? "";
  const voyageNumber = (input.voyageNumber as string) ?? "";
  const portOfLoading = (input.portOfLoading as string) ?? "";
  const portOfDischarge = (input.portOfDischarge as string) ?? "";
  const placeOfDelivery = (input.placeOfDelivery as string) ?? "";
  const numberOfOriginals = (input.numberOfOriginals as number) ?? 3;

  // Try to resolve SI for linking
  const siBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "odm_shipping_instructions"
  );

  const [bl] = await db
    .insert(odmBillsOfLading)
    .values({
      tenantId,
      blNumber: `BL-${Date.now().toString(36).toUpperCase()}`,
      blType,
      blStatus: "draft",
      bookingReference,
      shipperName,
      consigneeName,
      vesselName,
      voyageNumber,
      portOfLoading,
      portOfDischarge,
      placeOfDelivery,
      numberOfOriginals,
      metadata: {
        siId: siBinding?.entityId,
        generatedBy: "ai_bl_generator",
        generatedAt: new Date().toISOString(),
      },
    })
    .returning();

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "odm_bills_of_lading",
    entityId: bl.id,
    entityAction: "create",
    entityData: bl as unknown as Record<string, unknown>,
  });

  return {
    result: {
      blId: bl.id,
      blNumber: bl.blNumber,
      blType,
      vesselName,
      voyageNumber,
      portOfLoading,
      portOfDischarge,
      numberOfOriginals,
      status: "draft",
    },
    entityTable: "odm_bills_of_lading",
    entityId: bl.id,
    entityAction: "create",
    entityData: bl as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 19: RELEASE TYPE DETERMINATION
// ═══════════════════════════════════════════════════════════

export async function executeDetermineReleaseType(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const blBinding = await resolveEntityInFlow(
    flowInstanceId,
    tenantId,
    "odm_bills_of_lading"
  );
  const blId = (input.blId as string) || blBinding?.entityId;

  const releaseType = (input.releaseType as string) ?? "original";
  const paymentStatus = (input.paymentStatus as string) ?? "pending";
  const customsCleared = (input.customsCleared as boolean) ?? false;
  const holdReasons = (input.holdReasons as string[]) ?? [];

  const releaseApproved =
    paymentStatus === "paid" && customsCleared && holdReasons.length === 0;

  if (blId) {
    await db
      .update(odmBillsOfLading)
      .set({
        blStatus: releaseApproved ? "released" : "hold",
        metadata: {
          releaseType,
          paymentStatus,
          customsCleared,
          holdReasons,
          releaseApproved,
          determinedBy: "ai_release_agent",
          determinedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(odmBillsOfLading.id, blId),
          eq(odmBillsOfLading.tenantId, tenantId)
        )
      );
  }

  return {
    result: {
      blId,
      releaseType,
      releaseApproved,
      paymentStatus,
      customsCleared,
      holdReasons,
    },
    entityTable: blId ? "odm_bills_of_lading" : undefined,
    entityId: blId ?? undefined,
    entityAction: blId ? "update" : undefined,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 20-21: MANIFEST COMPILATION
// ═══════════════════════════════════════════════════════════

export async function executeCompileManifest(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const vesselName = (input.vesselName as string) ?? "";
  const voyageNumber = (input.voyageNumber as string) ?? "";
  const portOfLoading = (input.portOfLoading as string) ?? "";
  const manifestType = (input.manifestType as string) ?? "loading";
  const blNumbers = (input.blNumbers as string[]) ?? [];
  const containerCount = (input.containerCount as number) ?? 0;
  const totalWeight = (input.totalWeight as number) ?? 0;

  const [manifest] = await db
    .insert(odmManifests)
    .values({
      tenantId,
      manifestNumber: `MAN-${Date.now().toString(36).toUpperCase()}`,
      manifestType,
      vesselName,
      voyageNumber,
      portOfLoading,
      status: "draft",
      metadata: {
        blNumbers,
        containerCount,
        totalWeight,
        compiledBy: "ai_manifest_compiler",
        compiledAt: new Date().toISOString(),
      },
    })
    .returning();

  // Add manifest items for each BL
  for (const blNumber of blNumbers) {
    await db.insert(odmManifestItems).values({
      tenantId,
      manifestId: manifest.id,
      blNumber,
      containerNumber: "",
      cargoDescription: "",
      metadata: {},
    });
  }

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "odm_manifests",
    entityId: manifest.id,
    entityAction: "create",
    entityData: manifest as unknown as Record<string, unknown>,
  });

  return {
    result: {
      manifestId: manifest.id,
      manifestNumber: manifest.manifestNumber,
      vesselName,
      voyageNumber,
      portOfLoading,
      blCount: blNumbers.length,
      containerCount,
      totalWeight,
      status: "draft",
    },
    entityTable: "odm_manifests",
    entityId: manifest.id,
    entityAction: "create",
    entityData: manifest as unknown as Record<string, unknown>,
  };
}
