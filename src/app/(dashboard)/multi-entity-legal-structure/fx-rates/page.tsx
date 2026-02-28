import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsFxRates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function FxRatesListPage() {
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
    .from(melsFxRates)
    .where(
      and(
        eq(melsFxRates.tenantId, session.tenantId),
        isNull(melsFxRates.deletedAt)
      )
    )
    .orderBy(desc(melsFxRates.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FX Rates</h1>
          <p className="text-sm text-gray-500">
            Manage foreign exchange rates and providers
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/fx-rates/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add FX Rate
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No FX rates found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/fx-rates/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first FX rate
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Source Currency
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Target Currency
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Rate
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Rate Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Provider
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Active
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Effective From
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
                      href={`/multi-entity-legal-structure/fx-rates/${row.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {row.sourceCurrency}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.targetCurrency}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.rate}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.rateType || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.provider || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={row.isActive ? "success" : "secondary"}>
                      {row.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.effectiveFrom
                      ? new Date(row.effectiveFrom).toLocaleDateString()
                      : "-"}
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
