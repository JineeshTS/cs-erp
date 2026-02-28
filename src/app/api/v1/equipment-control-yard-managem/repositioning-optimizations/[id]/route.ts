import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyRepositioningOptimizations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateRepositioningOptimizationSchema } from "@/lib/equipment-control-yard-managem/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(eqyRepositioningOptimizations)
      .where(
        and(
          eq(eqyRepositioningOptimizations.id, id),
          eq(eqyRepositioningOptimizations.tenantId, user.tenantId),
          isNull(eqyRepositioningOptimizations.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Repositioning optimization not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get repositioning optimization:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "equipment:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateRepositioningOptimizationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { executionDate, estimatedCarbon, aiScore, ...rest } = parsed.data;

    const [updated] = await db
      .update(eqyRepositioningOptimizations)
      .set({
        ...rest,
        ...(executionDate !== undefined && { executionDate: executionDate ? new Date(executionDate) : null }),
        ...(estimatedCarbon !== undefined && { estimatedCarbon: estimatedCarbon !== null ? estimatedCarbon.toString() : null }),
        ...(aiScore !== undefined && { aiScore: aiScore !== null ? aiScore.toString() : null }),
      })
      .where(
        and(
          eq(eqyRepositioningOptimizations.id, id),
          eq(eqyRepositioningOptimizations.tenantId, user.tenantId),
          isNull(eqyRepositioningOptimizations.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Repositioning optimization not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update repositioning optimization:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "equipment:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db
      .update(eqyRepositioningOptimizations)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(eqyRepositioningOptimizations.id, id),
          eq(eqyRepositioningOptimizations.tenantId, user.tenantId),
          isNull(eqyRepositioningOptimizations.deletedAt)
        )
      )
      .returning({ id: eqyRepositioningOptimizations.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Repositioning optimization not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete repositioning optimization:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
