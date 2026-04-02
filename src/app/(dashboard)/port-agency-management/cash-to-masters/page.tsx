import Link from "next/link";
import { Plus, Search, Banknote } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listCashToMasters } from "@/lib/port-agency-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  requested: "secondary",
  approved: "default",
  disbursed: "success",
  settled: "success",
  rejected: "destructive",
} as const;

export default async function CashToMastersListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "port_agency:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data: items, meta } = await listCashToMasters({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
  });

  function buildUrl(params: Record<string, string>) {
    const p = new URLSearchParams();
    if (params.search || search) p.set("search", params.search ?? search);
    if (params.status || status) p.set("status", params.status ?? status);
    if (params.cursor) p.set("cursor", params.cursor);
    return `/port-agency-management/cash-to-masters?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash to Master</h1>
          <p className="text-sm text-gray-500">
            Manage cash advances, disbursements, and settlements for vessel
            masters
          </p>
        </div>
        {canCreate && (
          <Link
            href="/port-agency-management/cash-to-masters/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Cash to Master
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
              placeholder="Ref, vessel, master name..."
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
            <option value="requested">Requested</option>
            <option value="approved">Approved</option>
            <option value="disbursed">Disbursed</option>
            <option value="settled">Settled</option>
            <option value="rejected">Rejected</option>
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
            href="/port-agency-management/cash-to-masters"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Banknote className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">
            No cash to master transactions found.
          </p>
          {canCreate && (
            <Link
              href="/port-agency-management/cash-to-masters/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first cash to master transaction
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Transaction Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Vessel
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Master Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Requested Amount
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((txn) => (
                <tr
                  key={txn.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/port-agency-management/cash-to-masters/${txn.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {txn.transactionRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {txn.transactionType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {txn.vesselName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {txn.masterName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {txn.requestedAmount != null
                      ? `${txn.requestedAmount}${txn.currency ? ` ${txn.currency}` : ""}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        statusVariant[
                          txn.status as keyof typeof statusVariant
                        ] ?? "secondary"
                      }
                    >
                      {txn.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.hasMore && meta.cursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildUrl({ cursor: meta.cursor })}
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
