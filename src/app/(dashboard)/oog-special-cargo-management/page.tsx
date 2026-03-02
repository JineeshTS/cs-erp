import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Package,
  LayoutGrid,
  Wrench,
  Weight,
  Anchor,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  oogCargoAcceptances,
  oogStowagePlans,
  oogSpecialEquipment,
  oogHeavyLifts,
  oogPortApprovals,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function OogSpecialCargoManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "oog_special:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "oog_special:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [pendingAcceptances, draftStowagePlans, availableEquipment, planningHeavyLifts, pendingApprovals] =
    await Promise.all([
      db.select({ id: oogCargoAcceptances.id }).from(oogCargoAcceptances)
        .where(and(eq(oogCargoAcceptances.tenantId, session.tenantId), isNull(oogCargoAcceptances.deletedAt), eq(oogCargoAcceptances.status, "pending")))
        .then((r) => r.length),
      db.select({ id: oogStowagePlans.id }).from(oogStowagePlans)
        .where(and(eq(oogStowagePlans.tenantId, session.tenantId), isNull(oogStowagePlans.deletedAt), eq(oogStowagePlans.status, "draft")))
        .then((r) => r.length),
      db.select({ id: oogSpecialEquipment.id }).from(oogSpecialEquipment)
        .where(and(eq(oogSpecialEquipment.tenantId, session.tenantId), isNull(oogSpecialEquipment.deletedAt), eq(oogSpecialEquipment.status, "available")))
        .then((r) => r.length),
      db.select({ id: oogHeavyLifts.id }).from(oogHeavyLifts)
        .where(and(eq(oogHeavyLifts.tenantId, session.tenantId), isNull(oogHeavyLifts.deletedAt), eq(oogHeavyLifts.status, "planning")))
        .then((r) => r.length),
      db.select({ id: oogPortApprovals.id }).from(oogPortApprovals)
        .where(and(eq(oogPortApprovals.tenantId, session.tenantId), isNull(oogPortApprovals.deletedAt), eq(oogPortApprovals.status, "pending")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(oogCargoAcceptances.tenantId, session.tenantId),
    isNull(oogCargoAcceptances.deletedAt),
  ];
  if (status) conditions.push(eq(oogCargoAcceptances.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(oogCargoAcceptances.acceptanceRef, `%${search}%`),
        ilike(oogCargoAcceptances.customerName, `%${search}%`),
        ilike(oogCargoAcceptances.containerNumber, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(oogCargoAcceptances.createdAt, new Date(cursor)));

  const data = await db.select().from(oogCargoAcceptances)
    .where(and(...conditions))
    .orderBy(desc(oogCargoAcceptances.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/oog-special-cargo-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OOG & Special Cargo Management</h1>
          <p className="text-sm text-gray-500">Cargo acceptances, stowage plans, equipment, securing, heavy lifts, logistics, permits, and port approvals</p>
        </div>
        {canCreate && (
          <Link href="/oog-special-cargo-management/cargo-acceptances/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Acceptance
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Package className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Acceptances</p><p className="text-2xl font-bold text-gray-900">{pendingAcceptances}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><LayoutGrid className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Stowage Plans</p><p className="text-2xl font-bold text-gray-900">{draftStowagePlans}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Wrench className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Available Equipment</p><p className="text-2xl font-bold text-gray-900">{availableEquipment}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Weight className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Planning Heavy Lifts</p><p className="text-2xl font-bold text-gray-900">{planningHeavyLifts}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Anchor className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Approvals</p><p className="text-2xl font-bold text-gray-900">{pendingApprovals}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Ref, customer, container..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/oog-special-cargo-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No cargo acceptances found.</p>
          {canCreate && (
            <Link href="/oog-special-cargo-management/cargo-acceptances/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first cargo acceptance</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Container</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Cargo Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Weight (kg)</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/oog-special-cargo-management/cargo-acceptances/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.acceptanceRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.containerNumber || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.cargoType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.grossWeightKg}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "accepted" ? "success" : t.status === "rejected" || t.status === "cancelled" ? "destructive" : t.status === "completed" ? "success" : "secondary"}>{t.status}</Badge>
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
