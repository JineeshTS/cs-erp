import { db } from "@/lib/db";
import { eq, and, isNull, asc } from "drizzle-orm";
import {
  proformaTemplates,
  proformaPortCalls,
  generatedVoyages,
  voyagePortCalls,
} from "@/db/schema/schedule-engine";
import { generateNextNumber } from "@/lib/number-sequence";

// ── Types ────────────────────────────────────────────────────────

interface GenerateScheduleParams {
  templateId: string;
  tenantId: string;
  vesselId?: string;
  startDate: Date;
  endDate: Date;
  userId?: string;
}

interface GeneratedVoyage {
  id: string;
  voyageNumber: string;
  cycleNumber: number;
  startDate: Date;
  endDate: Date;
  portCalls: GeneratedPortCall[];
}

interface GeneratedPortCall {
  sequence: number;
  portCode: string;
  portName: string;
  portId: string | null;
  plannedArrival: Date;
  plannedDeparture: Date;
  cargoCutoff: Date | null;
  vgmCutoff: Date | null;
  docCutoff: Date | null;
}

// ── ETA Calculator ───────────────────────────────────────────────

/**
 * Calculate arrival time from departure + steaming.
 * distance_nm / speed_knots = steaming_hours → add to departure.
 */
export function calculateEta(
  departureTime: Date,
  distanceNm: number | null,
  speedKnots: number | null,
  steamingHours: number | null
): Date {
  let hours: number;

  if (steamingHours != null && steamingHours > 0) {
    hours = steamingHours;
  } else if (distanceNm != null && speedKnots != null && speedKnots > 0) {
    hours = distanceNm / speedKnots;
  } else {
    hours = 0; // Same port / no transit
  }

  return new Date(departureTime.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Calculate departure time from arrival + port stay.
 */
export function calculateEtd(arrivalTime: Date, portStayHours: number): Date {
  return new Date(arrivalTime.getTime() + portStayHours * 60 * 60 * 1000);
}

/**
 * Calculate cutoff times from departure.
 */
export function calculateCutoffs(
  departure: Date,
  cargoCutoffHours: number,
  vgmCutoffHours: number,
  docCutoffHours: number
): { cargoCutoff: Date; vgmCutoff: Date; docCutoff: Date } {
  return {
    cargoCutoff: new Date(departure.getTime() - cargoCutoffHours * 60 * 60 * 1000),
    vgmCutoff: new Date(departure.getTime() - vgmCutoffHours * 60 * 60 * 1000),
    docCutoff: new Date(departure.getTime() - docCutoffHours * 60 * 60 * 1000),
  };
}

// ── Cascading ETA Impact Analysis ────────────────────────────────

export interface DelayImpact {
  sequence: number;
  portCode: string;
  portName: string;
  originalArrival: Date;
  newArrival: Date;
  delayHours: number;
}

/**
 * Calculate cascading impact when one port's ETA changes.
 * Returns the impact on all downstream ports.
 */
export function calculateCascadingDelay(
  portCalls: Array<{
    sequence: number;
    portCode: string;
    portName: string;
    plannedArrival: Date;
    plannedDeparture: Date;
    distanceNm: number | null;
    speedKnots: number | null;
    steamingHours: number | null;
    portStayHours: number;
  }>,
  delayAtSequence: number,
  delayHours: number
): DelayImpact[] {
  const impacts: DelayImpact[] = [];
  let cumulativeDelayMs = delayHours * 60 * 60 * 1000;

  for (const pc of portCalls) {
    if (pc.sequence <= delayAtSequence) continue;

    const originalArrival = pc.plannedArrival;
    const newArrival = new Date(originalArrival.getTime() + cumulativeDelayMs);

    impacts.push({
      sequence: pc.sequence,
      portCode: pc.portCode,
      portName: pc.portName,
      originalArrival,
      newArrival,
      delayHours: cumulativeDelayMs / (60 * 60 * 1000),
    });
  }

  return impacts;
}

// ── Schedule Generator ───────────────────────────────────────────

/**
 * Generate concrete voyages from a proforma template.
 *
 * For each frequency cycle within the date range:
 * 1. Create a voyage record with auto-generated number
 * 2. Calculate ETAs for each port call using distance/speed/offset
 * 3. Calculate cargo/VGM/doc cutoffs from departure times
 * 4. Store all in generated_voyages + voyage_port_calls
 */
export async function generateSchedule(
  params: GenerateScheduleParams
): Promise<GeneratedVoyage[]> {
  const { templateId, tenantId, vesselId, startDate, endDate, userId } = params;

  // Fetch template
  const [template] = await db
    .select()
    .from(proformaTemplates)
    .where(
      and(
        eq(proformaTemplates.id, templateId),
        eq(proformaTemplates.tenantId, tenantId),
        isNull(proformaTemplates.deletedAt)
      )
    )
    .limit(1);

  if (!template) throw new Error("Template not found");

  // Fetch port calls ordered by sequence
  const portCallDefs = await db
    .select()
    .from(proformaPortCalls)
    .where(
      and(
        eq(proformaPortCalls.templateId, templateId),
        eq(proformaPortCalls.tenantId, tenantId)
      )
    )
    .orderBy(asc(proformaPortCalls.sequence));

  if (portCallDefs.length === 0) throw new Error("Template has no port calls");

  const frequencyMs = template.frequencyDays * 24 * 60 * 60 * 1000;
  const results: GeneratedVoyage[] = [];
  let cycleNumber = 1;
  let currentStart = new Date(startDate);

  while (currentStart <= endDate) {
    // Generate voyage number
    const voyageNumber = await generateNextNumber("voyage", tenantId);

    // Calculate ETAs for each port call
    const portCalls: GeneratedPortCall[] = [];
    let currentTime = new Date(currentStart);

    for (let i = 0; i < portCallDefs.length; i++) {
      const def = portCallDefs[i];
      const portStayHours = Number(def.portStayHours) || 24;
      const distanceNm = def.distanceNm ? Number(def.distanceNm) : null;
      const speedKnots = def.plannedSpeedKnots ? Number(def.plannedSpeedKnots) : null;
      const steamingHours = def.steamingHours ? Number(def.steamingHours) : null;

      let arrival: Date;

      if (i === 0) {
        // First port: arrival = start date + day_offset in hours
        const dayOffsetHours = Number(def.dayOffset) * 24;
        arrival = new Date(currentStart.getTime() + dayOffsetHours * 60 * 60 * 1000);
      } else {
        // Subsequent ports: arrival = previous departure + steaming time
        arrival = calculateEta(currentTime, distanceNm, speedKnots, steamingHours);
      }

      const departure = calculateEtd(arrival, portStayHours);

      const cargoCutoffHours = def.cargoCutoffHours ?? 48;
      const vgmCutoffHours = def.vgmCutoffHours ?? 24;
      const docCutoffHours = def.docCutoffHours ?? 24;
      const cutoffs = calculateCutoffs(departure, cargoCutoffHours, vgmCutoffHours, docCutoffHours);

      portCalls.push({
        sequence: def.sequence,
        portCode: def.portCode,
        portName: def.portName,
        portId: def.portId,
        plannedArrival: arrival,
        plannedDeparture: departure,
        cargoCutoff: cutoffs.cargoCutoff,
        vgmCutoff: cutoffs.vgmCutoff,
        docCutoff: cutoffs.docCutoff,
      });

      currentTime = departure;
    }

    // Calculate voyage end date
    const lastPortCall = portCalls[portCalls.length - 1];
    const voyageEndDate = lastPortCall.plannedDeparture;

    // Insert voyage + port calls in a transaction
    const voyage = await db.transaction(async (tx) => {
      const [v] = await tx
        .insert(generatedVoyages)
        .values({
          tenantId,
          templateId,
          vesselId: vesselId || null,
          voyageNumber,
          cycleNumber,
          startDate: currentStart.toISOString().slice(0, 10),
          endDate: voyageEndDate.toISOString().slice(0, 10),
          status: "planned",
          createdBy: userId || null,
        })
        .returning();

      // Insert port calls
      await tx.insert(voyagePortCalls).values(
        portCalls.map((pc) => ({
          tenantId,
          voyageId: v.id,
          proformaPortCallId: null,
          sequence: pc.sequence,
          portId: pc.portId,
          portCode: pc.portCode,
          portName: pc.portName,
          plannedArrival: pc.plannedArrival,
          plannedDeparture: pc.plannedDeparture,
          cargoCutoff: pc.cargoCutoff,
          vgmCutoff: pc.vgmCutoff,
          docCutoff: pc.docCutoff,
          status: "scheduled",
          callPurpose: "both",
        }))
      );

      return v;
    });

    results.push({
      id: voyage.id,
      voyageNumber,
      cycleNumber,
      startDate: currentStart,
      endDate: voyageEndDate,
      portCalls,
    });

    // Move to next frequency cycle
    currentStart = new Date(currentStart.getTime() + frequencyMs);
    cycleNumber++;
  }

  // Activate template if still draft
  if (template.status === "draft") {
    await db
      .update(proformaTemplates)
      .set({ status: "active", updatedBy: userId || null })
      .where(eq(proformaTemplates.id, templateId));
  }

  return results;
}
