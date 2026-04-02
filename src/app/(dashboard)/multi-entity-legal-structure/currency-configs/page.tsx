import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsCurrencyConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CurrencyConfigsListPage() {
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
    .from(melsCurrencyConfigs)
    .where(
      and(
        eq(melsCurrencyConfigs.tenantId, session.tenantId),
        isNull(melsCurrencyConfigs.deletedAt)
      )
    )
    .orderBy(desc(melsCurrencyConfigs.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Currency Configurations
          </h1>
          <p className="text-sm text-gray-500">
            Manage currency settings for legal entities
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/currency-configs/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Currency Config
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No currency configurations found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/currency-configs/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first currency configuration
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Currency Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Currency Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Legal Entity ID
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Decimal Places
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Base Currency
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Enabled
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((config) => (
                <tr
                  key={config.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/multi-entity-legal-structure/currency-configs/${config.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {config.currencyCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {config.currencyName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    {config.legalEntityId}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {config.decimalPlaces}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={config.isBaseCurrency ? "success" : "secondary"}
                    >
                      {config.isBaseCurrency ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={config.isEnabled ? "success" : "secondary"}
                    >
                      {config.isEnabled ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {config.createdAt.toLocaleDateString()}
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
