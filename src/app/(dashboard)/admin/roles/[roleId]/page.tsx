import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { roles } from "@/db/schema";
import { rolePermissions, permissions } from "@/db/schema/permissions";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ roleId: string }>;
}

export default async function AdminRoleDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!(await hasPermission(session.id, session.tenantId, "roles:read"))) {
    redirect("/");
  }

  const { roleId } = await params;

  const [role] = await db
    .select()
    .from(roles)
    .where(eq(roles.id, roleId))
    .limit(1);

  if (!role) notFound();

  // Get all permissions
  const allPerms = await db.select().from(permissions);

  // Get assigned permissions for this role
  const assigned = await db
    .select({ permissionId: rolePermissions.permissionId })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));

  const assignedIds = new Set(assigned.map((a) => a.permissionId));

  // Group permissions by resource
  const grouped = allPerms.reduce<Record<string, Array<{ id: string; name: string; action: string; assigned: boolean }>>>(
    (acc, perm) => {
      if (!acc[perm.resource]) acc[perm.resource] = [];
      acc[perm.resource].push({
        id: perm.id,
        name: perm.name,
        action: perm.action,
        assigned: assignedIds.has(perm.id),
      });
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{role.name}</h1>
        <p className="text-sm text-gray-500">{role.description || "No description"}</p>
        <div className="mt-2 flex gap-2">
          <Badge variant={role.isSystem ? "default" : "secondary"}>
            {role.isSystem ? "System Role" : "Custom Role"}
          </Badge>
          <Badge variant="outline">{assignedIds.size} permissions</Badge>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Permission Matrix</h2>
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([resource, perms]) => (
              <div key={resource}>
                <h3 className="text-sm font-semibold capitalize text-gray-700">{resource}</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {perms.map((perm) => (
                    <Badge
                      key={perm.id}
                      variant={perm.assigned ? "success" : "secondary"}
                    >
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
