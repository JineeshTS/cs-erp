import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { adminLicenses } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<
  string,
  "success" | "destructive" | "warning" | "secondary"
> = {
  active: "success",
  expired: "destructive",
  suspended: "warning",
  cancelled: "secondary",
};

export default async function LicensesListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "admin:create"
  );

  const data = await db
    .select()
    .from(adminLicenses)
    .where(
      and(
        eq(adminLicenses.tenantId, session.tenantId),
        isNull(adminLicenses.deletedAt)
      )
    )
    .orderBy(desc(adminLicenses.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Licenses</h1>
          <p className="text-sm text-gray-500">
            Manage license keys and subscription plans
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin-portal/licenses/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New License
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No licenses found.</p>
          {canCreate && (
            <Link
              href="/admin-portal/licenses/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first license
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  License Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Key
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Plan
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Billing Cycle
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((license) => (
                <tr
                  key={license.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-portal/licenses/${license.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {license.licenseName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {license.licenseKey.slice(0, 12)}
                    {license.licenseKey.length > 12 ? "..." : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {license.licenseType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{license.plan}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        STATUS_VARIANT[license.status] ?? "secondary"
                      }
                    >
                      {license.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {license.billingCycle}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {license.createdAt.toLocaleDateString()}
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
