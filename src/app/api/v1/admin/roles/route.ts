import { NextRequest, NextResponse } from "next/server";
import { eq, or, isNull, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { roles } from "@/db/schema";
import { permissions, rolePermissions } from "@/db/schema/permissions";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    if (!(await hasPermission(user.id, user.tenantId, "roles:read"))) {
      return forbiddenResponse();
    }

    // Get all roles visible to this tenant (system roles + own tenant roles)
    const allRoles = await db
      .select()
      .from(roles)
      .where(or(isNull(roles.tenantId), eq(roles.tenantId, user.tenantId)));

    // Batch fetch all permissions for all roles (avoids N+1)
    const roleIds = allRoles.map((r) => r.id);
    const allPerms = roleIds.length > 0
      ? await db
          .select({ roleId: rolePermissions.roleId, name: permissions.name })
          .from(rolePermissions)
          .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
          .where(inArray(rolePermissions.roleId, roleIds))
      : [];

    const permsByRole = new Map<string, string[]>();
    for (const p of allPerms) {
      const arr = permsByRole.get(p.roleId) ?? [];
      arr.push(p.name);
      permsByRole.set(p.roleId, arr);
    }

    const rolesWithPerms = allRoles.map((role) => ({
      ...role,
      assignedPermissions: permsByRole.get(role.id) ?? [],
    }));

    return NextResponse.json({ data: rolesWithPerms });
  } catch (error) {
    console.error("[admin/roles] GET error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to list roles" } },
      { status: 500 }
    );
  }
}

const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  country: z.string().max(10).optional(),
  region: z.string().max(50).optional(),
  permissionIds: z.array(z.string().uuid()),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

  if (!(await hasPermission(user.id, user.tenantId, "roles:create"))) {
    return forbiddenResponse();
  }

  const csrf = request.headers.get("x-csrf-token");
  if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

  const body = await request.json();
  const parsed = createRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
      { status: 422 }
    );
  }

  const { name, description, country, region, permissionIds } = parsed.data;

  const [role] = await db
    .insert(roles)
    .values({
      tenantId: user.tenantId,
      name,
      description,
      country: country || null,
      region: region || null,
      isSystem: false,
      permissions: [],
    })
    .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "roles", entityId: role?.id, module: "admin", newData: role as Record<string, unknown>, request });

  // Assign permissions
  if (permissionIds.length > 0) {
    await db.insert(rolePermissions).values(
      permissionIds.map((pid) => ({
        roleId: role.id,
        permissionId: pid,
      }))
    );
  }

    return NextResponse.json({ data: role }, { status: 201 });
  } catch (error) {
    console.error("[admin/roles] POST error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create role" } },
      { status: 500 }
    );
  }
}
