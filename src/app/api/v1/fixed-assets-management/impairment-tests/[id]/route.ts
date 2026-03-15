import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { famImpairmentTests } from "@/db/schema";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getImpairmentTest } from "@/lib/fixed-assets-management/service";
import { updateImpairmentTestSchema } from "@/lib/fixed-assets-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "asset:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getImpairmentTest(id, user.tenantId);

    if (!record)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Impairment test not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get impairment test:", error);
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "asset:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateImpairmentTestSchema.safeParse(body);
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
      .update(famImpairmentTests)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(famImpairmentTests.id, id),
          eq(famImpairmentTests.tenantId, user.tenantId)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "impairment-tests", entityId: record?.id, module: "fixed-assets-management", previousData: null, newData: record as Record<string, unknown>, request });

    if (!record)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Impairment test not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to update impairment test:", error);
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "asset:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const [record] = await db
      .update(famImpairmentTests)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(famImpairmentTests.id, id),
          eq(famImpairmentTests.tenantId, user.tenantId)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "impairment-tests", entityId: record?.id, module: "fixed-assets-management", previousData: null, request });

    if (!record)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Impairment test not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete impairment test:", error);
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
