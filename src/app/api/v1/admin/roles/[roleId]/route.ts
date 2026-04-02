import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { roles } from "@/db/schema";
import { rolePermissions, permissions } from "@/db/schema/permissions";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { formatZodErrors } from "@/lib/validation";

type RouteParams = { params: Promise<{ roleId: string }> };

const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  country: z.string().max(10).optional().nullable(),
  region: z.string().max(50).optional().nullable(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    if (!(await hasPermission(user.id, user.tenantId, "roles:edit"))) {
      return forbiddenResponse();
    }

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { roleId } = await params;
    const body = await request.json();
    const parsed = updateRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    // Cannot edit system roles — also enforce tenant isolation
    const [existing] = await db
      .select({ isSystem: roles.isSystem, tenantId: roles.tenantId })
      .from(roles)
      .where(and(eq(roles.id, roleId), eq(roles.tenantId, user.tenantId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Role not found" } },
        { status: 404 }
      );
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Cannot edit system roles" } },
        { status: 403 }
      );
    }

    const { permissionIds, ...updates } = parsed.data;

    if (Object.keys(updates).length > 0) {
      await db.update(roles).set(updates).where(eq(roles.id, roleId));
    }

    if (permissionIds) {
      // Replace all permissions
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
      if (permissionIds.length > 0) {
        await db.insert(rolePermissions).values(
          permissionIds.map((pid) => ({
            roleId,
            permissionId: pid,
          }))
        );
      }
    }

    const [updated] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[admin/roles/[roleId]] PATCH error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update role" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    if (!(await hasPermission(user.id, user.tenantId, "roles:delete"))) {
      return forbiddenResponse();
    }

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { roleId } = await params;

    const [existing] = await db
      .select({ isSystem: roles.isSystem, tenantId: roles.tenantId })
      .from(roles)
      .where(and(eq(roles.id, roleId), eq(roles.tenantId, user.tenantId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Role not found" } },
        { status: 404 }
      );
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Cannot delete system roles" } },
        { status: 403 }
      );
    }

    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    await db.update(roles)
      .set({ deletedAt: new Date() })
      .where(and(eq(roles.id, roleId), eq(roles.tenantId, user.tenantId)));

    return NextResponse.json({ data: { id: roleId, deleted: true } });
  } catch (error) {
    console.error("[admin/roles/[roleId]] DELETE error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete role" } },
      { status: 500 }
    );
  }
}
