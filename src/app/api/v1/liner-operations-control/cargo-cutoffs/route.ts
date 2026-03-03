import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { locCargoCutoffs } from "@/db/schema";
import { listCargoCutoffs } from "@/lib/liner-operations-control/service";
import { createCargoCutoffSchema } from "@/lib/liner-operations-control/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "loc:read"))) return forbiddenResponse();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 50);

    const result = await listCargoCutoffs({ tenantId: user.tenantId, search, status, cursor, limit });
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list cargo cutoffs:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "loc:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createCargoCutoffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [record] = await db
      .insert(locCargoCutoffs)
      .values({
        ...parsed.data,
        cutoffRef: `CCO-${Date.now()}`,
        tenantId: user.tenantId,
        status: "draft",
      })
      .returning();

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cargo cutoff:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
