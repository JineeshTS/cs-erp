import Link from "next/link";
import { Plus, CreditCard, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listCashApplications } from "@/lib/accounts-receivable-credit-control/service";
import { Badge } from "@/components/ui/badge";

export default async function CashApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read")))
    redirect("/");
  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "receivable:create"
  );

  const sp = await searchParams;
  const result = await listCashApplications({
    tenantId: session.tenantId,
    search: sp.search,
    status: sp.status,
    cursor: sp.cursor,
    limit: 50,
  });

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (sp.search) p.set("search", sp.search);
    if (sp.status) p.set("status", sp.status);
    p.set("cursor", nextCur);
    return `/accounts-receivable-credit-control/cash-applications?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cash Applications
          </h1>
          <p className="text-sm text-gray-500">
            Match and apply customer payments to invoices
          </p>
        </div>
        {canCreate && (
          <Link
            href="/accounts-receivable-credit-control/cash-applications/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Application
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="search"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={sp.search ?? ""}
              placeholder="Application ref, customer, payment ref..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={sp.status ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="partially_applied">Partially Applied</option>
            <option value="fully_applied">Fully Applied</option>
            <option value="rejected">Rejected</option>
            <option value="reversed">Reversed</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(sp.search || sp.status) && (
          <Link
            href="/accounts-receivable-credit-control/cash-applications"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {result.data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <CreditCard className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No cash applications found.</p>
          {canCreate && (
            <Link
              href="/accounts-receivable-credit-control/cash-applications/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first cash application
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Application Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Payment Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Method
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Payment
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Applied
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Unapplied
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/accounts-receivable-credit-control/cash-applications/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.applicationRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.customerName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.paymentReference}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.paymentMethod}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.paymentAmount?.toLocaleString() ?? "--"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.appliedAmount?.toLocaleString() ?? "--"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.unappliedAmount?.toLocaleString() ?? "--"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        t.status === "fully_applied"
                          ? "success"
                          : t.status === "pending"
                            ? "secondary"
                            : t.status === "partially_applied"
                              ? "warning"
                              : t.status === "rejected" ||
                                  t.status === "reversed"
                                ? "destructive"
                                : "default"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.meta.hasMore && result.meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(result.meta.cursor)}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
