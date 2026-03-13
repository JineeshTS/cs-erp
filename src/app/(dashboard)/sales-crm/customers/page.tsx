import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { scmCustomers } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function SalesCrmCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:read")))
    redirect("/");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const customerType = sp.customerType ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(scmCustomers.tenantId, session.tenantId),
    isNull(scmCustomers.deletedAt),
  ];
  if (status) conditions.push(eq(scmCustomers.status, status));
  if (customerType)
    conditions.push(eq(scmCustomers.customerType, customerType));
  if (search) {
    conditions.push(ilike(scmCustomers.companyName, `%${search}%`));
  }
  if (cursor)
    conditions.push(lt(scmCustomers.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(scmCustomers)
    .where(and(...conditions))
    .orderBy(desc(scmCustomers.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    if (customerType) p.set("customerType", customerType);
    p.set("cursor", nextCur);
    return `/sales-crm/customers?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customers
          </h1>
          <p className="text-sm text-gray-500">
            View customers from the sales and onboarding pipeline
          </p>
        </div>
      </div>

      {/* Filters */}
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
              placeholder="Search by company name..."
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
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="customerType"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Type
          </label>
          <select
            id="customerType"
            name="customerType"
            defaultValue={customerType}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="shipper">Shipper</option>
            <option value="consignee">Consignee</option>
            <option value="agent">Agent</option>
            <option value="nvocc">NVOCC</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || status || customerType) && (
          <Link
            href="/sales-crm/customers"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Building2 className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No customers found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Customer Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Company Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Tier
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Country
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/sales-crm/customers/${c.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {c.customerCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.companyName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.customerType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.tier ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.country}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        c.status === "active"
                          ? "default"
                          : c.status === "pending"
                            ? "secondary"
                            : c.status === "suspended"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {c.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(nextCursor)}
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
