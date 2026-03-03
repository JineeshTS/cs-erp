import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { tcmBankGuarantees } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getBankGuarantee } from "@/lib/treasury-cash-management/service";
import { updateBankGuaranteeSchema } from "@/lib/treasury-cash-management/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "treasury:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getBankGuarantee(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Bank guarantee not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get bank guarantee:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "treasury:edit")))
      return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateBankGuaranteeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [record] = await db
      .update(tcmBankGuarantees)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tcmBankGuarantees.id, id),
          eq(tcmBankGuarantees.tenantId, user.tenantId)
        )
      )
      .returning();

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Bank guarantee not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to update bank guarantee:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "treasury:delete")))
      return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .update(tcmBankGuarantees)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tcmBankGuarantees.id, id),
          eq(tcmBankGuarantees.tenantId, user.tenantId)
        )
      )
      .returning();

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Bank guarantee not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: record.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete bank guarantee:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
