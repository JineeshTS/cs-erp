import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { oogSecuringPlans } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listSecuringPlans } from "@/lib/oog-special-cargo-management/service";
import { createSecuringPlanSchema } from "@/lib/oog-special-cargo-management/validation";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "oog_special:read")))
      return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const cursor = url.searchParams.get("cursor") || undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const result = await listSecuringPlans({
      tenantId: user.tenantId,
      search,
      status,
      cursor,
      limit,
    });

    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list securing plans:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "oog_special:create")))
      return forbiddenResponse();

    const body = await request.json();
    const parsed = createSecuringPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const securingRef = `OCS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await db.insert(oogSecuringPlans).values({
      ...parsed.data,
      securingRef,
      tenantId: user.tenantId,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create securing plan:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
