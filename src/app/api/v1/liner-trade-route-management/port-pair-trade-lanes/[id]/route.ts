import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { ltrPortPairTradeLanes } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updatePortPairTradeLaneSchema } from "@/lib/liner-trade-route-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "liner:read")))
      return forbiddenResponse();

    const { id } = await params;

    const [record] = await db
      .select()
      .from(ltrPortPairTradeLanes)
      .where(
        and(
          eq(ltrPortPairTradeLanes.id, id),
          eq(ltrPortPairTradeLanes.tenantId, user.tenantId),
          isNull(ltrPortPairTradeLanes.deletedAt)
        )
      )
      .limit(1);

    if (!record)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Port pair trade lane not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get port pair trade lane:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "liner:edit")))
      return forbiddenResponse();

    const { id } = await params;

    const body = await request.json();
    const parsed = updatePortPairTradeLaneSchema.safeParse(body);
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
      .update(ltrPortPairTradeLanes)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(ltrPortPairTradeLanes.id, id),
          eq(ltrPortPairTradeLanes.tenantId, user.tenantId),
          isNull(ltrPortPairTradeLanes.deletedAt)
        )
      )
      .returning();

    if (!updated)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Port pair trade lane not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update port pair trade lane:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "liner:delete")))
      return forbiddenResponse();

    const { id } = await params;

    const [deleted] = await db
      .update(ltrPortPairTradeLanes)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(ltrPortPairTradeLanes.id, id),
          eq(ltrPortPairTradeLanes.tenantId, user.tenantId),
          isNull(ltrPortPairTradeLanes.deletedAt)
        )
      )
      .returning();

    if (!deleted)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Port pair trade lane not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: { id: deleted.id } });
  } catch (error) {
    console.error("Failed to delete port pair trade lane:", error);
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
