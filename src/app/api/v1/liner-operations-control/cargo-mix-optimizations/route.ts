import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { locCargoMixOptimizations } from "@/db/schema";
import { listCargoMixOptimizations } from "@/lib/liner-operations-control/service";
import { createCargoMixOptimizationSchema } from "@/lib/liner-operations-control/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

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

    const result = await listCargoMixOptimizations({ tenantId: user.tenantId, search, status, cursor, limit });
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list cargo mix optimizations:", error);
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

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createCargoMixOptimizationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [record] = await db
      .insert(locCargoMixOptimizations)
      .values({
        ...parsed.data,
        optimizationRef: `CMO-${Date.now()}`,
        tenantId: user.tenantId,
        status: "draft",
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "cargo-mix-optimizations", entityId: record?.id, module: "liner-operations-control", newData: record as Record<string, unknown>, request });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cargo mix optimization:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
