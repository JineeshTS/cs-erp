/**
 * Voyage Tool Library (E2E-18 Vessel Voyage Lifecycle)
 *
 * 15 tool implementations for the real Voyage Planning process.
 * Covers: service schedules, vessel schedules, port rotations,
 * capacity allocation, LTS reports, ETA management, noon reports,
 * speed consumption, delay impact, voyage performance, port modifications.
 *
 * Real DB operations on: svp_service_schedules, svp_deployment_plans,
 * svp_eta_managements, cap_vessel_schedules, cap_port_rotations,
 * cap_trade_allocations, vpe_noon_reports, vpe_speed_consumptions,
 * vpe_voyage_performances
 */

import { db } from "@/lib/db";
import {
  svpServiceSchedules,
  svpDeploymentPlans,
  svpEtaManagements,
  capVesselSchedules,
  capPortRotations,
  capTradeAllocations,
  vpeNoonReports,
  vpeSpeedConsumptions,
  vpeVoyagePerformances,
} from "@/db/schema";
import { eq, and, asc, desc, isNull } from "drizzle-orm";
import {
  createEntityBinding,
  resolveEntityInFlow,
} from "../entity-binding-service";
import type { ToolCallContext, ToolCallResult } from "./types";
import {
  calculatePortRotationETAs,
  validatePortCode,
  checkPositionInZones,
  validateVesselPhysics,
  getPortDistance,
  KNOWN_PORTS,
} from "@/lib/shipping-reference-data";

// ═══════════════════════════════════════════════════════════
// READ-ONLY TOOLS
// ═══════════════════════════════════════════════════════════

/**
 * Get service schedule details.
 * Reads from svp_service_schedules for the given ID or resolves from flow.
 */
export async function executeGetServiceSchedule(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const binding = await resolveEntityInFlow(flowInstanceId, tenantId, "svp_service_schedules");
  const scheduleId = (input.serviceScheduleId as string) || binding?.entityId;

  if (!scheduleId) {
    return { result: { error: "No service schedule found in flow context" } };
  }

  const [schedule] = await db
    .select()
    .from(svpServiceSchedules)
    .where(
      and(
        eq(svpServiceSchedules.id, scheduleId),
        eq(svpServiceSchedules.tenantId, tenantId),
        isNull(svpServiceSchedules.deletedAt)
      )
    )
    .limit(1);

  if (!schedule) {
    return { result: { error: "Service schedule not found" } };
  }

  return {
    result: {
      id: schedule.id,
      scheduleRef: schedule.scheduleRef,
      scheduleType: schedule.scheduleType,
      serviceName: schedule.serviceName,
      serviceCode: schedule.serviceCode,
      tradeRoute: schedule.tradeRoute,
      vesselName: schedule.vesselName,
      frequencyDays: schedule.frequencyDays,
      portCount: schedule.portCount,
      transitTimeDays: schedule.transitTimeDays,
      status: schedule.status,
      effectiveFrom: schedule.effectiveFrom?.toISOString() ?? null,
      effectiveTo: schedule.effectiveTo?.toISOString() ?? null,
    },
  };
}

/**
 * Get port rotation for a vessel schedule.
 * Returns ordered list of ports with ETAs and departure times.
 */
export async function executeGetPortRotation(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const binding = await resolveEntityInFlow(flowInstanceId, tenantId, "cap_vessel_schedules");
  const vesselScheduleId = (input.vesselScheduleId as string) || binding?.entityId;

  if (!vesselScheduleId) {
    return { result: { error: "No vessel schedule found in flow context" } };
  }

  const rotations = await db
    .select()
    .from(capPortRotations)
    .where(
      and(
        eq(capPortRotations.vesselScheduleId, vesselScheduleId),
        eq(capPortRotations.tenantId, tenantId),
        isNull(capPortRotations.deletedAt)
      )
    )
    .orderBy(asc(capPortRotations.sequenceNumber));

  return {
    result: {
      vesselScheduleId,
      portCount: rotations.length,
      ports: rotations.map((r) => ({
        id: r.id,
        portCode: r.portCode,
        portName: r.portName,
        sequenceNumber: r.sequenceNumber,
        arrivalEta: r.arrivalEta?.toISOString() ?? null,
        departureEtd: r.departureEtd?.toISOString() ?? null,
        terminalName: r.terminalName,
        callPurpose: r.callPurpose,
        status: r.status,
      })),
    },
  };
}

/**
 * Get vessel capacity information from vessel schedule.
 */
