import { NextRequest, NextResponse } from "next/server";
import { eq, or, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { roles } from "@/db/schema";
import { permissions, rolePermissions } from "@/db/schema/permissions";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
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

  // For each role, get its permissions via role_permissions join
  const rolesWithPerms = await Promise.all(
    allRoles.map(async (role) => {
      const perms = await db
        .select({ name: permissions.name })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, role.id));

      return {
        ...role,
        assignedPermissions: perms.map((p) => p.name),
      };
    })
  );

  return NextResponse.json({ data: rolesWithPerms });
}

const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  country: z.string().max(10).optional(),
  region: z.string().max(50).optional(),
  permissionIds: z.array(z.string().uuid()),
});

export async function POST(request: NextRequest) {
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
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
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
}
