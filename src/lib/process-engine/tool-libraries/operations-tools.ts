/**
 * Operations Tool Library (D-006 Phase 4)
 *
 * 12 tool implementations for E2E-04 Booking-to-Cash (steps 1-14).
 * Covers: route calculation, credit checks, quoting, space allocation,
 * equipment, trucking, cutoffs, VGM, gate-in, DG, stowage.
 *
 * Real DB operations on: scm_rate_quotations, arcc_credit_limits,
 * cap_space_controls, eqy_container_fleet, eqy_gate_movements,
 * odm_vgm_records, dgm_booking_screenings, cap_stowage_plans
 */

import { db } from "@/lib/db";
import {
  scmRateQuotations,
  arccCreditLimits,
  capSpaceControls,
  eqyContainerFleet,
  eqyGateMovements,
  odmVgmRecords,
  dgmBookingScreenings,
  capStowagePlans,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createEntityBinding,
  resolveEntityInFlow,
} from "../entity-binding-service";
import type { ToolCallContext, ToolCallResult } from "./types";

// ═══════════════════════════════════════════════════════════
// STEP 1: ROUTE CALCULATION
// ═══════════════════════════════════════════════════════════

export async function executeCalculateRoute(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const originPort = (input.originPort as string) ?? "AEJEA";
  const destinationPort = (input.destinationPort as string) ?? "CNSHA";
  const transitDays = (input.transitDays as number) ?? 14;
  const transshipmentPorts = (input.transshipmentPorts as string[]) ?? [];
  const vesselService = (input.vesselService as string) ?? "";
  const distanceNm = (input.distanceNm as number) ?? 0;

  return {
    result: {
      originPort,
      destinationPort,
      transitDays,
      transshipmentPorts,
      vesselService,
      distanceNm,
      directRoute: transshipmentPorts.length === 0,
      routeId: `RT-${Date.now().toString(36).toUpperCase()}`,
      calculatedAt: new Date().toISOString(),
    },
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 2: CREDIT CHECK
// ═══════════════════════════════════════════════════════════

export async function executeCheckCredit(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId } = ctx;

  const customerId = (input.customerId as string) ?? "";
  const requestedAmount = (input.requestedAmount as number) ?? 0;

  // Look up existing credit limit
  const [creditLimit] = await db
    .select()
    .from(arccCreditLimits)
    .where(and(eq(arccCreditLimits.tenantId, tenantId), eq(arccCreditLimits.accountId, customerId)))
    .limit(1);

  const limit = creditLimit?.creditLimit ?? 100000;
  const currentExposure = creditLimit?.currentExposure ?? 0;
  const available = limit - currentExposure;
  const approved = requestedAmount <= available;

  return {
    result: {
      customerId,
      creditLimit: limit,
      currentExposure,
      availableCredit: available,
      requestedAmount,
      approved,
      riskCategory: creditLimit?.riskCategory ?? "standard",
      checkedAt: new Date().toISOString(),
    },
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 3: GENERATE QUOTE
// ═══════════════════════════════════════════════════════════

export async function executeGenerateQuote(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, userId } = ctx;

  const originPort = (input.originPort as string) ?? "AEJEA";
  const destinationPort = (input.destinationPort as string) ?? "CNSHA";
  const baseRate = (input.baseRate as number) ?? 1500;
  const surcharges = (input.surcharges as number) ?? 200;
  const totalRate = baseRate + surcharges;
  const estimatedTeu = (input.estimatedTeu as number) ?? 1;
  const validityDays = (input.validityDays as number) ?? 14;

  const validFrom = new Date();
  const validTo = new Date();
  validTo.setDate(validTo.getDate() + validityDays);

  const [quotation] = await db
    .insert(scmRateQuotations)
    .values({
      tenantId,
      quotationNumber: `BQ-${Date.now().toString(36).toUpperCase()}`,
      customerId: (input.customerId as string) ?? tenantId,
      salesRepId: userId,
      originPort,
      destinationPort,
      tradeLane: `${originPort}-${destinationPort}`,
      containerType: (input.containerType as string) ?? "dry",
      containerSize: (input.containerSize as string) ?? "40",
      estimatedTeu,
      totalAmount: totalRate * estimatedTeu,
      currency: "USD",
      validFrom,
      validTo,
      status: "draft",
      metadata: {
        rateBreakdown: { baseRate, surcharges, totalRate },
        generatedBy: "ai_quoting_agent",
        generatedAt: new Date().toISOString(),
      },
    })
    .returning();

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "scm_rate_quotations",
    entityId: quotation.id,
    entityAction: "create",
    entityData: quotation as unknown as Record<string, unknown>,
  });

  return {
    result: {
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      totalRate,
      totalAmount: totalRate * estimatedTeu,
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
    },
    entityTable: "scm_rate_quotations",
    entityId: quotation.id,
    entityAction: "create",
    entityData: quotation as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 4: SPACE ALLOCATION
// ═══════════════════════════════════════════════════════════

export async function executeAllocateSpace(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const bookingRef = (input.bookingReference as string) ??
    `BK-${Date.now().toString(36).toUpperCase()}`;
  const vesselScheduleId = (input.vesselScheduleId as string) ?? null;
  const requestedTeu = (input.requestedTeu as number) ?? 1;
  const containerType = (input.containerType as string) ?? "dry";

  const [allocation] = await db
    .insert(capSpaceControls)
    .values({
      tenantId,
      vesselScheduleId,
      bookingReference: bookingRef,
      containerType,
      containerSize: (input.containerSize as string) ?? "40",
      quantityTeu: requestedTeu,
      status: "confirmed",
    })
    .returning();

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "cap_space_controls",
    entityId: allocation.id,
    entityAction: "create",
    entityData: allocation as unknown as Record<string, unknown>,
  });

  return {
    result: {
      allocationId: allocation.id,
      bookingReference: bookingRef,
      confirmedSlots: requestedTeu,
      containerType,
      status: "confirmed",
    },
    entityTable: "cap_space_controls",
    entityId: allocation.id,
    entityAction: "create",
    entityData: allocation as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 5: EQUIPMENT RESERVATION
// ═══════════════════════════════════════════════════════════

export async function executeReserveEquipment(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId } = ctx;

  const containerNumber = (input.containerNumber as string) ??
    `CSLU${Date.now().toString().slice(-7)}`;
  const containerType = (input.containerType as string) ?? "dry";
  const containerSize = (input.containerSize as string) ?? "40";
  const pickupDepot = (input.pickupDepot as string) ?? "";

  // Try to find an available container
  const [container] = await db
    .select()
    .from(eqyContainerFleet)
    .where(
      and(
        eq(eqyContainerFleet.tenantId, tenantId),
        eq(eqyContainerFleet.currentStatus, "available")
      )
    )
    .limit(1);

  const reservedContainerId = container?.id ?? null;
  const reservedNumber = container?.containerNumber ?? containerNumber;

  if (container) {
    await db
      .update(eqyContainerFleet)
      .set({
        currentStatus: "reserved",
        updatedAt: new Date(),
      })
      .where(eq(eqyContainerFleet.id, container.id));
  }

  return {
    result: {
      containerId: reservedContainerId,
      containerNumber: reservedNumber,
      containerType,
      containerSize,
      pickupDepot,
      status: "reserved",
      reservedAt: new Date().toISOString(),
    },
    entityTable: reservedContainerId ? "eqy_container_fleet" : undefined,
    entityId: reservedContainerId ?? undefined,
    entityAction: reservedContainerId ? "update" : undefined,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 6: TRUCK DISPATCH
// ═══════════════════════════════════════════════════════════

export async function executeDispatchTruck(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const pickupLocation = (input.pickupLocation as string) ?? "";
  const deliveryTerminal = (input.deliveryTerminal as string) ?? "";
  const containerNumber = (input.containerNumber as string) ?? "";
  const pickupDate = (input.pickupDate as string) ?? new Date().toISOString();
  const truckerName = (input.truckerName as string) ?? "";
  const driverContact = (input.driverContact as string) ?? "";

  const dispatchRef = `DSP-${Date.now().toString(36).toUpperCase()}`;

  return {
    result: {
      dispatchReference: dispatchRef,
      containerNumber,
      pickupLocation,
      deliveryTerminal,
      pickupDate,
      truckerName,
      driverContact,
      status: "dispatched",
      dispatchedAt: new Date().toISOString(),
    },
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 7: CUTOFF SETTING
// ═══════════════════════════════════════════════════════════

export async function executeSetCutoffs(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const documentCutoff = (input.documentCutoff as string) ?? "";
  const cargoCutoff = (input.cargoCutoff as string) ?? "";
  const vgmCutoff = (input.vgmCutoff as string) ?? "";
  const customsCutoff = (input.customsCutoff as string) ?? "";
  const vesselName = (input.vesselName as string) ?? "";
  const voyageNumber = (input.voyageNumber as string) ?? "";

  return {
    result: {
      vesselName,
      voyageNumber,
      cutoffs: {
        documentCutoff,
        cargoCutoff,
        vgmCutoff,
        customsCutoff,
      },
      status: "set",
      setAt: new Date().toISOString(),
    },
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 8: VGM PROCESSING
// ═══════════════════════════════════════════════════════════

export async function executeProcessVgm(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const containerNumber = (input.containerNumber as string) ?? "";
  const weighingMethod = (input.weighingMethod as string) ?? "method1";
  const verifiedGrossMass = (input.verifiedGrossMass as number) ?? 0;
  const maxGrossWeight = (input.maxGrossWeight as number) ?? 30480;
  const discrepancy = Math.abs(verifiedGrossMass - maxGrossWeight) > maxGrossWeight * 0.05;

  const [vgmRecord] = await db
    .insert(odmVgmRecords)
    .values({
      tenantId,
      vgmReference: `VGM-${Date.now().toString(36).toUpperCase()}`,
      containerNumber,
      weighingMethod,
      verifiedGrossMass,
      weighingDate: new Date().toISOString(),
      certifiedBy: "AI VGM Processor",
      status: "verified",
      discrepancyFlag: discrepancy,
      metadata: {
        maxGrossWeight,
        processedBy: "ai_vgm_processor",
        processedAt: new Date().toISOString(),
      },
    })
    .returning();

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "odm_vgm_records",
    entityId: vgmRecord.id,
    entityAction: "create",
    entityData: vgmRecord as unknown as Record<string, unknown>,
  });

  return {
    result: {
      vgmId: vgmRecord.id,
      vgmReference: vgmRecord.vgmReference,
      containerNumber,
      verifiedGrossMass,
      weighingMethod,
      discrepancy,
      status: "verified",
    },
    entityTable: "odm_vgm_records",
    entityId: vgmRecord.id,
    entityAction: "create",
    entityData: vgmRecord as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 9: CUTOFF COMPLIANCE CHECK
// ═══════════════════════════════════════════════════════════

export async function executeCheckCutoffCompliance(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const bookingReference = (input.bookingReference as string) ?? "";
  const documentCutoff = (input.documentCutoff as string) ?? "";
  const cargoCutoff = (input.cargoCutoff as string) ?? "";
  const vgmCutoff = (input.vgmCutoff as string) ?? "";
  const documentsSubmitted = (input.documentsSubmitted as boolean) ?? false;
  const cargoReceived = (input.cargoReceived as boolean) ?? false;
  const vgmReceived = (input.vgmReceived as boolean) ?? false;

  const now = new Date();
  const docCompliant = documentsSubmitted || (documentCutoff ? new Date(documentCutoff) > now : true);
  const cargoCompliant = cargoReceived || (cargoCutoff ? new Date(cargoCutoff) > now : true);
  const vgmCompliant = vgmReceived || (vgmCutoff ? new Date(vgmCutoff) > now : true);
  const allCompliant = docCompliant && cargoCompliant && vgmCompliant;

  return {
    result: {
      bookingReference,
      allCompliant,
      compliance: {
        documents: { compliant: docCompliant, cutoff: documentCutoff, submitted: documentsSubmitted },
        cargo: { compliant: cargoCompliant, cutoff: cargoCutoff, received: cargoReceived },
        vgm: { compliant: vgmCompliant, cutoff: vgmCutoff, received: vgmReceived },
      },
      checkedAt: new Date().toISOString(),
    },
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 10: GATE-IN PROCESSING
// ═══════════════════════════════════════════════════════════

export async function executeProcessGateIn(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const containerNumber = (input.containerNumber as string) ?? "";
  const sealNumber = (input.sealNumber as string) ?? "";
  const terminalCode = (input.terminalCode as string) ?? "";
  const damageNotes = (input.damageNotes as string) ?? "";
  const grossWeight = (input.grossWeight as number) ?? 0;

  const [gateMovement] = await db
    .insert(eqyGateMovements)
    .values({
      tenantId,
      movementReference: `GIN-${Date.now().toString(36).toUpperCase()}`,
      movementType: "gate_in",
      containerNumber,
      sealNumber,
      gateCode: terminalCode,
      status: "completed",
      movementTimestamp: new Date(),
      metadata: {
        damageNotes,
        grossWeight,
        processedBy: "ai_gate_processor",
        processedAt: new Date().toISOString(),
      },
    })
    .returning();

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "eqy_gate_movements",
    entityId: gateMovement.id,
    entityAction: "create",
    entityData: gateMovement as unknown as Record<string, unknown>,
  });

  return {
    result: {
      gateMovementId: gateMovement.id,
      movementReference: gateMovement.movementReference,
      containerNumber,
      sealNumber,
      terminalCode,
      status: "completed",
    },
    entityTable: "eqy_gate_movements",
    entityId: gateMovement.id,
    entityAction: "create",
    entityData: gateMovement as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 11: DANGEROUS GOODS CLASSIFICATION
// ═══════════════════════════════════════════════════════════

export async function executeClassifyDangerousGoods(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const unNumber = (input.unNumber as string) ?? "";
  const imdgClass = (input.imdgClass as string) ?? "";
  const packingGroup = (input.packingGroup as string) ?? "";
  const properShippingName = (input.properShippingName as string) ?? "";
  const flashPoint = (input.flashPoint as number) ?? null;
  const marinePollutant = (input.marinePollutant as boolean) ?? false;

  const riskScore = imdgClass.startsWith("1")
    ? 95
    : imdgClass.startsWith("7")
      ? 90
      : imdgClass.startsWith("6")
        ? 75
        : 50;

  const [screening] = await db
    .insert(dgmBookingScreenings)
    .values({
      tenantId,
      screeningRef: `DGS-${Date.now().toString(36).toUpperCase()}`,
      bookingRef: (input.bookingReference as string) ?? `BK-${Date.now().toString(36).toUpperCase()}`,
      customerName: (input.customerName as string) ?? "Booking Customer",
      unNumber,
      imdgClass,
      packingGroup,
      properShippingName,
      riskScore: String(riskScore),
      screeningResult: riskScore >= 80 ? "rejected" : "approved",
      status: riskScore >= 80 ? "rejected" : "approved",
      metadata: {
        flashPoint,
        marinePollutant,
        classifiedBy: "ai_dg_classifier",
        classifiedAt: new Date().toISOString(),
      },
    })
    .returning();

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "dgm_booking_screenings",
    entityId: screening.id,
    entityAction: "create",
    entityData: screening as unknown as Record<string, unknown>,
  });

  return {
    result: {
      screeningId: screening.id,
      screeningRef: screening.screeningRef,
      unNumber,
      imdgClass,
      packingGroup,
      properShippingName,
      riskScore,
      approved: riskScore < 80,
      marinePollutant,
    },
    entityTable: "dgm_booking_screenings",
    entityId: screening.id,
    entityAction: "create",
    entityData: screening as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// STEP 12: STOWAGE PLANNING
// ═══════════════════════════════════════════════════════════

export async function executePlanStowage(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const containerNumber = (input.containerNumber as string) ?? "";
  const vesselScheduleId = (input.vesselScheduleId as string) ?? null;
  const bayNumber = (input.bayNumber as number) ?? 1;
  const rowNumber = (input.rowNumber as number) ?? 1;
  const tierNumber = (input.tierNumber as number) ?? 1;
  const grossWeight = (input.grossWeight as number) ?? 0;
  const isDangerous = (input.isDangerous as boolean) ?? false;
  const isReefer = (input.isReefer as boolean) ?? false;

  const [stowagePlan] = await db
    .insert(capStowagePlans)
    .values({
      tenantId,
      vesselScheduleId,
      containerNumber,
      bayNumber,
      rowNumber,
      tierNumber,
      containerType: (input.containerType as string) ?? "dry",
      containerSize: (input.containerSize as string) ?? "40",
      weightKg: grossWeight,
      pol: (input.portOfLoading as string) ?? "",
      pod: (input.portOfDischarge as string) ?? "",
      isHazmat: isDangerous,
      isReefer,
      status: "planned",
    })
    .returning();

  await createEntityBinding({
    tenantId,
    stepInstanceId: ctx.stepInstanceId,
    flowInstanceId,
    entityTable: "cap_stowage_plans",
    entityId: stowagePlan.id,
    entityAction: "create",
    entityData: stowagePlan as unknown as Record<string, unknown>,
  });

  return {
    result: {
      stowagePlanId: stowagePlan.id,
      containerNumber,
      position: { bay: bayNumber, row: rowNumber, tier: tierNumber },
      grossWeight,
      isDangerous,
      isReefer,
      status: "planned",
    },
    entityTable: "cap_stowage_plans",
    entityId: stowagePlan.id,
    entityAction: "create",
    entityData: stowagePlan as unknown as Record<string, unknown>,
  };
}