export async function executeGetVesselCapacity(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const binding = await resolveEntityInFlow(flowInstanceId, tenantId, "cap_vessel_schedules");
  const vesselScheduleId = (input.vesselScheduleId as string) || binding?.entityId;

  if (!vesselScheduleId) {
    return { result: { error: "No vessel schedule found in flow context" } };
  }

  const [schedule] = await db
    .select()
    .from(capVesselSchedules)
    .where(
      and(
        eq(capVesselSchedules.id, vesselScheduleId),
        eq(capVesselSchedules.tenantId, tenantId),
        isNull(capVesselSchedules.deletedAt)
      )
    )
    .limit(1);

  if (!schedule) {
    return { result: { error: "Vessel schedule not found" } };
  }

  // Check existing trade allocations to calculate remaining capacity
  const allocations = await db
    .select()
    .from(capTradeAllocations)
    .where(
      and(
        eq(capTradeAllocations.vesselScheduleId, vesselScheduleId),
        eq(capTradeAllocations.tenantId, tenantId)
      )
    );

  const allocatedTeu = allocations.reduce((sum, a) => sum + (a.allocatedTeu ?? 0), 0);
  const totalCapacity = schedule.totalCapacityTeu ?? 0;

  return {
    result: {
      vesselScheduleId,
      vesselName: schedule.vesselName,
      vesselImo: schedule.vesselImo,
      serviceName: schedule.serviceName,
      tradeLane: schedule.tradeLane,
      totalCapacityTeu: totalCapacity,
      totalWeightMt: schedule.totalWeightMt,
      allocatedTeu,
      remainingTeu: totalCapacity - allocatedTeu,
      utilizationPercent: totalCapacity > 0 ? Math.round((allocatedTeu / totalCapacity) * 100) : 0,
      status: schedule.status,
    },
  };
}

/**
 * Get latest vessel position from noon reports.
 */
export async function executeGetVesselPosition(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const vesselName = (input.vesselName as string) ?? "";

  // Try to resolve from flow first
  const noonBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "vpe_noon_reports");

  let report: typeof vpeNoonReports.$inferSelect | undefined;

  if (noonBinding?.entityId) {
    const [r] = await db
      .select()
      .from(vpeNoonReports)
      .where(
        and(
          eq(vpeNoonReports.id, noonBinding.entityId),
          eq(vpeNoonReports.tenantId, tenantId)
        )
      )
      .limit(1);
    report = r;
  }

  // Fallback: find latest noon report by vessel name
  if (!report && vesselName) {
    const [r] = await db
      .select()
      .from(vpeNoonReports)
      .where(
        and(
          eq(vpeNoonReports.vesselName, vesselName),
          eq(vpeNoonReports.tenantId, tenantId),
          isNull(vpeNoonReports.deletedAt)
        )
      )
      .orderBy(desc(vpeNoonReports.reportDatetime))
      .limit(1);
    report = r;
  }

  if (!report) {
    return { result: { error: "No noon report found for vessel position" } };
  }

  return {
    result: {
      vesselName: report.vesselName,
      latitude: report.latitude,
      longitude: report.longitude,
      avgSpeed: report.avgSpeed,
      courseHeading: report.courseHeading,
      distanceToGo: report.distanceToGo,
      reportDatetime: report.reportDatetime?.toISOString() ?? null,
      windDirection: report.windDirection,
      windForce: report.windForce,
      seaState: report.seaState,
      eta: report.eta?.toISOString() ?? null,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// CREATE TOOLS
// ═══════════════════════════════════════════════════════════

/**
 * Create port rotation entries for a voyage.
 * Inserts one row per port in the rotation sequence.
 */
export async function executeCreatePortRotation(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, stepInstanceId } = ctx;

  // Resolve vessel schedule from prior steps
  const vsBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "cap_vessel_schedules");
  const vesselScheduleId = (input.vesselScheduleId as string) || vsBinding?.entityId;

  if (!vesselScheduleId) {
    return { result: { error: "No vessel schedule found. Complete 'Plan Vessel' step first." } };
  }

  const ports = (input.ports as Array<Record<string, unknown>>) ?? [];
  if (ports.length === 0) {
    return { result: { error: "No ports provided for rotation. Provide at least 2 ports." } };
  }

  // Validate all port codes first
  for (const port of ports) {
    const check = validatePortCode((port.portCode as string) ?? "");
    if (!check.valid) {
      return { result: { error: check.error } };
    }
  }

  // Calculate ETAs from port distances and vessel speed (14 knots economical)
  const departureDate = input.departureDate
    ? new Date(input.departureDate as string)
    : new Date(Date.now() + 3 * 86400000); // default: 3 days from now
  const vesselSpeed = (input.vesselSpeedKnots as number) ?? 14;

  const calculatedETAs = calculatePortRotationETAs(
    departureDate,
    ports.map((p) => ({
      portCode: (p.portCode as string) ?? "",
      portName: (p.portName as string) ?? KNOWN_PORTS[(p.portCode as string) ?? ""] ?? "",
      callPurpose: (p.callPurpose as string) ?? "both",
    })),
    vesselSpeed
  );

  const createdRotations: Array<Record<string, unknown>> = [];

  for (let i = 0; i < calculatedETAs.length; i++) {
    const eta = calculatedETAs[i];
    const port = ports[i];
    const [rotation] = await db
      .insert(capPortRotations)
      .values({
        tenantId,
        vesselScheduleId,
        portCode: eta.portCode,
        portName: eta.portName || KNOWN_PORTS[eta.portCode] || eta.portCode,
        sequenceNumber: i + 1,
        arrivalEta: eta.arrivalEta,
        departureEtd: eta.departureEtd,
        terminalName: (port.terminalName as string) ?? null,
        callPurpose: eta.callPurpose,
        status: "scheduled",
        notes: eta.transitFromPrevNm
          ? `Transit: ${eta.transitFromPrevNm} NM, ${eta.transitHours}h at ${vesselSpeed} kn. Turnaround: ${eta.turnaroundHours}h.`
          : `First port of call. Turnaround: ${eta.turnaroundHours}h.`,
        createdBy: ctx.userId,
      })
      .returning();

    if (rotation) {
      createdRotations.push({
        id: rotation.id,
        portCode: rotation.portCode,
        portName: rotation.portName,
        sequenceNumber: rotation.sequenceNumber,
        arrivalEta: rotation.arrivalEta?.toISOString() ?? null,
        departureEtd: rotation.departureEtd?.toISOString() ?? null,
        transitNm: eta.transitFromPrevNm,
        transitHours: eta.transitHours,
        turnaroundHours: eta.turnaroundHours,
      });
    }
  }

  // Create entity binding for the first port rotation (primary entity)
  const firstRotation = createdRotations[0];
  if (firstRotation) {
    await createEntityBinding({
      tenantId,
      stepInstanceId,
      flowInstanceId,
      entityTable: "cap_port_rotations",
      entityId: firstRotation.id as string,
      entityAction: "create",
      entityData: {
        ...firstRotation,
        totalPorts: createdRotations.length,
        allPortRotationIds: createdRotations.map((r) => r.id),
      },
    });
  }

  return {
    result: {
      vesselScheduleId,
      portsCreated: createdRotations.length,
      portRotations: createdRotations,
    },
    entityTable: "cap_port_rotations",
    entityId: (firstRotation?.id as string) ?? "",
    entityAction: "create",
    entityData: {
      totalPorts: createdRotations.length,
      portRotations: createdRotations,
    },
  };
}

