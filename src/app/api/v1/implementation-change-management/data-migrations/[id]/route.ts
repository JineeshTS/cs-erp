import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getDataMigration } from "@/lib/implementation-change-management/service";
import { updateDataMigrationSchema } from "@/lib/implementation-change-management/validation";
import { db } from "@/lib/db";
import { icmDataMigrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "icm:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getDataMigration(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Data migration not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get data migration:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "icm:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getDataMigration(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Data migration not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateDataMigrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(icmDataMigrations)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(icmDataMigrations.id, id), eq(icmDataMigrations.tenantId, user.tenantId)))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update data migration:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "icm:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getDataMigration(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Data migration not found" } },
        { status: 404 }
      );
    }

    const [deleted] = await db.update(icmDataMigrations)
      .set({ deletedAt: new Date() })
      .where(and(eq(icmDataMigrations.id, id), eq(icmDataMigrations.tenantId, user.tenantId)))
      .returning();

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete data migration:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
