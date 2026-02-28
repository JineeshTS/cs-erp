import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { dmsExpiryAlerts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "warning" | "secondary" | "success" | "destructive"> = {
  pending: "warning",
  notified: "secondary",
  acknowledged: "success",
  renewed: "success",
  dismissed: "destructive",
};

export default async function ExpiryAlertsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "documents:read")))
    redirect("/document-management-system");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "documents:create"
  );

  const data = await db
    .select()
    .from(dmsExpiryAlerts)
    .where(
      and(
        eq(dmsExpiryAlerts.tenantId, session.tenantId),
        isNull(dmsExpiryAlerts.deletedAt)
      )
    )
    .orderBy(desc(dmsExpiryAlerts.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expiry Alerts</h1>
          <p className="text-sm text-gray-500">
            Manage document expiry and renewal alerts
          </p>
        </div>
        {canCreate && (
          <Link
            href="/document-management-system/expiry-alerts/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Alert
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No expiry alerts found.</p>
          {canCreate && (
            <Link
              href="/document-management-system/expiry-alerts/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first expiry alert
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Document ID
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Alert Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Alert Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Days Before
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((alert) => (
                <tr
                  key={alert.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/document-management-system/expiry-alerts/${alert.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {alert.documentId.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {alert.alertType}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[alert.status] ?? "secondary"}>
                      {alert.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {alert.alertDate.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {alert.alertDaysBefore}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {alert.createdAt.toLocaleDateString()}
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