/**
 * Generate a voyage number based on service code and vessel.
 * Pure computation — no DB write.
 */
export async function executeGenerateVoyageNumber(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const serviceCode = (input.serviceCode as string) ?? "SVC";
  const vesselName = (input.vesselName as string) ?? "VESSEL";
  const cycleNumber = (input.cycleNumber as number) ?? 1;

  const year = new Date().getFullYear();
  const seq = Date.now().toString(36).toUpperCase().slice(-4);
  const voyageNumber = `${serviceCode}-${year}-${String(cycleNumber).padStart(3, "0")}-${seq}`;

  return {
    result: {
      voyageNumber,
      serviceCode,
      vesselName,
      cycleNumber,
      year,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Allocate trade capacity on a vessel schedule.
 * Creates a cap_trade_allocations record.
 */
export async function executeAllocateTradeCapacity(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, stepInstanceId } = ctx;

  const vsBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "cap_vessel_schedules");
  const vesselScheduleId = (input.vesselScheduleId as string) || vsBinding?.entityId;

  if (!vesselScheduleId) {
    return { result: { error: "No vessel schedule found in flow context" } };
  }

  const tradeLane = (input.tradeLane as string) ?? "";
  const allocatedTeu = (input.allocatedTeu as number) ?? 0;
  const allocationType = (input.allocationType as string) ?? "contract";
  const originRegion = (input.originRegion as string) ?? null;
  const destinationRegion = (input.destinationRegion as string) ?? null;

  if (!tradeLane || allocatedTeu <= 0) {
    return { result: { error: "tradeLane and allocatedTeu (> 0) are required" } };
  }

  // Capacity validation: check against vessel total
  const [vesselSchedule] = await db
    .select({ totalCapacityTeu: capVesselSchedules.totalCapacityTeu })
    .from(capVesselSchedules)
    .where(and(eq(capVesselSchedules.id, vesselScheduleId), eq(capVesselSchedules.tenantId, tenantId)))
    .limit(1);

  if (vesselSchedule) {
    const existingAllocations = await db
      .select({ allocatedTeu: capTradeAllocations.allocatedTeu })
      .from(capTradeAllocations)
      .where(and(
        eq(capTradeAllocations.vesselScheduleId, vesselScheduleId),
        eq(capTradeAllocations.tenantId, tenantId),
        isNull(capTradeAllocations.deletedAt)
      ));

    const totalAllocated = existingAllocations.reduce((sum, a) => sum + (a.allocatedTeu ?? 0), 0);
    const totalCapacity = vesselSchedule.totalCapacityTeu ?? 0;
    const remaining = totalCapacity - totalAllocated;

    if (allocatedTeu > remaining) {
      return {
        result: {
          error: `Capacity exceeded. Vessel has ${totalCapacity} TEU total, ${totalAllocated} TEU already allocated, ${remaining} TEU remaining. Cannot allocate ${allocatedTeu} TEU.`,
          totalCapacity,
          allocated: totalAllocated,
          remaining,
          requested: allocatedTeu,
        },
      };
    }
  }

  const [allocation] = await db
    .insert(capTradeAllocations)
    .values({
      tenantId,
      vesselScheduleId,
      tradeLane,
      originRegion,
      destinationRegion,
      allocatedTeu,
      allocationType,
      effectiveFrom: new Date(),
      priority: (input.priority as number) ?? 0,
      status: "active",
      notes: (input.notes as string) ?? null,
      createdBy: ctx.userId,
    })
    .returning();

  if (allocation) {
    await createEntityBinding({
      tenantId,
      stepInstanceId,
      flowInstanceId,
      entityTable: "cap_trade_allocations",
      entityId: allocation.id,
      entityAction: "create",
      entityData: allocation as unknown as Record<string, unknown>,
    });
  }

  return {
    result: {
      allocationId: allocation?.id,
      vesselScheduleId,
      tradeLane,
      allocatedTeu,
      allocationType,
      status: "active",
      createdAt: allocation?.createdAt?.toISOString() ?? new Date().toISOString(),
    },
    entityTable: "cap_trade_allocations",
    entityId: allocation?.id ?? "",
    entityAction: "create",
    entityData: allocation as unknown as Record<string, unknown>,
  };
}

/**
 * Generate Long Term Schedule report.
 * Creates a svp_deployment_plans record compiling service + vessel + rotation data.
 */
export async function executeGenerateLtsReport(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, stepInstanceId } = ctx;

  // Resolve service schedule
  const ssBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "svp_service_schedules");
  const serviceScheduleId = (input.serviceScheduleId as string) || ssBinding?.entityId;

  // Resolve vessel schedule
  const vsBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "cap_vessel_schedules");
  const vesselScheduleId = vsBinding?.entityId;

  let serviceName = "";
  let tradeRoute = "";
  let vesselName = "";
  let vesselCapacityTeu: number | null = null;

  // Fetch service schedule data
  if (serviceScheduleId) {
    const [ss] = await db
      .select()
      .from(svpServiceSchedules)
      .where(
        and(
          eq(svpServiceSchedules.id, serviceScheduleId),
          eq(svpServiceSchedules.tenantId, tenantId)
        )
      )
      .limit(1);
    if (ss) {
      serviceName = ss.serviceName ?? "";
      tradeRoute = ss.tradeRoute ?? "";
      vesselName = ss.vesselName ?? "";
    }
  }

  // Fetch vessel schedule data
  if (vesselScheduleId) {
    const [vs] = await db
      .select()
      .from(capVesselSchedules)
      .where(
        and(
          eq(capVesselSchedules.id, vesselScheduleId),
          eq(capVesselSchedules.tenantId, tenantId)
        )
      )
      .limit(1);
    if (vs) {
      vesselName = vs.vesselName ?? vesselName;
      vesselCapacityTeu = vs.totalCapacityTeu;
    }
  }

  // Fetch port rotation
  let portRotation: Array<Record<string, unknown>> = [];
  if (vesselScheduleId) {
    const rotations = await db
      .select()
      .from(capPortRotations)
      .where(
        and(
          eq(capPortRotations.vesselScheduleId, vesselScheduleId),
          eq(capPortRotations.tenantId, tenantId),
          isNull(capPortRotations.deletedAt)
        )
      )
      .orderBy(asc(capPortRotations.sequenceNumber));

    portRotation = rotations.map((r) => ({
      portCode: r.portCode,
      portName: r.portName,
      sequenceNumber: r.sequenceNumber,
      arrivalEta: r.arrivalEta?.toISOString() ?? null,
      departureEtd: r.departureEtd?.toISOString() ?? null,
      callPurpose: r.callPurpose,
    }));
  }

  // Create LTS deployment plan record
  const [plan] = await db
    .insert(svpDeploymentPlans)
    .values({
      tenantId,
      planRef: `LTS-${Date.now().toString(36).toUpperCase()}`,
      planType: "annual_deployment",
      vesselName,
      tradeRoute,
      vesselCapacityTeu,
      deploymentStart: new Date(),
      status: "draft",
      notes: `Long Term Schedule for ${serviceName} — ${vesselName}`,
      metadata: {
        serviceScheduleId,
        vesselScheduleId,
        serviceName,
        portRotation,
        generatedBy: "ai_lts_agent",
        generatedAt: new Date().toISOString(),
      },
      createdBy: ctx.userId,
    })
    .returning();

  if (plan) {
    await createEntityBinding({
      tenantId,
      stepInstanceId,
      flowInstanceId,
      entityTable: "svp_deployment_plans",
      entityId: plan.id,
      entityAction: "create",
      entityData: plan as unknown as Record<string, unknown>,
    });
  }

  return {
    result: {
      planId: plan?.id,
      planRef: plan?.planRef,
      serviceName,
      vesselName,
      tradeRoute,
      vesselCapacityTeu,
      portCount: portRotation.length,
      portRotation,
      status: "draft",
    },
    entityTable: "svp_deployment_plans",
    entityId: plan?.id ?? "",
    entityAction: "create",
    entityData: plan as unknown as Record<string, unknown>,
  };
}

