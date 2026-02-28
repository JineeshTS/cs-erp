import Link from "next/link";
import { Plus, Percent } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { melsTaxRates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function TaxRatesListPage() {
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
    .from(melsTaxRates)
    .where(
      and(
        eq(melsTaxRates.tenantId, session.tenantId),
        isNull(melsTaxRates.deletedAt)
      )
    )
    .orderBy(desc(melsTaxRates.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Rates</h1>
          <p className="text-sm text-gray-500">
            Tax rates with effective date ranges
          </p>
        </div>
        {canCreate && (
          <Link
            href="/multi-entity-legal-structure/tax-rates/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Tax Rate
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Percent className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No tax rates found.</p>
          {canCreate && (
            <Link
              href="/multi-entity-legal-structure/tax-rates/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first tax rate
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Tax Config ID
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Rate (bps)
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Effective From
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Effective To
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
              {data.map((rate) => (
                <tr
                  key={rate.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/multi-entity-legal-structure/tax-rates/${rate.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {rate.taxConfigId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{rate.rateBps}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {rate.effectiveFrom.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rate.effectiveTo
                      ? rate.effectiveTo.toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={rate.isActive ? "success" : "secondary"}>
                      {rate.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rate.createdAt.toLocaleDateString()}
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
