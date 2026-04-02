import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { validateCsrfToken } from "@/lib/csrf";
import { db } from "@/lib/db";
import { acmSanctionsScreenings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";
import { screenEntity } from "@/lib/sanctions-screening";

const screenRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(500),
  entityType: z.enum(["individual", "organization"]),
});

/**
 * POST /api/v1/audit-compliance-management/sanctions-screen
 *
 * ERP-123: Screen an entity name against sanctions lists.
 * Stores result in acm_sanctions_screenings table and returns match details.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "compliance:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = screenRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: formatZodErrors(parsed.error),
          },
        },
        { status: 422 }
      );
    }

    const { name, entityType } = parsed.data;

    // Perform screening
    const result = screenEntity(name, entityType, user.tenantId);

    // Determine match status for DB storage
    const matchStatus =
      result.status === "match"
        ? "positive"
        : result.status === "potential_match"
          ? "potential"
          : "clear";

    // Persist screening record
    const screeningRef = `SCR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const now = new Date();

    const [record] = await db
      .insert(acmSanctionsScreenings)
      .values({
        tenantId: user.tenantId,
        screeningRef,
        entityName: name,
        entityType,
        screeningType: "standard",
        listsChecked: JSON.stringify(["OFAC_SDN", "EU_CONSOLIDATED", "UN_CONSOLIDATED"]),
        matchStatus,
        matchDetails: result.matches.length > 0 ? result.matches : null,
        riskScore:
          result.status === "match"
            ? 90
            : result.status === "potential_match"
              ? 50
              : 0,
        screenedBy: user.email,
        screenedAt: now,
        status: "completed",
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning();

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "create",
      entityType: "sanctions-screening",
      entityId: record.id,
      module: "audit-compliance-management",
      newData: {
        name,
        entityType,
        matchStatus,
        matchCount: result.matches.length,
      },
      request,
    });

    return NextResponse.json({
      data: {
        id: record.id,
        screeningRef,
        screened: result.screened,
        status: result.status,
        matches: result.matches,
        riskScore:
          result.status === "match"
            ? 90
            : result.status === "potential_match"
              ? 50
              : 0,
      },
    });
  } catch (error) {
    console.error("[sanctions-screen] Error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
