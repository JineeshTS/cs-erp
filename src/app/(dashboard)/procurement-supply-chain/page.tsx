import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  ClipboardList,
  Users,
  ShoppingCart,
  Handshake,
  Package,
  ClipboardCheck,
  TrendingUp,
  Star,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  pscPurchaseRequisitions,
  pscVendorSourcings,
  pscPurchaseOrders,
  pscProcurementContracts,
  pscInventoryStockControls,
  pscGoodsReceiptInspections,
  pscSpendAnalytics,
  pscSupplierScorecards,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ProcurementSupplyChainPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "procurement:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [pendingRequisitions, openSourcings, activePOs, activeContracts, activeInventory, pendingReceipts, draftAnalytics, draftScorecards] =
    await Promise.all([
      db.select({ id: pscPurchaseRequisitions.id }).from(pscPurchaseRequisitions)
        .where(and(eq(pscPurchaseRequisitions.tenantId, session.tenantId), isNull(pscPurchaseRequisitions.deletedAt), eq(pscPurchaseRequisitions.status, "pending")))
        .then((r) => r.length),
      db.select({ id: pscVendorSourcings.id }).from(pscVendorSourcings)
        .where(and(eq(pscVendorSourcings.tenantId, session.tenantId), isNull(pscVendorSourcings.deletedAt), eq(pscVendorSourcings.status, "open")))
        .then((r) => r.length),
      db.select({ id: pscPurchaseOrders.id }).from(pscPurchaseOrders)
        .where(and(eq(pscPurchaseOrders.tenantId, session.tenantId), isNull(pscPurchaseOrders.deletedAt), eq(pscPurchaseOrders.status, "approved")))
        .then((r) => r.length),
      db.select({ id: pscProcurementContracts.id }).from(pscProcurementContracts)
        .where(and(eq(pscProcurementContracts.tenantId, session.tenantId), isNull(pscProcurementContracts.deletedAt), eq(pscProcurementContracts.status, "active")))
        .then((r) => r.length),
      db.select({ id: pscInventoryStockControls.id }).from(pscInventoryStockControls)
        .where(and(eq(pscInventoryStockControls.tenantId, session.tenantId), isNull(pscInventoryStockControls.deletedAt), eq(pscInventoryStockControls.status, "active")))
        .then((r) => r.length),
      db.select({ id: pscGoodsReceiptInspections.id }).from(pscGoodsReceiptInspections)
        .where(and(eq(pscGoodsReceiptInspections.tenantId, session.tenantId), isNull(pscGoodsReceiptInspections.deletedAt), eq(pscGoodsReceiptInspections.status, "pending")))
        .then((r) => r.length),
      db.select({ id: pscSpendAnalytics.id }).from(pscSpendAnalytics)
        .where(and(eq(pscSpendAnalytics.tenantId, session.tenantId), isNull(pscSpendAnalytics.deletedAt), eq(pscSpendAnalytics.status, "draft")))
        .then((r) => r.length),
      db.select({ id: pscSupplierScorecards.id }).from(pscSupplierScorecards)
        .where(and(eq(pscSupplierScorecards.tenantId, session.tenantId), isNull(pscSupplierScorecards.deletedAt), eq(pscSupplierScorecards.status, "draft")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(pscPurchaseRequisitions.tenantId, session.tenantId),
    isNull(pscPurchaseRequisitions.deletedAt),
  ];
  if (status) conditions.push(eq(pscPurchaseRequisitions.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(pscPurchaseRequisitions.requisitionRef, `%${search}%`),
        ilike(pscPurchaseRequisitions.title, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(pscPurchaseRequisitions.createdAt, new Date(cursor)));

  const data = await db.select().from(pscPurchaseRequisitions)
    .where(and(...conditions))
    .orderBy(desc(pscPurchaseRequisitions.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/procurement-supply-chain?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement & Supply Chain</h1>
          <p className="text-sm text-gray-500">Purchase requisitions, vendor sourcing, POs, contracts, inventory, goods receipt, spend analytics, and supplier scorecards</p>
        </div>
        {canCreate && (
          <Link href="/procurement-supply-chain/purchase-requisitions/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Requisition
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><ClipboardList className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Requisitions</p><p className="text-2xl font-bold text-gray-900">{pendingRequisitions}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Users className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Open Sourcings</p><p className="text-2xl font-bold text-gray-900">{openSourcings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><ShoppingCart className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active POs</p><p className="text-2xl font-bold text-gray-900">{activePOs}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Handshake className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Contracts</p><p className="text-2xl font-bold text-gray-900">{activeContracts}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><Package className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Inventory</p><p className="text-2xl font-bold text-gray-900">{activeInventory}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><ClipboardCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Receipts</p><p className="text-2xl font-bold text-gray-900">{pendingReceipts}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Analytics</p><p className="text-2xl font-bold text-gray-900">{draftAnalytics}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Star className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Scorecards</p><p className="text-2xl font-bold text-gray-900">{draftScorecards}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Requisition ref, title..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/procurement-supply-chain" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No purchase requisitions found.</p>
          {canCreate && (
            <Link href="/procurement-supply-chain/purchase-requisitions/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first requisition</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Department</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Priority</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/procurement-supply-chain/purchase-requisitions/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.requisitionRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.title}</td>
                  <td className="px-4 py-3 text-gray-600">{t.requisitionType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.department || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.priority || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "approved" ? "success" : t.status === "rejected" ? "destructive" : "secondary"}>{t.status}</Badge>
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
