import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { oogSecuringPlans } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getSecuringPlan } from "@/lib/oog-special-cargo-management/service";
import { updateSecuringPlanSchema } from "@/lib/oog-special-cargo-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "oog_special:read"))) return forbiddenResponse();

    const { id } = await params;
    const record = await getSecuringPlan(id, user.tenantId);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Securing plan not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get securing plan:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "oog_special:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSecuringPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(oogSecuringPlans)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(oogSecuringPlans.id, id),
          eq(oogSecuringPlans.tenantId, user.tenantId),
          isNull(oogSecuringPlans.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Securing plan not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update securing plan:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "oog_special:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(oogSecuringPlans)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(oogSecuringPlans.id, id),
          eq(oogSecuringPlans.tenantId, user.tenantId),
          isNull(oogSecuringPlans.deletedAt)
        )
      )
      .returning({ id: oogSecuringPlans.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Securing plan not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete securing plan:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
