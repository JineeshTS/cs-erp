import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import crypto from "crypto";
import { db } from "@/lib/db";
import { icmCargoInsurancePolicies } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCargoInsurancePolicySchema } from "@/lib/insurance-claims-management/validation";
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm";
import { formatZodErrors , escapeIlike } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "insurance:read"))) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const cursor = searchParams.get("cursor") ?? "";
    const limit = 50;

    const conditions = [
      eq(icmCargoInsurancePolicies.tenantId, user.tenantId),
      isNull(icmCargoInsurancePolicies.deletedAt),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(icmCargoInsurancePolicies.policyRef, `%${escapeIlike(search)}%`),
          ilike(icmCargoInsurancePolicies.insurerName, `%${escapeIlike(search)}%`),
          ilike(icmCargoInsurancePolicies.vesselName, `%${escapeIlike(search)}%`)
        )!
      );
    }

    if (status) {
      conditions.push(eq(icmCargoInsurancePolicies.status, status));
    }

    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) {
      conditions.push(cursorCondition(icmCargoInsurancePolicies.createdAt, icmCargoInsurancePolicies.id, parsedCursor));
    }

    const results = await db
      .select()
      .from(icmCargoInsurancePolicies)
      .where(and(...conditions))
      .orderBy(desc(icmCargoInsurancePolicies.createdAt), desc(icmCargoInsurancePolicies.id))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({
      data,
      meta: {
        cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Failed to list cargo insurance policies:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "insurance:create"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createCargoInsurancePolicySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const policyRef = `ICI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await db
      .insert(icmCargoInsurancePolicies)
      .values({
        ...parsed.data,
        policyRef,
        tenantId: user.tenantId,
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "cargo-insurance-policies", entityId: created.id, module: "insurance-claims-management", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cargo insurance policy:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
