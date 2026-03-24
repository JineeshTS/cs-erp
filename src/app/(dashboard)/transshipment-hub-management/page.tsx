import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Package,
  Ship,
  MapPin,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Brain,
  Timer,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  thmCargoPlans,
  thmFeederCoordinations,
  thmCargoTrackings,
  thmMissedConnections,
  thmRevenueAttributions,
  thmHubEfficiencies,
  thmOptimizationEngines,
  thmPenaltyTrackings,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function TransshipmentHubManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "thm:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "thm:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftCargoPlans, draftFeederCoordinations, draftCargoTrackings, draftMissedConnections, draftRevenueAttributions, draftHubEfficiencies, draftOptimizationEngines, draftPenaltyTrackings] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(thmCargoPlans)
        .where(and(eq(thmCargoPlans.tenantId, session.tenantId), isNull(thmCargoPlans.deletedAt), eq(thmCargoPlans.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(thmFeederCoordinations)
        .where(and(eq(thmFeederCoordinations.tenantId, session.tenantId), isNull(thmFeederCoordinations.deletedAt), eq(thmFeederCoordinations.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(thmCargoTrackings)
        .where(and(eq(thmCargoTrackings.tenantId, session.tenantId), isNull(thmCargoTrackings.deletedAt), eq(thmCargoTrackings.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(thmMissedConnections)
        .where(and(eq(thmMissedConnections.tenantId, session.tenantId), isNull(thmMissedConnections.deletedAt), eq(thmMissedConnections.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(thmRevenueAttributions)
        .where(and(eq(thmRevenueAttributions.tenantId, session.tenantId), isNull(thmRevenueAttributions.deletedAt), eq(thmRevenueAttributions.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(thmHubEfficiencies)
        .where(and(eq(thmHubEfficiencies.tenantId, session.tenantId), isNull(thmHubEfficiencies.deletedAt), eq(thmHubEfficiencies.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(thmOptimizationEngines)
        .where(and(eq(thmOptimizationEngines.tenantId, session.tenantId), isNull(thmOptimizationEngines.deletedAt), eq(thmOptimizationEngines.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(thmPenaltyTrackings)
        .where(and(eq(thmPenaltyTrackings.tenantId, session.tenantId), isNull(thmPenaltyTrackings.deletedAt), eq(thmPenaltyTrackings.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(thmCargoPlans.tenantId, session.tenantId),
    isNull(thmCargoPlans.deletedAt),
  ];
  if (status) conditions.push(eq(thmCargoPlans.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(thmCargoPlans.planRef, `%${escapeIlike(search)}%`),
        ilike(thmCargoPlans.hubPort, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(thmCargoPlans.createdAt, thmCargoPlans.id, parsedCursor));

  const data = await db.select().from(thmCargoPlans)
    .where(and(...conditions))
    .orderBy(desc(thmCargoPlans.createdAt), desc(thmCargoPlans.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/transshipment-hub-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transshipment Hub Management</h1>
          <p className="text-sm text-gray-500">Cargo planning, feeder coordination, tracking, missed connections, revenue attribution, hub efficiency, optimization, penalties</p>
        </div>
        {canCreate && (
          <Link href="/transshipment-hub-management/cargo-plans/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Cargo Plan
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Package className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Cargo Plans</p><p className="text-2xl font-bold text-gray-900">{draftCargoPlans}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Ship className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Feeder Coord.</p><p className="text-2xl font-bold text-gray-900">{draftFeederCoordinations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><MapPin className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Cargo Track.</p><p className="text-2xl font-bold text-gray-900">{draftCargoTrackings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Missed Conn.</p><p className="text-2xl font-bold text-gray-900">{draftMissedConnections}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><DollarSign className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Revenue Attr.</p><p className="text-2xl font-bold text-gray-900">{draftRevenueAttributions}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Hub Effic.</p><p className="text-2xl font-bold text-gray-900">{draftHubEfficiencies}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Brain className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Optimization</p><p className="text-2xl font-bold text-gray-900">{draftOptimizationEngines}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Timer className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Penalties</p><p className="text-2xl font-bold text-gray-900">{draftPenaltyTrackings}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Plan ref, hub port..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="verified">Verified</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/transshipment-hub-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No cargo plans found.</p>
          {canCreate && (
            <Link href="/transshipment-hub-management/cargo-plans/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first cargo plan</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Hub Port</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Mother Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Containers</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/transshipment-hub-management/cargo-plans/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.planRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.hubPort || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.planType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{t.motherVessel || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.containerCount ?? "\u2014"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "verified" ? "success" : t.status === "published" ? "default" : "secondary"}>{t.status}</Badge>
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
