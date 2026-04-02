import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listInvoiceAmendments } from "@/lib/freight-invoice-revenue-management/service";
import { Badge } from "@/components/ui/badge";

export default async function InvoiceAmendmentsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/freight-invoice-revenue-management");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "invoice:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data: items, meta } = await listInvoiceAmendments({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
  });

  function buildUrl(params: Record<string, string>) {
    const p = new URLSearchParams();
    if (params.search ?? search) p.set("search", params.search ?? search);
    if (params.status ?? status) p.set("status", params.status ?? status);
    if (params.cursor) p.set("cursor", params.cursor);
    return `/freight-invoice-revenue-management/invoice-amendments?${p.toString()}`;
  }

  function statusVariant(s: string) {
    switch (s) {
      case "approved":
        return "success" as const;
      case "rejected":
        return "destructive" as const;
      case "pending_approval":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Invoice Amendments
          </h1>
          <p className="text-sm text-gray-500">
            Manage invoice corrections, rate changes, and reissues
          </p>
        </div>
        {canCreate && (
          <Link
            href="/freight-invoice-revenue-management/invoice-amendments/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Amendment
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
              placeholder="Amendment ref or invoice number..."
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
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
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
            href="/freight-invoice-revenue-management/invoice-amendments"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No invoice amendments found.</p>
          {canCreate && (
            <Link
              href="/freight-invoice-revenue-management/invoice-amendments/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first amendment
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Amendment Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Original Invoice
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Previous Amt
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  New Amt
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Adjustment
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((amendment) => (
                <tr
                  key={amendment.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/freight-invoice-revenue-management/invoice-amendments/${amendment.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {amendment.amendmentRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {amendment.originalInvoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {amendment.amendmentType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {amendment.previousAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {amendment.newAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {amendment.adjustmentAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(amendment.status)}>
                      {amendment.status}
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
