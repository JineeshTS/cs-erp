import Link from "next/link";
import {
  Plus,
  Fuel,
  Search,
  Anchor,
  AlertTriangle,
  Leaf,
  Brain,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  bfmBunkerOrders,
  bfmBunkerStems,
  bfmQualityClaims,
  bfmEmissionsRecords,
  bfmOptimizationRuns,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function BunkerFuelManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "bunker:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeOrders, plannedStems, openClaims, pendingEmissions, runningOptimizations] =
    await Promise.all([
      db.select({ id: bfmBunkerOrders.id }).from(bfmBunkerOrders)
        .where(and(eq(bfmBunkerOrders.tenantId, session.tenantId), isNull(bfmBunkerOrders.deletedAt), eq(bfmBunkerOrders.status, "confirmed")))
        .then((r) => r.length),
      db.select({ id: bfmBunkerStems.id }).from(bfmBunkerStems)
        .where(and(eq(bfmBunkerStems.tenantId, session.tenantId), isNull(bfmBunkerStems.deletedAt), eq(bfmBunkerStems.status, "planned")))
        .then((r) => r.length),
      db.select({ id: bfmQualityClaims.id }).from(bfmQualityClaims)
        .where(and(eq(bfmQualityClaims.tenantId, session.tenantId), isNull(bfmQualityClaims.deletedAt), eq(bfmQualityClaims.status, "open")))
        .then((r) => r.length),
      db.select({ id: bfmEmissionsRecords.id }).from(bfmEmissionsRecords)
        .where(and(eq(bfmEmissionsRecords.tenantId, session.tenantId), isNull(bfmEmissionsRecords.deletedAt), eq(bfmEmissionsRecords.status, "draft")))
        .then((r) => r.length),
      db.select({ id: bfmOptimizationRuns.id }).from(bfmOptimizationRuns)
        .where(and(eq(bfmOptimizationRuns.tenantId, session.tenantId), isNull(bfmOptimizationRuns.deletedAt), eq(bfmOptimizationRuns.status, "running")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(bfmBunkerOrders.tenantId, session.tenantId),
    isNull(bfmBunkerOrders.deletedAt),
  ];
  if (status) conditions.push(eq(bfmBunkerOrders.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(bfmBunkerOrders.orderRef, `%${search}%`),
        ilike(bfmBunkerOrders.vesselName, `%${search}%`),
        ilike(bfmBunkerOrders.supplierName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(bfmBunkerOrders.createdAt, new Date(cursor)));

  const data = await db.select().from(bfmBunkerOrders)
    .where(and(...conditions))
    .orderBy(desc(bfmBunkerOrders.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/bunker-fuel-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bunker & Fuel Management</h1>
          <p className="text-sm text-gray-500">Procurement, quality, ROB tracking, emissions, and optimization</p>
        </div>
        {canCreate && (
          <Link href="/bunker-fuel-management/orders/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Order
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Fuel className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Orders</p><p className="text-2xl font-bold text-gray-900">{activeOrders}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Anchor className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Planned Stems</p><p className="text-2xl font-bold text-gray-900">{plannedStems}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Open Claims</p><p className="text-2xl font-bold text-gray-900">{openClaims}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Leaf className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Emissions</p><p className="text-2xl font-bold text-gray-900">{pendingEmissions}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Brain className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Running AI</p><p className="text-2xl font-bold text-gray-900">{runningOptimizations}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Order ref, vessel, or supplier..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/bunker-fuel-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Fuel className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No bunker orders found.</p>
          {canCreate && (
            <Link href="/bunker-fuel-management/orders/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first order</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Order Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Supplier</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Port</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Fuel Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Qty (MT)</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/bunker-fuel-management/orders/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.orderRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.supplierName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.port}</td>
                  <td className="px-4 py-3 text-gray-600">{t.fuelType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.quantityOrdered}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "confirmed" ? "success" : t.status === "cancelled" ? "destructive" : "secondary"}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link href={buildNextUrl(nextCursor)} className="text-sm text-blue-600 hover:underline">Load more</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
