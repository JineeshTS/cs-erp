import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { famMaintenanceSchedules } from "@/db/schema";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listMaintenanceSchedules } from "@/lib/fixed-assets-management/service";
import { createMaintenanceScheduleSchema } from "@/lib/fixed-assets-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "asset:read")))
      return forbiddenResponse();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 50);

    const result = await listMaintenanceSchedules({
      tenantId: user.tenantId,
      search,
      status,
      cursor,
      limit,
    });

    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list maintenance schedules:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "asset:create")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createMaintenanceScheduleSchema.safeParse(body);
    if (!parsed.success)
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

    const [record] = await db
      .insert(famMaintenanceSchedules)
      .values({
        ...parsed.data,
        maintenanceRef: `FMS-${Date.now()}`,
        tenantId: user.tenantId,
        status: "scheduled",
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "maintenance-schedules", entityId: record?.id, module: "fixed-assets-management", newData: record as Record<string, unknown>, request });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("Failed to create maintenance schedule:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
