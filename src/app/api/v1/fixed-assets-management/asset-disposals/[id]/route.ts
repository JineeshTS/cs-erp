import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { famAssetDisposals } from "@/db/schema";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateAssetDisposalSchema } from "@/lib/fixed-assets-management/validation";
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

    const [record] = await db
      .select()
      .from(famAssetDisposals)
      .where(
        and(
          eq(famAssetDisposals.id, id),
          eq(famAssetDisposals.tenantId, user.tenantId),
          isNull(famAssetDisposals.deletedAt)
        )
      );

    if (!record)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Asset disposal not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get asset disposal:", error);
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
    const parsed = updateAssetDisposalSchema.safeParse(body);
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

    const [updated] = await db
      .update(famAssetDisposals)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(famAssetDisposals.id, id),
          eq(famAssetDisposals.tenantId, user.tenantId),
          isNull(famAssetDisposals.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "asset-disposals", entityId: updated?.id, module: "fixed-assets-management", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Asset disposal not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update asset disposal:", error);
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

    const [deleted] = await db
      .update(famAssetDisposals)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(famAssetDisposals.id, id),
          eq(famAssetDisposals.tenantId, user.tenantId),
          isNull(famAssetDisposals.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "asset-disposals", entityId: deleted?.id, module: "fixed-assets-management", previousData: null, request });

    if (!deleted)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Asset disposal not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete asset disposal:", error);
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