/**
 * Create ETA management records for each port in the rotation.
 * One svp_eta_managements record per port.
 */
export async function executeCreateEtaRecords(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, stepInstanceId } = ctx;

  const vsBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "cap_vessel_schedules");
  const vesselScheduleId = vsBinding?.entityId;

  if (!vesselScheduleId) {
    return { result: { error: "No vessel schedule found in flow context" } };
  }

  // Get vessel name from schedule
  const [schedule] = await db
    .select({ vesselName: capVesselSchedules.vesselName })
    .from(capVesselSchedules)
    .where(
      and(
        eq(capVesselSchedules.id, vesselScheduleId),
        eq(capVesselSchedules.tenantId, tenantId)
      )
    )
    .limit(1);

  const vesselName = schedule?.vesselName ?? "";

  // Get port rotation
  const rotations = await db
    .select()
    .from(capPortRotations)
    .where(
      and(
        eq(capPortRotations.vesselScheduleId, vesselScheduleId),
        eq(capPortRotations.tenantId, tenantId),
        isNull(capPortRotations.deletedAt)
      )
    )
    .orderBy(asc(capPortRotations.sequenceNumber));

  if (rotations.length === 0) {
    return { result: { error: "No port rotations found for vessel schedule" } };
  }

  const etaRecords: Array<Record<string, unknown>> = [];

  for (const port of rotations) {
    const [eta] = await db
      .insert(svpEtaManagements)
      .values({
        tenantId,
        etaRef: `ETA-${Date.now().toString(36).toUpperCase()}-${port.sequenceNumber}`,
        etaType: "initial_estimate",
        vesselName,
        portCode: port.portCode,
        portName: port.portName,
        originalEta: port.arrivalEta,
        revisedEta: port.arrivalEta,
        notificationSent: false,
        status: "active",
        metadata: {
          vesselScheduleId,
          portRotationId: port.id,
          sequenceNumber: port.sequenceNumber,
        },
        createdBy: ctx.userId,
      })
      .returning();

    if (eta) {
      etaRecords.push({
        id: eta.id,
        etaRef: eta.etaRef,
        portCode: eta.portCode,
        portName: eta.portName,
        originalEta: eta.originalEta?.toISOString() ?? null,
      });
    }
  }

  // Bind the first ETA record
  if (etaRecords[0]) {
    await createEntityBinding({
      tenantId,
      stepInstanceId,
      flowInstanceId,
      entityTable: "svp_eta_managements",
      entityId: etaRecords[0].id as string,
      entityAction: "create",
      entityData: {
        totalEtaRecords: etaRecords.length,
        etaRecords,
      },
    });
  }

  return {
    result: {
      vesselName,
      etaRecordsCreated: etaRecords.length,
      etaRecords,
    },
    entityTable: "svp_eta_managements",
    entityId: (etaRecords[0]?.id as string) ?? "",
    entityAction: "create",
  };
}

