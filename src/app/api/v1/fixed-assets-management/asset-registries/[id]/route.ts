import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { famAssetRegistries } from "@/db/schema";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateAssetRegistrySchema } from "@/lib/fixed-assets-management/validation";
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
      .from(famAssetRegistries)
      .where(
        and(
          eq(famAssetRegistries.id, id),
          eq(famAssetRegistries.tenantId, user.tenantId),
          isNull(famAssetRegistries.deletedAt)
        )
      );

    if (!record)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Asset registry not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get asset registry:", error);
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
    const parsed = updateAssetRegistrySchema.safeParse(body);
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
      .update(famAssetRegistries)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(famAssetRegistries.id, id),
          eq(famAssetRegistries.tenantId, user.tenantId),
          isNull(famAssetRegistries.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "asset-registries", entityId: updated?.id, module: "fixed-assets-management", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Asset registry not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update asset registry:", error);
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
      .update(famAssetRegistries)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(famAssetRegistries.id, id),
          eq(famAssetRegistries.tenantId, user.tenantId),
          isNull(famAssetRegistries.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "asset-registries", entityId: deleted?.id, module: "fixed-assets-management", previousData: null, request });

    if (!deleted)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Asset registry not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete asset registry:", error);
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
