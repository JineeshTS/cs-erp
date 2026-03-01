import Link from "next/link";
import { Plus, Search, CreditCard } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listPayments } from "@/lib/customer-portal/service";
import { Badge } from "@/components/ui/badge";

function statusBadgeVariant(status: string) {
  switch (status) {
    case "completed":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    case "pending":
      return "secondary" as const;
    default:
      return "default" as const;
  }
}

export default async function PaymentsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "portal:read")))
    redirect("/customer-portal");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "portal:create"
  );

  const { search, status, cursor } = await searchParams;

  const { data, meta } = await listPayments({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">
            View and manage customer portal payments
          </p>
        </div>
        {canCreate && (
          <Link
            href="/customer-portal/payments/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Payment
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="search"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search ?? ""}
              placeholder="Payment ref..."
              className="w-64 rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Filter
        </button>
      </form>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <CreditCard className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-3 text-gray-500">No payments found.</p>
          {canCreate && (
            <Link
              href="/customer-portal/payments/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first payment
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Payment Ref
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Amount
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Currency
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Gateway Provider
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/customer-portal/payments/${payment.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {payment.paymentRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {payment.amount}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {payment.currency}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {payment.paymentMethod}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {payment.gatewayProvider ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {payment.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.hasMore && meta.cursor && (
        <div className="flex justify-center">
          <Link
            href={`/customer-portal/payments?${new URLSearchParams({
              ...(search ? { search } : {}),
              ...(status ? { status } : {}),
              cursor: meta.cursor,
            }).toString()}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}
