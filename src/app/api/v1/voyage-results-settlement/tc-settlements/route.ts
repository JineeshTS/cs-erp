import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listTcSettlements } from "@/lib/voyage-results-settlement/service";
import { createTcSettlementSchema } from "@/lib/voyage-results-settlement/validation";
import { db } from "@/lib/db";
import { vrsTcSettlements } from "@/db/schema";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "vrs:read")))
      return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const result = await listTcSettlements({
      tenantId: user.tenantId,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    });
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list TC settlements:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "vrs:create")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createTcSettlementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [record] = await db.insert(vrsTcSettlements).values({
      tenantId: user.tenantId,
      settlementRef: `TS-${nanoid(12)}`,
      ...parsed.data,
      status: "draft",
    }).returning();

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("Failed to create TC settlement:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
