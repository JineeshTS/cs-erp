import { redirect, notFound } from "next/navigation";
import { eq, and, or, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { users, roles } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { UserEditForm } from "./user-edit-form";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!(await hasPermission(session.id, session.tenantId, "users:read"))) {
    redirect("/");
  }

  const { userId } = await params;

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      status: users.status,
      roleId: users.roleId,
      roleName: roles.name,
      emailVerified: users.emailVerified,
      lastLoginAt: users.lastLoginAt,
      failedLoginAttempts: users.failedLoginAttempts,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(users.id, userId), eq(users.tenantId, session.tenantId)))
    .limit(1);

  if (!user) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "users:edit");

  // Get available roles for assignment
  const availableRoles = await db
    .select({ id: roles.id, name: roles.name })
    .from(roles)
    .where(or(isNull(roles.tenantId), eq(roles.tenantId, session.tenantId)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd><Badge variant={user.status === "active" ? "success" : "warning"}>{user.status}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Role</dt>
              <dd className="font-medium">{user.roleName || "No role"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email Verified</dt>
              <dd>{user.emailVerified ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Failed Login Attempts</dt>
              <dd>{user.failedLoginAttempts}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Last Login</dt>
              <dd>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Created</dt>
              <dd>{new Date(user.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        {canEdit && (
          <UserEditForm
            userId={user.id}
            currentRoleId={user.roleId ?? ""}
            currentStatus={user.status}
            roles={availableRoles}
            isSelf={user.id === session.id}
          />
        )}
      </div>
    </div>
  );
}
