import { redirect } from "next/navigation";
import { eq, or, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { roles } from "@/db/schema";
import { rolePermissions, permissions } from "@/db/schema/permissions";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminRolesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!(await hasPermission(session.id, session.tenantId, "roles:read"))) {
    redirect("/");
  }

  const allRoles = await db
    .select()
    .from(roles)
    .where(or(isNull(roles.tenantId), eq(roles.tenantId, session.tenantId)));

  const rolesWithCount = await Promise.all(
    allRoles.map(async (role) => {
      const perms = await db
        .select({ name: permissions.name })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, role.id));
      return { ...role, permCount: perms.length };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
        <p className="text-sm text-gray-500">Manage roles and permissions</p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-start font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Description</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Permissions</th>
            </tr>
          </thead>
          <tbody>
            {rolesWithCount.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No roles found
                </td>
              </tr>
            )}
            {rolesWithCount.map((role) => (
              <tr key={role.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/roles/${role.id}`} className="font-medium text-gray-900 hover:underline">
                    {role.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{role.description || "-"}</td>
                <td className="px-4 py-3">
                  <Badge variant={role.isSystem ? "default" : "secondary"}>
                    {role.isSystem ? "System" : "Custom"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{role.permCount} permissions</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
