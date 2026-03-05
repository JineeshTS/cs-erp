import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { permissions } from "@/db/schema/permissions";
import { RoleForm } from "@/components/admin/role-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminRolesNewPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "roles:create"))) redirect("/");

  const allPermissions = await db
    .select({ id: permissions.id, name: permissions.name, resource: permissions.resource, action: permissions.action })
    .from(permissions)
    .orderBy(permissions.resource, permissions.action);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/roles" className="rounded-md border border-gray-300 p-2 hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Role</h1>
          <p className="text-sm text-gray-500">Define a new role with specific permissions</p>
        </div>
      </div>

      <RoleForm
        allPermissions={allPermissions}
        apiPath="/api/v1/admin/roles"
        returnPath="/admin/roles"
      />
    </div>
  );
}
