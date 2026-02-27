import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { exchangeRates } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ExchangeRatesListPage() {
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
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.tenantId, session.tenantId),
        isNull(exchangeRates.deletedAt)
      )
    )
    .orderBy(desc(exchangeRates.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exchange Rates</h1>
          <p className="text-sm text-gray-500">
            Manage currency exchange rate master data
          </p>
        </div>
        {canCreate && (
          <Link
            href="/master-data-management/exchange-rates/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Rate
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No exchange rates found.</p>
          {canCreate && (
            <Link
              href="/master-data-management/exchange-rates/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first exchange rate
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Base Currency
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Target Currency
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Rate
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Source
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Effective Date
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
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
                      href={`/master-data-management/exchange-rates/${rate.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {rate.baseCurrency}/{rate.targetCurrency}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rate.targetCurrency}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{rate.rate}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {rate.source || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rate.effectiveDate}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        rate.status === "active" ? "success" : "secondary"
                      }
                    >
                      {rate.status}
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
