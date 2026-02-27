import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { costCentres } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CostCentresListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "finance:read")))
    redirect("/master-data-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "finance:create"
  );

  const data = await db
    .select()
    .from(costCentres)
    .where(
      and(
        eq(costCentres.tenantId, session.tenantId),
        isNull(costCentres.deletedAt)
      )
    )
    .orderBy(desc(costCentres.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cost Centres</h1>
          <p className="text-sm text-gray-500">
            Manage cost centre master data
          </p>
        </div>
        {canCreate && (
          <Link
            href="/master-data-management/cost-centres/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Cost Centre
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No cost centres found.</p>
          {canCreate && (
            <Link
              href="/master-data-management/cost-centres/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first cost centre
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Department
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((costCentre) => (
                <tr
                  key={costCentre.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/master-data-management/cost-centres/${costCentre.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {costCentre.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {costCentre.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {costCentre.department || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        costCentre.isActive ? "success" : "secondary"
                      }
                    >
                      {costCentre.isActive ? "active" : "inactive"}
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
