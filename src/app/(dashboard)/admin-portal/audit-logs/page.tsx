import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { adminAuditLogs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const SEVERITY_VARIANT: Record<string, "secondary" | "warning" | "destructive"> = {
  info: "secondary",
  warning: "warning",
  error: "destructive",
  critical: "destructive",
};

export default async function AuditLogsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const data = await db
    .select()
    .from(adminAuditLogs)
    .where(
      and(
        eq(adminAuditLogs.tenantId, session.tenantId),
        isNull(adminAuditLogs.deletedAt)
      )
    )
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500">
            View system audit trail and activity history
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No audit logs found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Action
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Entity Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  User Email
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Severity
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  IP Address
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((log) => (
                <tr
                  key={log.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-portal/audit-logs/${log.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {log.action}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {log.entityType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {log.userEmail || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={SEVERITY_VARIANT[log.severity] ?? "secondary"}
                    >
                      {log.severity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {log.ipAddress || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {log.createdAt.toLocaleDateString()}
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
