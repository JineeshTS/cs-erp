import Link from "next/link";
import { Plus, Search, Receipt } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listInvoices } from "@/lib/customer-portal/service";
import { Badge } from "@/components/ui/badge";

function statusBadgeVariant(status: string) {
  switch (status) {
    case "paid":
      return "success" as const;
    case "overdue":
    case "cancelled":
      return "destructive" as const;
    case "draft":
      return "secondary" as const;
    case "partially_paid":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString()}`;
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function InvoicesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "portal:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";

  const { data: invoices, meta } = await listInvoices({
    tenantId: session.tenantId,
    search: search || undefined,
    status: status || undefined,
    cursor: cursor || undefined,
  });

  function buildNextUrl(nextCursor: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCursor);
    return `/customer-portal/invoices?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">
            Manage customer portal invoices
          </p>
        </div>
        {canCreate && (
          <Link
            href="/customer-portal/invoices/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Invoice
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
              placeholder="Invoice ref or currency..."
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
            <option value="issued">Issued</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
            <option value="partially_paid">Partially Paid</option>
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
            href="/customer-portal/invoices"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {invoices.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Receipt className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No invoices found.</p>
          {canCreate && (
            <Link
              href="/customer-portal/invoices/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first invoice
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Invoice Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Currency
                </th>
                <th className="px-4 py-3 text-end font-medium text-gray-500">
                  Total Amount
                </th>
                <th className="px-4 py-3 text-end font-medium text-gray-500">
                  Paid Amount
                </th>
                <th className="px-4 py-3 text-end font-medium text-gray-500">
                  Balance Due
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/customer-portal/invoices/${inv.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {inv.invoiceRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {inv.invoiceType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{inv.currency}</td>
                  <td className="px-4 py-3 text-end text-gray-600">
                    {formatAmount(inv.totalAmount, inv.currency)}
                  </td>
                  <td className="px-4 py-3 text-end text-gray-600">
                    {formatAmount(inv.paidAmount, inv.currency)}
                  </td>
                  <td className="px-4 py-3 text-end text-gray-600">
                    {formatAmount(inv.balanceDue, inv.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(inv.status)}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(inv.dueDate)}
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
