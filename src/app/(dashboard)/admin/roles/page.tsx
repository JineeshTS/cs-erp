import { redirect } from "next/navigation";
import { eq, or, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { roles } from "@/db/schema";
import { rolePermissions, permissions } from "@/db/schema/permissions";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Shield } from "lucide-react";

export default async function AdminRolesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "roles:read"))) redirect("/");
  const canCreate = await hasPermission(session.id, session.tenantId, "roles:create");

  const sp = await searchParams;
  const filterCountry = sp.country ?? "";

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

  const filtered = filterCountry
    ? rolesWithCount.filter((r) => r.country === filterCountry)
    : rolesWithCount;

  const countries = [...new Set(rolesWithCount.map((r) => r.country).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-sm text-gray-500">Manage roles and permissions across countries</p>
        </div>
        {canCreate && (
          <Link href="/admin/roles/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Create Role
          </Link>
        )}
      </div>

      {countries.length > 0 && (
        <form className="flex items-end gap-3 rounded-lg border bg-white p-4">
          <div>
            <label htmlFor="country" className="mb-1 block text-xs font-medium text-gray-500">Country</label>
            <select id="country" name="country" defaultValue={filterCountry} className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">All Countries</option>
              {countries.map((c) => <option key={c} value={c!}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
          {filterCountry && <Link href="/admin/roles" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>}
        </form>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Shield className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No roles found.</p>
          {canCreate && <Link href="/admin/roles/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first role</Link>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Description</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Country</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Permissions</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((role) => (
                <tr key={role.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/roles/${role.id}`} className="font-medium text-gray-900 hover:underline">{role.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{role.description || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {role.country ? <Badge variant="outline">{role.country}</Badge> : <span className="text-gray-400">Global</span>}
                    {role.region && <span className="ml-1 text-xs text-gray-400">{role.region}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={role.isSystem ? "default" : "secondary"}>{role.isSystem ? "System" : "Custom"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{role.permCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!role.isSystem && (
                        <Link href={`/admin/roles/${role.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
