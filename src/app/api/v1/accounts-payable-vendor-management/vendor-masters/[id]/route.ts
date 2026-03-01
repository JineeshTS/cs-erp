import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { apvmVendorMasters } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateVendorMasterSchema } from "@/lib/accounts-payable-vendor-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "payable:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(apvmVendorMasters)
      .where(and(eq(apvmVendorMasters.id, id), eq(apvmVendorMasters.tenantId, user.tenantId), isNull(apvmVendorMasters.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Vendor master not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get vendor master:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "payable:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateVendorMasterSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });

    const [updated] = await db.update(apvmVendorMasters).set(parsed.data)
      .where(and(eq(apvmVendorMasters.id, id), eq(apvmVendorMasters.tenantId, user.tenantId), isNull(apvmVendorMasters.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Vendor master not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update vendor master:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "payable:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(apvmVendorMasters).set({ deletedAt: new Date() })
      .where(and(eq(apvmVendorMasters.id, id), eq(apvmVendorMasters.tenantId, user.tenantId), isNull(apvmVendorMasters.deletedAt))).returning({ id: apvmVendorMasters.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Vendor master not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete vendor master:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
