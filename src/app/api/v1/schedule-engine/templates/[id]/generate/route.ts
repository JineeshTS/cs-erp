import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { generateSchedule } from "@/lib/schedule-engine/generator";
import { z } from "zod";
import { formatZodErrors } from "@/lib/validation";

const generateSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  vesselId: z.string().uuid().optional(),
});

/**
 * POST /api/v1/schedule-engine/templates/[id]/generate
 *
 * Generate concrete voyages from a proforma template.
 * Takes a start date, end date, and optional vessel assignment.
 * Returns the generated voyages with all port calls and calculated ETAs.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "schedule:create")))
    return forbiddenResponse();

  const csrfError = validateCsrfToken(request);
  if (csrfError) return csrfError;

  const { id } = await params;
  const body = await request.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
      { status: 422 }
    );
  }

  try {
    const voyages = await generateSchedule({
      templateId: id,
      tenantId: user.tenantId,
      vesselId: parsed.data.vesselId,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      userId: user.id,
    });

    return NextResponse.json({
      data: {
        templateId: id,
        voyagesGenerated: voyages.length,
        voyages: voyages.map((v) => ({
          id: v.id,
          voyageNumber: v.voyageNumber,
          cycleNumber: v.cycleNumber,
          startDate: v.startDate.toISOString().slice(0, 10),
          endDate: v.endDate.toISOString().slice(0, 10),
          portCalls: v.portCalls.map((pc) => ({
            sequence: pc.sequence,
            portCode: pc.portCode,
            portName: pc.portName,
            arrival: pc.plannedArrival.toISOString(),
            departure: pc.plannedDeparture.toISOString(),
            cargoCutoff: pc.cargoCutoff?.toISOString() || null,
          })),
        })),
      },
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate schedule";
    console.error("[schedule-engine/generate] Error:", err);
    return NextResponse.json(
      { error: { code: "GENERATION_FAILED", message } },
      { status: 422 }
    );
  }
}
