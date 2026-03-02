import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { icmCargoInsurancePolicies } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCargoInsurancePolicySchema } from "@/lib/insurance-claims-management/validation";
import { eq, and, isNull, desc, ilike, or, gt } from "drizzle-orm";

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
          ilike(icmCargoInsurancePolicies.policyRef, `%${search}%`),
          ilike(icmCargoInsurancePolicies.insurerName, `%${search}%`),
          ilike(icmCargoInsurancePolicies.vesselName, `%${search}%`)
        )!
      );
    }

    if (status) {
      conditions.push(eq(icmCargoInsurancePolicies.status, status));
    }

    if (cursor) {
      conditions.push(gt(icmCargoInsurancePolicies.createdAt, new Date(cursor)));
    }

    const results = await db
      .select()
      .from(icmCargoInsurancePolicies)
      .where(and(...conditions))
      .orderBy(desc(icmCargoInsurancePolicies.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({
      data,
      meta: {
        cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined,
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

    const body = await request.json();
    const parsed = createCargoInsurancePolicySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
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

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cargo insurance policy:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
