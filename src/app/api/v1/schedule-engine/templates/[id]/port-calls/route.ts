import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { proformaPortCalls, proformaTemplates } from "@/db/schema/schedule-engine";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";
import { formatZodErrors } from "@/lib/validation";

const portCallSchema = z.object({
  sequence: z.number().int().min(1),
  portCode: z.string().min(2).max(10),
  portName: z.string().min(1).max(100),
  portId: z.string().uuid().optional(),
  distanceNm: z.number().min(0).optional(),
  plannedSpeedKnots: z.number().min(0).max(30).optional(),
  steamingHours: z.number().min(0).optional(),
  portStayHours: z.number().min(0).max(720).default(24),
  dayOffset: z.number().min(0).default(0),
  cargoCutoffHours: z.number().int().min(0).default(48),
  vgmCutoffHours: z.number().int().min(0).default(24),
  docCutoffHours: z.number().int().min(0).default(24),
  callPurpose: z.enum(["loading", "discharging", "both", "bunker", "transit"]).default("both"),
  notes: z.string().max(500).optional(),
});

const bulkSchema = z.object({
  portCalls: z.array(portCallSchema).min(2).max(50),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "schedule:read")))
    return forbiddenResponse();

  const { id } = await params;

  const rows = await db
    .select()
    .from(proformaPortCalls)
    .where(and(
      eq(proformaPortCalls.templateId, id),
      eq(proformaPortCalls.tenantId, user.tenantId),
    ))
    .orderBy(asc(proformaPortCalls.sequence));

  return NextResponse.json({ data: rows });
}

/**
 * POST: Bulk insert port calls for a template.
 * Replaces all existing port calls (delete + insert).
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
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
      { status: 422 }
    );
  }

  // Verify template exists and belongs to tenant
  const [template] = await db
    .select({ id: proformaTemplates.id })
    .from(proformaTemplates)
    .where(and(
      eq(proformaTemplates.id, id),
      eq(proformaTemplates.tenantId, user.tenantId),
    ))
    .limit(1);

  if (!template) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Template not found" } },
      { status: 404 }
    );
  }

  // Replace all port calls in a transaction
  const inserted = await db.transaction(async (tx) => {
    // Delete existing
    await tx.delete(proformaPortCalls).where(
      and(
        eq(proformaPortCalls.templateId, id),
        eq(proformaPortCalls.tenantId, user.tenantId),
      )
    );

    // Insert new
    return tx
      .insert(proformaPortCalls)
      .values(
        parsed.data.portCalls.map((pc) => ({
          tenantId: user.tenantId,
          templateId: id,
          ...pc,
          distanceNm: pc.distanceNm?.toString(),
          plannedSpeedKnots: pc.plannedSpeedKnots?.toString(),
          steamingHours: pc.steamingHours?.toString(),
          portStayHours: pc.portStayHours.toString(),
          dayOffset: pc.dayOffset.toString(),
        }))
      )
      .returning();
  });

  return NextResponse.json({ data: inserted }, { status: 201 });
}
