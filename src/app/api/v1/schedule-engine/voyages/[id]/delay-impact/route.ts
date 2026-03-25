import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { voyagePortCalls } from "@/db/schema/schedule-engine";
import { proformaPortCalls, generatedVoyages } from "@/db/schema/schedule-engine";
import { eq, and, asc } from "drizzle-orm";
import { calculateCascadingDelay } from "@/lib/schedule-engine/generator";
import { z } from "zod";
import { formatZodErrors } from "@/lib/validation";

const delaySchema = z.object({
  /** Port call sequence where the delay occurs */
  atSequence: z.number().int().min(1),
  /** Delay in hours (positive = late, negative = early) */
  delayHours: z.number(),
});

/**
 * POST /api/v1/schedule-engine/voyages/[id]/delay-impact
 *
 * Calculate cascading impact of a delay at a specific port.
 * Shows how all downstream ports are affected.
 * Does NOT modify any data — read-only analysis.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "schedule:read")))
    return forbiddenResponse();

  const { id } = await params;
  const body = await request.json();
  const parsed = delaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
      { status: 422 }
    );
  }

  // Get voyage
  const [voyage] = await db.select().from(generatedVoyages)
    .where(and(eq(generatedVoyages.id, id), eq(generatedVoyages.tenantId, user.tenantId)))
    .limit(1);

  if (!voyage) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Voyage not found" } }, { status: 404 });
  }

  // Get port calls with proforma data for distances
  const portCalls = await db.select().from(voyagePortCalls)
    .where(and(eq(voyagePortCalls.voyageId, id), eq(voyagePortCalls.tenantId, user.tenantId)))
    .orderBy(asc(voyagePortCalls.sequence));

  const proformaCalls = await db.select().from(proformaPortCalls)
    .where(eq(proformaPortCalls.templateId, voyage.templateId))
    .orderBy(asc(proformaPortCalls.sequence));

  // Build enriched port call data
  const enriched = portCalls.map((pc) => {
    const pf = proformaCalls.find((p) => p.sequence === pc.sequence);
    return {
      sequence: pc.sequence,
      portCode: pc.portCode,
      portName: pc.portName,
      plannedArrival: new Date(pc.plannedArrival),
      plannedDeparture: new Date(pc.plannedDeparture),
      distanceNm: pf?.distanceNm ? Number(pf.distanceNm) : null,
      speedKnots: pf?.plannedSpeedKnots ? Number(pf.plannedSpeedKnots) : null,
      steamingHours: pf?.steamingHours ? Number(pf.steamingHours) : null,
      portStayHours: pf?.portStayHours ? Number(pf.portStayHours) : 24,
    };
  });

  const impacts = calculateCascadingDelay(enriched, parsed.data.atSequence, parsed.data.delayHours);

  const delayPort = portCalls.find((pc) => pc.sequence === parsed.data.atSequence);

  return NextResponse.json({
    data: {
      voyageNumber: voyage.voyageNumber,
      delayAt: {
        sequence: parsed.data.atSequence,
        portCode: delayPort?.portCode,
        portName: delayPort?.portName,
        delayHours: parsed.data.delayHours,
      },
      impacts: impacts.map((i) => ({
        sequence: i.sequence,
        portCode: i.portCode,
        portName: i.portName,
        originalArrival: i.originalArrival.toISOString(),
        newArrival: i.newArrival.toISOString(),
        delayHours: Math.round(i.delayHours * 10) / 10,
      })),
      summary: {
        portsAffected: impacts.length,
        maxDelayHours: impacts.length > 0 ? Math.max(...impacts.map((i) => i.delayHours)) : 0,
      },
    },
  });
}