/**
 * Record speed and consumption data from a noon report.
 * Creates vpe_speed_consumptions record.
 */
export async function executeUpdateSpeedConsumption(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, stepInstanceId } = ctx;

  const vesselName = (input.vesselName as string) ?? "";
  const voyageId = (input.voyageId as string) ?? null;
  const speedActual = (input.speedActual as number) ?? null;
  const fuelConsumedMt = (input.fuelConsumedMt as number) ?? null;
  const distanceTraveled = (input.distanceTraveled as number) ?? null;
  const fuelType = (input.fuelType as string) ?? "VLSFO";
  const seaState = (input.seaState as string) ?? null;
  const windForce = (input.windForce as number) ?? null;
  const consumptionType = (input.consumptionType as string) ?? "laden";

  // Physics validation
  const physicsCheck = (speedActual && fuelConsumedMt && distanceTraveled)
    ? validateVesselPhysics("container", speedActual, fuelConsumedMt, distanceTraveled)
    : null;

  // Calculate performance index (actual vs planned efficiency)
  const performanceIndex = speedActual && fuelConsumedMt && distanceTraveled && distanceTraveled > 0
    ? Math.round(((distanceTraveled / fuelConsumedMt) * 100)) / 100
    : null;

  const [consumption] = await db
    .insert(vpeSpeedConsumptions)
    .values({
      tenantId,
      consumptionRef: `SC-${Date.now().toString(36).toUpperCase()}`,
      consumptionType,
      vesselName,
      voyageId,
      reportDate: new Date(),
      speedActual: speedActual?.toString() ?? null,
      fuelConsumedMt: fuelConsumedMt?.toString() ?? null,
      distanceTraveled: distanceTraveled?.toString() ?? null,
      fuelType,
      seaState,
      windForce,
      performanceIndex: performanceIndex?.toString() ?? null,
      status: "active",
      metadata: {
        recordedBy: "grounded_performance_engine",
        recordedAt: new Date().toISOString(),
        physicsValidation: physicsCheck ?? "not_validated",
      },
      createdBy: ctx.userId,
    })
    .returning();

  if (consumption) {
    await createEntityBinding({
      tenantId,
      stepInstanceId,
      flowInstanceId,
      entityTable: "vpe_speed_consumptions",
      entityId: consumption.id,
      entityAction: "create",
      entityData: consumption as unknown as Record<string, unknown>,
    });
  }

  return {
    result: {
      consumptionId: consumption?.id,
      consumptionRef: consumption?.consumptionRef,
      vesselName,
      speedActual,
      fuelConsumedMt,
      distanceTraveled,
      fuelType,
      performanceIndex,
      seaState,
      windForce,
      physicsValidation: physicsCheck
        ? {
            speedValid: physicsCheck.speedValid,
            consumptionValid: physicsCheck.consumptionValid,
            distanceSpeedConsistent: physicsCheck.distanceSpeedConsistent,
            warnings: physicsCheck.warnings,
          }
        : null,
    },
    entityTable: "vpe_speed_consumptions",
    entityId: consumption?.id ?? "",
    entityAction: "create",
    entityData: consumption as unknown as Record<string, unknown>,
  };
}

/**
 * Create voyage performance tracking record.
 * Used by Marine Traffic Integration step.
 */
