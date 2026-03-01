import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cfmCapexItems } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listCapexItems } from "@/lib/costing-financial-management/service";
import { createCapexItemSchema } from "@/lib/costing-financial-management/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "costing:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const cursor = url.searchParams.get("cursor") || undefined;

    const result = await listCapexItems({ tenantId: user.tenantId, search, status, cursor });
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list capex items:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "costing:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createCapexItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const capexRef = `CX-${Date.now()}`;
    const residualValue = parsed.data.residualValue ?? 0;
    const monthlyDepreciation = Math.round((parsed.data.acquisitionCost - residualValue) / parsed.data.usefulLifeMonths);
    const netBookValue = parsed.data.acquisitionCost;

    const [created] = await db.insert(cfmCapexItems).values({
      tenantId: user.tenantId,
      capexRef,
      monthlyDepreciation,
      netBookValue,
      ...parsed.data,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create capex item:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
