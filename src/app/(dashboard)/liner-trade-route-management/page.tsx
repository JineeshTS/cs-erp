import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Navigation,
  GitBranch,
  DollarSign,
  Handshake,
  BarChart3,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  ltrServiceLoops,
  ltrPortPairTradeLanes,
  ltrSlotAgreements,
  ltrAllianceAgreements,
  ltrRouteOptimizations,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function LinerTradeRouteManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "liner:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeLoops, activeTradeLanes, activeSlotAgreements, activeAlliances, pendingOptimizations] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ltrServiceLoops)
        .where(and(eq(ltrServiceLoops.tenantId, session.tenantId), isNull(ltrServiceLoops.deletedAt), eq(ltrServiceLoops.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ltrPortPairTradeLanes)
        .where(and(eq(ltrPortPairTradeLanes.tenantId, session.tenantId), isNull(ltrPortPairTradeLanes.deletedAt), eq(ltrPortPairTradeLanes.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ltrSlotAgreements)
        .where(and(eq(ltrSlotAgreements.tenantId, session.tenantId), isNull(ltrSlotAgreements.deletedAt), eq(ltrSlotAgreements.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ltrAllianceAgreements)
        .where(and(eq(ltrAllianceAgreements.tenantId, session.tenantId), isNull(ltrAllianceAgreements.deletedAt), eq(ltrAllianceAgreements.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(ltrRouteOptimizations)
        .where(and(eq(ltrRouteOptimizations.tenantId, session.tenantId), isNull(ltrRouteOptimizations.deletedAt), eq(ltrRouteOptimizations.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(ltrServiceLoops.tenantId, session.tenantId),
    isNull(ltrServiceLoops.deletedAt),
  ];
  if (status) conditions.push(eq(ltrServiceLoops.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(ltrServiceLoops.loopRef, `%${escapeIlike(search)}%`),
        ilike(ltrServiceLoops.loopName, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(ltrServiceLoops.createdAt, ltrServiceLoops.id, parsedCursor));

  const data = await db.select().from(ltrServiceLoops)
    .where(and(...conditions))
    .orderBy(desc(ltrServiceLoops.createdAt), desc(ltrServiceLoops.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/liner-trade-route-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liner Trade Route Management</h1>
          <p className="text-sm text-gray-500">Service loops, trade lanes, slot agreements, alliances, port stays, route optimization, and market intelligence</p>
        </div>
        {canCreate && (
          <Link href="/liner-trade-route-management/service-loops/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Service Loop
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Navigation className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Loops</p><p className="text-2xl font-bold text-gray-900">{activeLoops}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><GitBranch className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Trade Lanes</p><p className="text-2xl font-bold text-gray-900">{activeTradeLanes}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Handshake className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Slot Agreements</p><p className="text-2xl font-bold text-gray-900">{activeSlotAgreements}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><DollarSign className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Alliances</p><p className="text-2xl font-bold text-gray-900">{activeAlliances}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Optimizations</p><p className="text-2xl font-bold text-gray-900">{pendingOptimizations}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Loop ref, loop name..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="suspended">Suspended</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/liner-trade-route-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No service loops found.</p>
          {canCreate && (
            <Link href="/liner-trade-route-management/service-loops/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first service loop</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Loop Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Trade Route</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Frequency</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ports</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/liner-trade-route-management/service-loops/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.loopRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.loopName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.tradeRoute}</td>
                  <td className="px-4 py-3 text-gray-600">{t.frequency}</td>
                  <td className="px-4 py-3 text-gray-600">{t.totalPorts}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "active" ? "success" : t.status === "discontinued" ? "destructive" : "secondary"}>{t.status}</Badge>
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