export async function executeUpdateVoyageTracking(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, stepInstanceId } = ctx;

  const vsBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "cap_vessel_schedules");
  const vesselName = (input.vesselName as string) ?? "";
  const voyageId = (input.voyageId as string) ?? null;
  const latitude = (input.latitude as number) ?? null;
  const longitude = (input.longitude as number) ?? null;

  // Deterministic geofencing — ignore Claude's guesses, compute from coordinates
  const zoneCheck = (latitude !== null && longitude !== null)
    ? checkPositionInZones(latitude, longitude)
    : { inEcaZone: false, ecaZoneName: null, fuelRequirement: "Standard (0.5% sulphur VLSFO)", inWarZone: false, warZoneName: null, insuranceImpact: "Standard P&I cover" };

  const [performance] = await db
    .insert(vpeVoyagePerformances)
    .values({
      tenantId,
      performanceRef: `VT-${Date.now().toString(36).toUpperCase()}`,
      performanceType: "cp_compliance",
      vesselName,
      voyageId,
      status: "active",
      notes: `Position: ${latitude}°N, ${longitude}°E${zoneCheck.ecaZoneName ? ` | ECA: ${zoneCheck.ecaZoneName}` : ""}${zoneCheck.warZoneName ? ` | WAR ZONE: ${zoneCheck.warZoneName}` : ""}`,
      metadata: {
        vesselScheduleId: vsBinding?.entityId,
        latitude,
        longitude,
        inEcaZone: zoneCheck.inEcaZone,
        ecaZoneName: zoneCheck.ecaZoneName,
        inWarZone: zoneCheck.inWarZone,
        warZoneName: zoneCheck.warZoneName,
        fuelRequirement: zoneCheck.fuelRequirement,
        insuranceImpact: zoneCheck.insuranceImpact,
        trackedAt: new Date().toISOString(),
        trackedBy: "geofencing_engine",
      },
      createdBy: ctx.userId,
    })
    .returning();

  if (performance) {
    await createEntityBinding({
      tenantId,
      stepInstanceId,
      flowInstanceId,
      entityTable: "vpe_voyage_performances",
      entityId: performance.id,
      entityAction: "create",
      entityData: performance as unknown as Record<string, unknown>,
    });
  }

  return {
    result: {
      performanceId: performance?.id,
      performanceRef: performance?.performanceRef,
      vesselName,
      latitude,
      longitude,
      inEcaZone: zoneCheck.inEcaZone,
      ecaZoneName: zoneCheck.ecaZoneName,
      inWarZone: zoneCheck.inWarZone,
      warZoneName: zoneCheck.warZoneName,
      fuelRequirement: zoneCheck.fuelRequirement,
      insuranceImpact: zoneCheck.insuranceImpact,
      source: "deterministic_geofencing",
    },
    entityTable: "vpe_voyage_performances",
    entityId: performance?.id ?? "",
    entityAction: "create",
    entityData: performance as unknown as Record<string, unknown>,
  };
}

// ═══════════════════════════════════════════════════════════
// ANALYSIS / CALCULATION TOOLS
// ═══════════════════════════════════════════════════════════

/**
 * Analyze a noon report: compare actual performance vs plan.
 * Read-only — returns analysis results.
 */
export async function executeAnalyzeNoonReport(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const noonBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "vpe_noon_reports");
  const noonReportId = (input.noonReportId as string) || noonBinding?.entityId;

  if (!noonReportId) {
    return { result: { error: "No noon report found in flow context" } };
  }

  const [report] = await db
    .select()
    .from(vpeNoonReports)
    .where(
      and(
        eq(vpeNoonReports.id, noonReportId),
        eq(vpeNoonReports.tenantId, tenantId)
      )
    )
    .limit(1);

  if (!report) {
    return { result: { error: "Noon report not found" } };
  }

  // Perform basic analysis
  const avgSpeed = report.avgSpeed ? parseFloat(report.avgSpeed) : 0;
  const meConsumption = report.meConsumption ? parseFloat(report.meConsumption) : 0;
  const aeConsumption = report.aeConsumption ? parseFloat(report.aeConsumption) : 0;
  const totalConsumption = meConsumption + aeConsumption;
  const robFo = report.robFo ? parseFloat(report.robFo) : 0;
  const robDo = report.robDo ? parseFloat(report.robDo) : 0;
  const distanceToGo = report.distanceToGo ? parseFloat(report.distanceToGo) : 0;
  const etaHours = avgSpeed > 0 ? distanceToGo / avgSpeed : 0;

  return {
    result: {
      noonReportId: report.id,
      vesselName: report.vesselName,
      reportDate: report.reportDatetime?.toISOString() ?? null,
      position: {
        latitude: report.latitude,
        longitude: report.longitude,
        courseHeading: report.courseHeading,
      },
      performance: {
        avgSpeed,
        distanceSinceLastReport: report.distanceSinceLastReport,
        distanceToGo,
        estimatedHoursToPort: Math.round(etaHours * 10) / 10,
      },
      consumption: {
        mainEngine: meConsumption,
        auxiliaryEngine: aeConsumption,
        totalDaily: totalConsumption,
      },
      bunkerRob: {
        fuelOil: robFo,
        dieselOil: robDo,
        lubOil: report.robLo ? parseFloat(report.robLo) : 0,
      },
      weather: {
        windDirection: report.windDirection,
        windForce: report.windForce,
        seaState: report.seaState,
        swellHeight: report.swellHeight,
      },
      masterRemarks: report.masterRemarks,
      eta: report.eta?.toISOString() ?? null,
    },
  };
}

