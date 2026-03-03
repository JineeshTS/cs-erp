import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { tcmCashPoolingSweeps } from "@/db/schema";
import { listCashPoolingSweeps } from "@/lib/treasury-cash-management/service";
import { createCashPoolingSweepSchema } from "@/lib/treasury-cash-management/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "treasury:read")))
      return forbiddenResponse();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 50);

    const result = await listCashPoolingSweeps({ tenantId: user.tenantId, search, status, cursor, limit });

    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list cash pooling sweeps:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "treasury:create")))
      return forbiddenResponse();

    const body = await request.json();
    const parsed = createCashPoolingSweepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [record] = await db
      .insert(tcmCashPoolingSweeps)
      .values({
        ...parsed.data,
        sweepRef: `TCS-${Date.now()}`,
        tenantId: user.tenantId,
        status: "active",
      })
      .returning();

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cash pooling sweep:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
