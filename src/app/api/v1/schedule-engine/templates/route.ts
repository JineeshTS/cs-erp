import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { proformaTemplates } from "@/db/schema/schedule-engine";
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

const createSchema = z.object({
  serviceName: z.string().min(1).max(100),
  serviceCode: z.string().min(1).max(20),
  frequencyDays: z.number().int().min(1).max(365).default(7),
  totalRotationDays: z.number().int().min(1).max(365).default(14),
  direction: z.enum(["outbound", "inbound", "round_trip"]).default("outbound"),
  serviceLoopId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "schedule:read")))
    return forbiddenResponse();

  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  const status = request.nextUrl.searchParams.get("status") || "";

  const rows = await db
    .select()
    .from(proformaTemplates)
    .where(and(
      eq(proformaTemplates.tenantId, user.tenantId),
      isNull(proformaTemplates.deletedAt),
      q ? or(ilike(proformaTemplates.serviceName, `%${q}%`), ilike(proformaTemplates.serviceCode, `%${q}%`)) : undefined,
      status ? eq(proformaTemplates.status, status) : undefined,
    ))
    .orderBy(desc(proformaTemplates.createdAt))
    .limit(50);

  return NextResponse.json({ data: rows });
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "schedule:create")))
    return forbiddenResponse();

  const csrfError = validateCsrfToken(request);
  if (csrfError) return csrfError;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
      { status: 422 }
    );
  }

  try {
    const [created] = await db
      .insert(proformaTemplates)
      .values({
        tenantId: user.tenantId,
        ...parsed.data,
        createdBy: user.id,
      })
      .returning();

    await logBusinessAudit({ tenantId: user.tenantId, userId: user.id, action: "create", entityType: "proforma_template", entityId: created.id, newData: created as Record<string, unknown> });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "Service code already exists for this tenant" } },
        { status: 409 }
      );
    }
    throw err;
  }
}
