import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { famDepreciationSchedules } from "@/db/schema";
import {
  getApiUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateDepreciationScheduleSchema } from "@/lib/fixed-assets-management/validation";

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
      .from(famDepreciationSchedules)
      .where(
        and(
          eq(famDepreciationSchedules.id, id),
          eq(famDepreciationSchedules.tenantId, user.tenantId),
          isNull(famDepreciationSchedules.deletedAt)
        )
      );

    if (!record)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Depreciation schedule not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get depreciation schedule:", error);
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

    const { id } = await params;

    const body = await request.json();
    const parsed = updateDepreciationScheduleSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error,
          },
        },
        { status: 422 }
      );

    const [updated] = await db
      .update(famDepreciationSchedules)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(famDepreciationSchedules.id, id),
          eq(famDepreciationSchedules.tenantId, user.tenantId),
          isNull(famDepreciationSchedules.deletedAt)
        )
      )
      .returning();

    if (!updated)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Depreciation schedule not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update depreciation schedule:", error);
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

    const { id } = await params;

    const [deleted] = await db
      .update(famDepreciationSchedules)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(famDepreciationSchedules.id, id),
          eq(famDepreciationSchedules.tenantId, user.tenantId),
          isNull(famDepreciationSchedules.deletedAt)
        )
      )
      .returning();

    if (!deleted)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Depreciation schedule not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete depreciation schedule:", error);
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
