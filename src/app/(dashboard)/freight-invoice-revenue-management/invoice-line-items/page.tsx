import Link from "next/link";
import { Plus, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listInvoiceLineItems } from "@/lib/freight-invoice-revenue-management/service";

export default async function InvoiceLineItemsListPage({
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
  const invoiceId = sp.invoiceId ?? "";
  const cursor = sp.cursor ?? "";

  const { data: items, meta } = await listInvoiceLineItems({
    tenantId: session.tenantId,
    search: search || undefined,
    status: invoiceId || undefined,
    cursor: cursor || undefined,
    limit: 50,
  });

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (overrides.search ?? search) p.set("search", overrides.search ?? search);
    if (overrides.invoiceId ?? invoiceId)
      p.set("invoiceId", overrides.invoiceId ?? invoiceId);
    if (overrides.cursor) p.set("cursor", overrides.cursor);
    return `/freight-invoice-revenue-management/invoice-line-items?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Invoice Line Items
          </h1>
          <p className="text-sm text-gray-500">
            View and manage charge line items across invoices
          </p>
        </div>
        {canCreate && (
          <Link
            href="/freight-invoice-revenue-management/invoice-line-items/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Line Item
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
              placeholder="Charge code or description..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="invoiceId"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Invoice ID
          </label>
          <input
            id="invoiceId"
            name="invoiceId"
            type="text"
            defaultValue={invoiceId}
            placeholder="Filter by invoice ID..."
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || invoiceId) && (
          <Link
            href="/freight-invoice-revenue-management/invoice-line-items"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No invoice line items found.</p>
          {canCreate && (
            <Link
              href="/freight-invoice-revenue-management/invoice-line-items/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first line item
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Line #
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Charge Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Description
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Container
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Qty
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Total
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
                      href={`/freight-invoice-revenue-management/invoice-line-items/${t.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {t.lineNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.chargeCode}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.description.length > 60
                      ? `${t.description.slice(0, 60)}...`
                      : t.description}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.containerNumber || "--"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.quantity}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.unitPrice?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.totalAmount?.toLocaleString()}
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
