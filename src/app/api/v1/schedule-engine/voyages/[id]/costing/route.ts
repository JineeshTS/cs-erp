import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { generatedVoyages, voyagePortCalls, proformaPortCalls } from "@/db/schema/schedule-engine";
import { eq, and, isNull, asc } from "drizzle-orm";
import { calculateVoyageCosts } from "@/lib/engines/voyage-costing";

/**
 * GET /api/v1/schedule-engine/voyages/[id]/costing
 *
 * Calculate voyage cost estimate: PDA per port + bunker per leg + totals.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "schedule:read")))
    return forbiddenResponse();

  const { id } = await params;

  const [voyage] = await db
    .select()
    .from(generatedVoyages)
    .where(and(
      eq(generatedVoyages.id, id),
      eq(generatedVoyages.tenantId, user.tenantId),
      isNull(generatedVoyages.deletedAt),
    ))
    .limit(1);

  if (!voyage) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Voyage not found" } },
      { status: 404 }
    );
  }

  // Get voyage port calls
  const portCalls = await db
    .select()
    .from(voyagePortCalls)
    .where(and(
      eq(voyagePortCalls.voyageId, id),
      eq(voyagePortCalls.tenantId, user.tenantId),
    ))
    .orderBy(asc(voyagePortCalls.sequence));

  // Get proforma port calls for distance/speed data
  const proformaCalls = await db
    .select()
    .from(proformaPortCalls)
    .where(eq(proformaPortCalls.templateId, voyage.templateId))
    .orderBy(asc(proformaPortCalls.sequence));

  // Build port call data with distances
  const portCallData = portCalls.map((pc) => {
    const proforma = proformaCalls.find((p) => p.sequence === pc.sequence);
    return {
      portCode: pc.portCode,
      portName: pc.portName,
      distanceNm: proforma?.distanceNm ? Number(proforma.distanceNm) : undefined,
      speedKnots: proforma?.plannedSpeedKnots ? Number(proforma.plannedSpeedKnots) : undefined,
      portStayHours: proforma?.portStayHours ? Number(proforma.portStayHours) : 24,
    };
  });

  const costSummary = calculateVoyageCosts({
    voyageId: id,
    voyageNumber: voyage.voyageNumber,
    portCalls: portCallData,
    totalDays: voyage.endDate && voyage.startDate
      ? Math.ceil((new Date(voyage.endDate).getTime() - new Date(voyage.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 14,
  });

  return NextResponse.json({ data: costSummary });
}