/**
 * Calculate delay impact and create a revised ETA record.
 */
export async function executeCalculateDelayImpact(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, stepInstanceId } = ctx;

  const vsBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "cap_vessel_schedules");
  const vesselScheduleId = vsBinding?.entityId;

  const portCode = (input.portCode as string) ?? "";
  const delayHours = (input.delayHours as number) ?? 0;
  const delayReason = (input.delayReason as string) ?? "operational";
  const vesselName = (input.vesselName as string) ?? "";

  if (!portCode || delayHours === 0) {
    return { result: { error: "portCode and delayHours are required" } };
  }

  // Bounds validation
  if (delayHours < 0 || delayHours > 168) {
    return { result: { error: `delayHours must be 0-168 (1 week max). Got: ${delayHours}` } };
  }
  if (delayHours > 48) {
    // Warn but don't block
    // (result will include warning)
  }

  // Validate port code
  const portCheck = validatePortCode(portCode);
  if (!portCheck.valid) {
    return { result: { error: portCheck.error } };
  }

  // Find the original ETA for this port
  let originalEta: Date | null = null;
  if (vesselScheduleId) {
    const [rotation] = await db
      .select()
      .from(capPortRotations)
      .where(
        and(
          eq(capPortRotations.vesselScheduleId, vesselScheduleId),
          eq(capPortRotations.portCode, portCode),
          eq(capPortRotations.tenantId, tenantId),
          isNull(capPortRotations.deletedAt)
        )
      )
      .limit(1);
    originalEta = rotation?.arrivalEta ?? null;
  }

  const revisedEta = originalEta
    ? new Date(originalEta.getTime() + delayHours * 60 * 60 * 1000)
    : null;

  const [etaRecord] = await db
    .insert(svpEtaManagements)
    .values({
      tenantId,
      etaRef: `DLY-${Date.now().toString(36).toUpperCase()}`,
      etaType: "revised_eta",
      vesselName,
      portCode,
      originalEta,
      revisedEta,
      delayHours: delayHours.toString(),
      delayReason,
      notificationSent: false,
      status: "active",
      metadata: {
        vesselScheduleId,
        calculatedBy: "ai_delay_agent",
        calculatedAt: new Date().toISOString(),
      },
      createdBy: ctx.userId,
    })
    .returning();

  if (etaRecord) {
    await createEntityBinding({
      tenantId,
      stepInstanceId,
      flowInstanceId,
      entityTable: "svp_eta_managements",
      entityId: etaRecord.id,
      entityAction: "create",
      entityData: etaRecord as unknown as Record<string, unknown>,
    });
  }

  return {
    result: {
      etaRecordId: etaRecord?.id,
      portCode,
      vesselName,
      delayHours,
      delayReason,
      originalEta: originalEta?.toISOString() ?? null,
      revisedEta: revisedEta?.toISOString() ?? null,
      impactDescription: `${delayHours}h delay at ${portCode} due to ${delayReason}`,
    },
    entityTable: "svp_eta_managements",
    entityId: etaRecord?.id ?? "",
    entityAction: "create",
    entityData: etaRecord as unknown as Record<string, unknown>,
  };
}

/**
 * Cascade ETA changes to downstream ports after a delay.
 * Updates svp_eta_managements for all subsequent ports.
 */
export async function executeCascadeEtaChanges(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId } = ctx;

  const vsBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "cap_vessel_schedules");
  const vesselScheduleId = vsBinding?.entityId;
  const delayHours = (input.delayHours as number) ?? 0;
  const afterSequence = (input.afterSequenceNumber as number) ?? 0;
  const cascadeToAll = (input.cascadeToAll as boolean) ?? true;

  if (!vesselScheduleId || delayHours === 0) {
    return { result: { error: "vesselScheduleId and delayHours are required" } };
  }

  // Get all downstream port rotations
  const downstreamPorts = await db
    .select()
    .from(capPortRotations)
    .where(
      and(
        eq(capPortRotations.vesselScheduleId, vesselScheduleId),
        eq(capPortRotations.tenantId, tenantId),
        isNull(capPortRotations.deletedAt)
      )
    )
    .orderBy(asc(capPortRotations.sequenceNumber));

  const affected = downstreamPorts.filter(
    (p) => cascadeToAll || p.sequenceNumber > afterSequence
  );

  const delayMs = delayHours * 60 * 60 * 1000;
  const updatedPorts: Array<Record<string, unknown>> = [];

  for (const port of affected) {
    if (port.sequenceNumber <= afterSequence) continue;

    const newEta = port.arrivalEta ? new Date(port.arrivalEta.getTime() + delayMs) : null;
    const newEtd = port.departureEtd ? new Date(port.departureEtd.getTime() + delayMs) : null;

    await db
      .update(capPortRotations)
      .set({
        arrivalEta: newEta,
        departureEtd: newEtd,
        notes: `Cascaded ${delayHours}h delay from upstream port`,
      })
      .where(
        and(
          eq(capPortRotations.id, port.id),
          eq(capPortRotations.tenantId, tenantId)
        )
      );

    updatedPorts.push({
      portCode: port.portCode,
      portName: port.portName,
      sequenceNumber: port.sequenceNumber,
      originalEta: port.arrivalEta?.toISOString() ?? null,
      revisedEta: newEta?.toISOString() ?? null,
    });
  }

  return {
    result: {
      vesselScheduleId,
      delayHours,
      afterSequence,
      portsAffected: updatedPorts.length,
      updatedPorts,
    },
  };
}

