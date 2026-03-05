import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { roles } from "@/db/schema";
import { users } from "@/db/schema/users";
import { rolePermissions, permissions } from "@/db/schema/permissions";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Pencil, Users } from "lucide-react";
import { DeleteRoleButton } from "@/components/admin/delete-role-button";

interface PageProps {
  params: Promise<{ roleId: string }>;
}

export default async function AdminRoleDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "roles:read"))) redirect("/");

  const { roleId } = await params;

  const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
  if (!role) notFound();

  const [allPerms, assigned, assignedUsers, canEdit, canDelete] = await Promise.all([
    db.select().from(permissions),
    db.select({ permissionId: rolePermissions.permissionId }).from(rolePermissions).where(eq(rolePermissions.roleId, roleId)),
    db.select({ id: users.id, displayName: users.displayName, email: users.email }).from(users).where(eq(users.roleId, roleId)),
    hasPermission(session.id, session.tenantId, "roles:edit"),
    hasPermission(session.id, session.tenantId, "roles:delete"),
  ]);

  const assignedIds = new Set(assigned.map((a) => a.permissionId));

  const grouped = allPerms.reduce<Record<string, Array<{ id: string; name: string; action: string; assigned: boolean }>>>(
    (acc, perm) => {
      if (!acc[perm.resource]) acc[perm.resource] = [];
      acc[perm.resource].push({ id: perm.id, name: perm.name, action: perm.action, assigned: assignedIds.has(perm.id) });
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/roles" className="rounded-md border border-gray-300 p-2 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{role.name}</h1>
            <p className="text-sm text-gray-500">{role.description || "No description"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && !role.isSystem && (
            <Link href={`/admin/roles/${roleId}/edit`} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
          {canDelete && !role.isSystem && (
            <DeleteRoleButton roleId={roleId} roleName={role.name} hasUsers={assignedUsers.length > 0} />
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Type</p>
          <Badge variant={role.isSystem ? "default" : "secondary"} className="mt-1">
            {role.isSystem ? "System Role" : "Custom Role"}
          </Badge>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Country</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{role.country || "Global"}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Region</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{role.region || "—"}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Permissions</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{assignedIds.size} assigned</p>
        </div>
      </div>

      {assignedUsers.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Assigned Users ({assignedUsers.length})</h2>
          </div>
          <div className="space-y-2">
            {assignedUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm font-medium text-gray-900">{u.displayName}</span>
                <span className="text-xs text-gray-500">{u.email}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Permission Matrix</h2>
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([resource, perms]) => (
              <div key={resource}>
                <h3 className="text-sm font-semibold capitalize text-gray-700">{resource}</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {perms.sort((a, b) => a.action.localeCompare(b.action)).map((perm) => (
                    <Badge key={perm.id} variant={perm.assigned ? "success" : "secondary"}>
                      {perm.action}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
