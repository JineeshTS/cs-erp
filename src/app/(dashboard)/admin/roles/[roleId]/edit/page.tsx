import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { roles } from "@/db/schema";
import { permissions, rolePermissions } from "@/db/schema/permissions";
import { RoleForm } from "@/components/admin/role-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ roleId: string }>;
}

export default async function AdminRoleEditPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "roles:edit"))) redirect("/");

  const { roleId } = await params;

  const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
  if (!role) notFound();
  if (role.isSystem) redirect(`/admin/roles/${roleId}`);

  const [allPerms, assigned] = await Promise.all([
    db
      .select({ id: permissions.id, name: permissions.name, resource: permissions.resource, action: permissions.action })
      .from(permissions)
      .orderBy(permissions.resource, permissions.action),
    db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId)),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/roles/${roleId}`} className="rounded-md border border-gray-300 p-2 hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Role: {role.name}</h1>
          <p className="text-sm text-gray-500">Modify role details and permissions</p>
        </div>
      </div>

      <RoleForm
        allPermissions={allPerms}
        initialData={{
          name: role.name,
          description: role.description ?? "",
          country: role.country ?? "",
          region: role.region ?? "",
          permissionIds: assigned.map((a) => a.permissionId),
        }}
        isEdit
        apiPath={`/api/v1/admin/roles/${roleId}`}
        returnPath={`/admin/roles/${roleId}`}
      />
    </div>
  );
}
