import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsLegalEntities } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function LegalEntitiesListPage() {
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
    .from(melsLegalEntities)
    .where(
      and(
        eq(melsLegalEntities.tenantId, session.tenantId),
        isNull(melsLegalEntities.deletedAt)
      )
    )
    .orderBy(desc(melsLegalEntities.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Entities</h1>
          <p className="text-sm text-gray-500">
            Manage legal entities across your organization
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/legal-entities/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Legal Entity
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No legal entities found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/legal-entities/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first legal entity
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
                  Entity Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Country
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Base Currency
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
              {data.map((entity) => (
                <tr
                  key={entity.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/multi-entity-legal-structure/legal-entities/${entity.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {entity.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {entity.entityType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {entity.country}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {entity.baseCurrency}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={entity.isActive ? "success" : "secondary"}>
                      {entity.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {entity.createdAt.toLocaleDateString()}
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
