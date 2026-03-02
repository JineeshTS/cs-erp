import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { ccrIspsCompliances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateIspsComplianceSchema } from "@/lib/customs-compliance-regulatory/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "customs:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(ccrIspsCompliances).where(and(eq(ccrIspsCompliances.id, id), eq(ccrIspsCompliances.tenantId, user.tenantId), isNull(ccrIspsCompliances.deletedAt)));
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "ISPS compliance not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get ISPS compliance:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "customs:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateIspsComplianceSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });

    const [updated] = await db.update(ccrIspsCompliances).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(ccrIspsCompliances.id, id), eq(ccrIspsCompliances.tenantId, user.tenantId), isNull(ccrIspsCompliances.deletedAt))).returning();
    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "ISPS compliance not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update ISPS compliance:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "customs:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(ccrIspsCompliances).set({ deletedAt: new Date(), updatedAt: new Date() }).where(and(eq(ccrIspsCompliances.id, id), eq(ccrIspsCompliances.tenantId, user.tenantId), isNull(ccrIspsCompliances.deletedAt))).returning({ id: ccrIspsCompliances.id });
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "ISPS compliance not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete ISPS compliance:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
