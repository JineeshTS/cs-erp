import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { vessels } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function VesselsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vessels:read")))
    redirect("/master-data-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "vessels:create"
  );

  const data = await db
    .select()
    .from(vessels)
    .where(
      and(
        eq(vessels.tenantId, session.tenantId),
        isNull(vessels.deletedAt)
      )
    )
    .orderBy(desc(vessels.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vessels</h1>
          <p className="text-sm text-gray-500">
            Manage vessel registry and particulars
          </p>
        </div>
        {canCreate && (
          <Link
            href="/master-data-management/vessels/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Vessel
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No vessels found.</p>
          {canCreate && (
            <Link
              href="/master-data-management/vessels/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first vessel
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  IMO Number
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Flag
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  TEU Capacity
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((vessel) => (
                <tr
                  key={vessel.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/master-data-management/vessels/${vessel.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {vessel.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vessel.imoNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vessel.vesselType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vessel.flag || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vessel.teuCapacity ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        vessel.status === "active" ? "success" : "secondary"
                      }
                    >
                      {vessel.status}
                    </Badge>
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
