import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Landmark,
  Navigation,
  Boxes,
  MapPin,
  Brain,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  icdDryPorts,
  icdRailPlans,
  icdTruckBookings,
  icdLastMileDeliveries,
  icdRouteOptimizations,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function IntermodalIcdOperationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "intermodal:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activePorts, planningRailPlans, pendingTruckBookings, pendingDeliveries, pendingOptimizations] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(icdDryPorts)
        .where(and(eq(icdDryPorts.tenantId, session.tenantId), isNull(icdDryPorts.deletedAt), eq(icdDryPorts.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(icdRailPlans)
        .where(and(eq(icdRailPlans.tenantId, session.tenantId), isNull(icdRailPlans.deletedAt), eq(icdRailPlans.status, "planning")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(icdTruckBookings)
        .where(and(eq(icdTruckBookings.tenantId, session.tenantId), isNull(icdTruckBookings.deletedAt), eq(icdTruckBookings.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(icdLastMileDeliveries)
        .where(and(eq(icdLastMileDeliveries.tenantId, session.tenantId), isNull(icdLastMileDeliveries.deletedAt), eq(icdLastMileDeliveries.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(icdRouteOptimizations)
        .where(and(eq(icdRouteOptimizations.tenantId, session.tenantId), isNull(icdRouteOptimizations.deletedAt), eq(icdRouteOptimizations.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(icdDryPorts.tenantId, session.tenantId),
    isNull(icdDryPorts.deletedAt),
  ];
  if (status) conditions.push(eq(icdDryPorts.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(icdDryPorts.portRef, `%${escapeIlike(search)}%`),
        ilike(icdDryPorts.portName, `%${escapeIlike(search)}%`),
        ilike(icdDryPorts.portCode, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(icdDryPorts.createdAt, icdDryPorts.id, parsedCursor));

  const data = await db.select().from(icdDryPorts)
    .where(and(...conditions))
    .orderBy(desc(icdDryPorts.createdAt), desc(icdDryPorts.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/intermodal-icd-operations?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Intermodal & ICD Operations</h1>
          <p className="text-sm text-gray-500">Dry ports, rail plans, truck bookings, warehouses, last mile, B/Ls, haulage rates, and route optimization</p>
        </div>
        {canCreate && (
          <Link href="/intermodal-icd-operations/dry-ports/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Dry Port
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Landmark className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Ports</p><p className="text-2xl font-bold text-gray-900">{activePorts}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Navigation className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Planning Rail</p><p className="text-2xl font-bold text-gray-900">{planningRailPlans}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Boxes className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Trucks</p><p className="text-2xl font-bold text-gray-900">{pendingTruckBookings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><MapPin className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Deliveries</p><p className="text-2xl font-bold text-gray-900">{pendingDeliveries}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Brain className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Route Optimizations</p><p className="text-2xl font-bold text-gray-900">{pendingOptimizations}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Port ref, name, code..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/intermodal-icd-operations" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No dry ports found.</p>
          {canCreate && (
            <Link href="/intermodal-icd-operations/dry-ports/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first dry port</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Port Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Country</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Operator</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/intermodal-icd-operations/dry-ports/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.portRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.portName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.portType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.country || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.operatorName || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "active" ? "success" : t.status === "inactive" ? "destructive" : "secondary"}>{t.status}</Badge>
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
