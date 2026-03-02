import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { ddmWaivers } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateDdmWaiverSchema } from "@/lib/demurrage-detention-management/validation";

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
      .from(ddmWaivers)
      .where(
        and(
          eq(ddmWaivers.id, id),
          eq(ddmWaivers.tenantId, user.tenantId),
          isNull(ddmWaivers.deletedAt)
        )
      )
      .limit(1);

    if (!record)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "D&D waiver not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get D&D waiver:", error);
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
    const parsed = updateDdmWaiverSchema.safeParse(body);
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
      .update(ddmWaivers)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(ddmWaivers.id, id),
          eq(ddmWaivers.tenantId, user.tenantId),
          isNull(ddmWaivers.deletedAt)
        )
      )
      .returning();

    if (!updated)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "D&D waiver not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update D&D waiver:", error);
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
      .update(ddmWaivers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(ddmWaivers.id, id),
          eq(ddmWaivers.tenantId, user.tenantId),
          isNull(ddmWaivers.deletedAt)
        )
      )
      .returning();

    if (!deleted)
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "D&D waiver not found",
          },
        },
        { status: 404 }
      );

    return NextResponse.json({ data: { id: deleted.id } });
  } catch (error) {
    console.error("Failed to delete D&D waiver:", error);
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