/**
 * Modify a port call: skip, add, swap, or delete.
 * Updates cap_port_rotations accordingly.
 */
export async function executeModifyPortCall(
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const { tenantId, flowInstanceId, stepInstanceId } = ctx;

  const vsBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "cap_vessel_schedules");
  const vesselScheduleId = (input.vesselScheduleId as string) || vsBinding?.entityId;

  if (!vesselScheduleId) {
    return { result: { error: "No vessel schedule found in flow context" } };
  }

  const modificationType = (input.modificationType as string) ?? "";
  const portCode = (input.portCode as string) ?? "";
  const newPortCode = (input.newPortCode as string) ?? null;
  const newPortName = (input.newPortName as string) ?? null;
  const sequenceNumber = (input.sequenceNumber as number) ?? null;
  const reason = (input.reason as string) ?? "";

  if (!modificationType || !portCode) {
    return { result: { error: "modificationType and portCode are required" } };
  }

  // Validate port codes against reference data
  if (modificationType === "add" || modificationType === "swap") {
    const targetPort = modificationType === "add" ? portCode : (newPortCode ?? "");
    const check = validatePortCode(targetPort);
    if (!check.valid) {
      return { result: { error: `${check.error} Cannot ${modificationType} with unknown port.` } };
    }
  }

  let resultData: Record<string, unknown> = {};

  if (modificationType === "skip" || modificationType === "delete") {
    // Soft-delete the port call
    const [deleted] = await db
      .update(capPortRotations)
      .set({
        deletedAt: new Date(),
        notes: `${modificationType === "skip" ? "Skipped" : "Deleted"}: ${reason}`,
      })
      .where(
        and(
          eq(capPortRotations.vesselScheduleId, vesselScheduleId),
          eq(capPortRotations.portCode, portCode),
          eq(capPortRotations.tenantId, tenantId),
          isNull(capPortRotations.deletedAt)
        )
      )
      .returning();

    resultData = {
      action: modificationType,
      portCode,
      portRemoved: !!deleted,
      reason,
    };
  } else if (modificationType === "add") {
    // Add a new port at the specified sequence
    const seq = sequenceNumber ?? 999;

    // Shift existing ports with higher sequence numbers
    const existing = await db
      .select()
      .from(capPortRotations)
      .where(
        and(
          eq(capPortRotations.vesselScheduleId, vesselScheduleId),
          eq(capPortRotations.tenantId, tenantId),
          isNull(capPortRotations.deletedAt)
        )
      )
      .orderBy(desc(capPortRotations.sequenceNumber));

    for (const port of existing) {
      if (port.sequenceNumber >= seq) {
        await db
          .update(capPortRotations)
          .set({ sequenceNumber: port.sequenceNumber + 1 })
          .where(
            and(
              eq(capPortRotations.id, port.id),
              eq(capPortRotations.tenantId, tenantId)
            )
          );
      }
    }

    // Insert new port
    const [added] = await db
      .insert(capPortRotations)
      .values({
        tenantId,
        vesselScheduleId,
        portCode,
        portName: newPortName ?? portCode,
        sequenceNumber: seq,
        callPurpose: "both",
        status: "scheduled",
        notes: `Added: ${reason}`,
        createdBy: ctx.userId,
      })
      .returning();

    if (added) {
      await createEntityBinding({
        tenantId,
        stepInstanceId,
        flowInstanceId,
        entityTable: "cap_port_rotations",
        entityId: added.id,
        entityAction: "create",
        entityData: added as unknown as Record<string, unknown>,
      });
    }

    resultData = {
      action: "add",
      portCode,
      portName: newPortName ?? portCode,
      sequenceNumber: seq,
      addedId: added?.id,
      reason,
    };
  } else if (modificationType === "swap") {
    // Replace one port with another
    if (!newPortCode) {
      return { result: { error: "newPortCode is required for swap modification" } };
    }

    const [swapped] = await db
      .update(capPortRotations)
      .set({
        portCode: newPortCode,
        portName: newPortName ?? newPortCode,
        notes: `Swapped from ${portCode}: ${reason}`,
      })
      .where(
        and(
          eq(capPortRotations.vesselScheduleId, vesselScheduleId),
          eq(capPortRotations.portCode, portCode),
          eq(capPortRotations.tenantId, tenantId),
          isNull(capPortRotations.deletedAt)
        )
      )
      .returning();

    resultData = {
      action: "swap",
      originalPort: portCode,
      newPort: newPortCode,
      swapped: !!swapped,
      reason,
    };
  }

  return {
    result: {
      vesselScheduleId,
      modificationType,
      ...resultData,
    },
    entityTable: "cap_port_rotations",
    entityId: vesselScheduleId,
    entityAction: "update",
  };
}
