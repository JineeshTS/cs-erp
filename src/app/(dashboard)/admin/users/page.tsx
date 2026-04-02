import { redirect } from "next/navigation";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { users, roles } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!(await hasPermission(session.id, session.tenantId, "users:read"))) {
    redirect("/");
  }

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      status: users.status,
      roleName: roles.name,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.tenantId, session.tenantId))
    .orderBy(desc(users.createdAt))
    .limit(50);

  const statusVariant = (status: string) => {
    switch (status) {
      case "active": return "success" as const;
      case "inactive": return "secondary" as const;
      case "locked": return "destructive" as const;
      case "pending_verification": return "warning" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage your team members</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-start font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Role</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
            {allUsers.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="font-medium text-gray-900 hover:underline">
                    {u.displayName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{u.roleName || "No role"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {u.lastLoginAt
                    ? new Date(u.lastLoginAt).toLocaleDateString()
                    : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
