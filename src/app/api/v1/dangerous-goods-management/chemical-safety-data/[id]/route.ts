import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { dgmChemicalSafetyData } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getChemicalSafetyDataRecord } from "@/lib/dangerous-goods-management/service";
import { updateChemicalSafetyDataSchema } from "@/lib/dangerous-goods-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "dangerous_goods:read"))) return forbiddenResponse();

    const { id } = await params;
    const record = await getChemicalSafetyDataRecord(id, user.tenantId);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Chemical safety data record not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get chemical safety data record:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "dangerous_goods:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateChemicalSafetyDataSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(dgmChemicalSafetyData)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(dgmChemicalSafetyData.id, id),
          eq(dgmChemicalSafetyData.tenantId, user.tenantId),
          isNull(dgmChemicalSafetyData.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Chemical safety data record not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update chemical safety data record:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "dangerous_goods:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(dgmChemicalSafetyData)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(dgmChemicalSafetyData.id, id),
          eq(dgmChemicalSafetyData.tenantId, user.tenantId),
          isNull(dgmChemicalSafetyData.deletedAt)
        )
      )
      .returning({ id: dgmChemicalSafetyData.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Chemical safety data record not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete chemical safety data record:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
