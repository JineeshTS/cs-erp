import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsTaxConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TaxConfigsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:read")))
    redirect("/multi-entity-legal-structure");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "entities:create"
  );

  const data = await db
    .select()
    .from(melsTaxConfigs)
    .where(
      and(
        eq(melsTaxConfigs.tenantId, session.tenantId),
        isNull(melsTaxConfigs.deletedAt)
      )
    )
    .orderBy(desc(melsTaxConfigs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Configs</h1>
          <p className="text-sm text-gray-500">
            Regional tax type definitions and rules
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/tax-configs/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Tax Config
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No tax configs found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/tax-configs/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first tax config
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Tax Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Tax Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Tax Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Country
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Is Compound
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/multi-entity-legal-structure/tax-configs/${row.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {row.taxName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.taxCode}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.taxType || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.country}</td>
                  <td className="px-4 py-3">
                    <Badge variant={row.isCompound ? "warning" : "secondary"}>
                      {row.isCompound ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={row.isActive ? "success" : "secondary"}>
                      {row.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(row.createdAt).toLocaleDateString()}
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
