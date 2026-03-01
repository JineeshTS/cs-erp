import Link from "next/link";
import { Calculator, Search, Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listRevenueAccruals } from "@/lib/freight-invoice-revenue-management/service";
import { Badge } from "@/components/ui/badge";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "posted", label: "Posted" },
  { value: "reversed", label: "Reversed" },
  { value: "closed", label: "Closed" },
];

function statusVariant(status: string) {
  switch (status) {
    case "draft":
      return "secondary" as const;
    case "posted":
      return "success" as const;
    case "reversed":
      return "warning" as const;
    case "closed":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

export default async function RevenueAccrualsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "invoice:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data: items, meta } = await listRevenueAccruals({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
  });

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/freight-invoice-revenue-management/revenue-accruals?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Revenue Accruals
          </h1>
          <p className="text-sm text-gray-500">
            Manage revenue accruals and deferrals for freight accounting
          </p>
        </div>
        {canCreate && (
          <Link
            href="/freight-invoice-revenue-management/revenue-accruals/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Revenue Accrual
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
              defaultValue={search}
              placeholder="Accrual ref or voyage..."
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
            defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || status) && (
          <Link
            href="/freight-invoice-revenue-management/revenue-accruals"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Calculator className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No revenue accruals found.</p>
          {canCreate && (
            <Link
              href="/freight-invoice-revenue-management/revenue-accruals/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first revenue accrual
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Accrual Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Voyage
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Period
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Accrual Amt
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Remaining
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/freight-invoice-revenue-management/revenue-accruals/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.accrualRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.voyageRef}</td>
                  <td className="px-4 py-3 text-gray-600">{t.accrualType}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.accountingPeriod}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.accrualAmount}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.remainingAmount}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(t.status)}>
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.hasMore && meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(meta.cursor)}
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
