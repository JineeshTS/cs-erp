import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { tcmCashPoolingSweeps } from "@/db/schema";
import { getCashPoolingSweep } from "@/lib/treasury-cash-management/service";
import { updateCashPoolingSweepSchema } from "@/lib/treasury-cash-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "treasury:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getCashPoolingSweep(id, user.tenantId);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Cash pooling sweep not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get cash pooling sweep:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "treasury:edit")))
      return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCashPoolingSweepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [updated] = await db
      .update(tcmCashPoolingSweeps)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(tcmCashPoolingSweeps.id, id),
          eq(tcmCashPoolingSweeps.tenantId, user.tenantId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Cash pooling sweep not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update cash pooling sweep:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "treasury:delete")))
      return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db
      .update(tcmCashPoolingSweeps)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(tcmCashPoolingSweeps.id, id),
          eq(tcmCashPoolingSweeps.tenantId, user.tenantId)
        )
      )
      .returning({ id: tcmCashPoolingSweeps.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Cash pooling sweep not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete cash pooling sweep:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
