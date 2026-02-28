import Link from "next/link";
import {
  Plus,
  Users,
  Target,
  FileText,
  Megaphone,
  Search,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  scmCustomers,
  scmOpportunities,
  scmContracts,
  scmLeads,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function SalesCrmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "sales:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const customerType = sp.customerType ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeCustomers, openOpportunities, activeContracts, newLeads] =
    await Promise.all([
      db
        .select({ id: scmCustomers.id })
        .from(scmCustomers)
        .where(
          and(
            eq(scmCustomers.tenantId, session.tenantId),
            isNull(scmCustomers.deletedAt),
            eq(scmCustomers.status, "active")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: scmOpportunities.id })
        .from(scmOpportunities)
        .where(
          and(
            eq(scmOpportunities.tenantId, session.tenantId),
            isNull(scmOpportunities.deletedAt),
            eq(scmOpportunities.status, "open")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: scmContracts.id })
        .from(scmContracts)
        .where(
          and(
            eq(scmContracts.tenantId, session.tenantId),
            isNull(scmContracts.deletedAt),
            eq(scmContracts.status, "active")
          )
        )
        .then((r) => r.length),
      db
        .select({ id: scmLeads.id })
        .from(scmLeads)
        .where(
          and(
            eq(scmLeads.tenantId, session.tenantId),
            isNull(scmLeads.deletedAt),
            eq(scmLeads.status, "new")
          )
        )
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(scmCustomers.tenantId, session.tenantId),
    isNull(scmCustomers.deletedAt),
  ];
  if (customerType)
    conditions.push(eq(scmCustomers.customerType, customerType));
  if (status) conditions.push(eq(scmCustomers.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(scmCustomers.companyName, `%${search}%`),
        ilike(scmCustomers.customerCode, `%${search}%`),
        ilike(scmCustomers.email, `%${search}%`)
      )!
    );
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
    if (customerType) p.set("customerType", customerType);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/sales-crm?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sales &amp; CRM
          </h1>
          <p className="text-sm text-gray-500">
            Manage customers, opportunities, quotations, and contracts
          </p>
        </div>
        {canCreate && (
          <Link
            href="/sales-crm/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Customer
          </Link>
        )}
      </div>

      {/* Dashboard Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{activeCustomers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{openOpportunities}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Contracts</p>
              <p className="text-2xl font-bold text-gray-900">{activeContracts}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">New Leads</p>
              <p className="text-2xl font-bold text-gray-900">{newLeads}</p>
            </div>
          </div>
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
              placeholder="Company name, code, or email..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
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
            <option value="freight_forwarder">Freight Forwarder</option>
            <option value="nvocc">NVOCC</option>
            <option value="agent">Agent</option>
            <option value="broker">Broker</option>
          </select>
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
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="blacklisted">Blacklisted</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || customerType || status) && (
          <Link
            href="/sales-crm"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Customer Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No customers found.</p>
          {canCreate && (
            <Link
              href="/sales-crm/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Add your first customer
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Company
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Country
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Tier
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
                      href={`/sales-crm/${c.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {c.customerCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.companyName}
                    {c.tradeName && (
                      <span className="ms-1 text-xs text-gray-400">
                        ({c.tradeName})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.customerType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.country}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        c.tier === "platinum"
                          ? "default"
                          : c.tier === "gold"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {c.tier ?? "standard"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        c.status === "active"
                          ? "success"
                          : c.status === "blacklisted"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {c.status}
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
