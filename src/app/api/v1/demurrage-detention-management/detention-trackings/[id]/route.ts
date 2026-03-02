import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { ddmDetentionTrackings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateDetentionTrackingSchema } from "@/lib/demurrage-detention-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "demurrage:read")))
      return forbiddenResponse();

    const { id } = await params;

    const [record] = await db
      .select()
      .from(ddmDetentionTrackings)
      .where(
        and(
          eq(ddmDetentionTrackings.id, id),
          eq(ddmDetentionTrackings.tenantId, user.tenantId),
          isNull(ddmDetentionTrackings.deletedAt)
        )
      )
      .limit(1);

    if (!record)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Detention tracking not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get detention tracking:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "demurrage:edit")))
      return forbiddenResponse();

    const { id } = await params;

    const body = await request.json();
    const parsed = updateDetentionTrackingSchema.safeParse(body);
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
      .update(ddmDetentionTrackings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(ddmDetentionTrackings.id, id),
          eq(ddmDetentionTrackings.tenantId, user.tenantId),
          isNull(ddmDetentionTrackings.deletedAt)
        )
      )
      .returning();

    if (!updated)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Detention tracking not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update detention tracking:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "demurrage:delete")))
      return forbiddenResponse();

    const { id } = await params;

    const [deleted] = await db
      .update(ddmDetentionTrackings)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(ddmDetentionTrackings.id, id),
          eq(ddmDetentionTrackings.tenantId, user.tenantId),
          isNull(ddmDetentionTrackings.deletedAt)
        )
      )
      .returning();

    if (!deleted)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Detention tracking not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: { id: deleted.id } });
  } catch (error) {
    console.error("Failed to delete detention tracking:", error);
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
