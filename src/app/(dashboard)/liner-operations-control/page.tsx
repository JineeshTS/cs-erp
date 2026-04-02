import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Clock,
  RotateCcw,
  ArrowUpCircle,
  ShieldCheck,
  ArrowRightLeft,
  AlertTriangle,
  Brain,
  BarChart3,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  locCargoCutoffs,
  locOverbookingRollovers,
  locRollingUpgrades,
  locRevenueIntegrityAudits,
  locSlotSwapCoordinations,
  locScheduleDeviations,
  locCargoMixOptimizations,
  locLoadFactorReports,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function LinerOperationsControlPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "loc:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "loc:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftCargoCutoffs, draftOverbookingRollovers, draftRollingUpgrades, draftRevenueIntegrityAudits, draftSlotSwapCoordinations, draftScheduleDeviations, draftCargoMixOptimizations, draftLoadFactorReports] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(locCargoCutoffs)
        .where(and(eq(locCargoCutoffs.tenantId, session.tenantId), isNull(locCargoCutoffs.deletedAt), eq(locCargoCutoffs.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(locOverbookingRollovers)
        .where(and(eq(locOverbookingRollovers.tenantId, session.tenantId), isNull(locOverbookingRollovers.deletedAt), eq(locOverbookingRollovers.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(locRollingUpgrades)
        .where(and(eq(locRollingUpgrades.tenantId, session.tenantId), isNull(locRollingUpgrades.deletedAt), eq(locRollingUpgrades.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(locRevenueIntegrityAudits)
        .where(and(eq(locRevenueIntegrityAudits.tenantId, session.tenantId), isNull(locRevenueIntegrityAudits.deletedAt), eq(locRevenueIntegrityAudits.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(locSlotSwapCoordinations)
        .where(and(eq(locSlotSwapCoordinations.tenantId, session.tenantId), isNull(locSlotSwapCoordinations.deletedAt), eq(locSlotSwapCoordinations.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(locScheduleDeviations)
        .where(and(eq(locScheduleDeviations.tenantId, session.tenantId), isNull(locScheduleDeviations.deletedAt), eq(locScheduleDeviations.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(locCargoMixOptimizations)
        .where(and(eq(locCargoMixOptimizations.tenantId, session.tenantId), isNull(locCargoMixOptimizations.deletedAt), eq(locCargoMixOptimizations.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(locLoadFactorReports)
        .where(and(eq(locLoadFactorReports.tenantId, session.tenantId), isNull(locLoadFactorReports.deletedAt), eq(locLoadFactorReports.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(locCargoCutoffs.tenantId, session.tenantId),
    isNull(locCargoCutoffs.deletedAt),
  ];
  if (status) conditions.push(eq(locCargoCutoffs.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(locCargoCutoffs.cutoffRef, `%${escapeIlike(search)}%`),
        ilike(locCargoCutoffs.portName, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(locCargoCutoffs.createdAt, locCargoCutoffs.id, parsedCursor));

  const data = await db.select().from(locCargoCutoffs)
    .where(and(...conditions))
    .orderBy(desc(locCargoCutoffs.createdAt), desc(locCargoCutoffs.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/liner-operations-control?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liner Operations Control</h1>
          <p className="text-sm text-gray-500">Cargo cutoffs, overbooking/rollover, upgrades, revenue integrity, slot swaps, schedule deviations, cargo mix, and load factors</p>
        </div>
        {canCreate && (
          <Link href="/liner-operations-control/cargo-cutoffs/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Cutoff
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Clock className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Cutoffs</p><p className="text-2xl font-bold text-gray-900">{draftCargoCutoffs}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><RotateCcw className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Rollovers</p><p className="text-2xl font-bold text-gray-900">{draftOverbookingRollovers}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><ArrowUpCircle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Upgrades</p><p className="text-2xl font-bold text-gray-900">{draftRollingUpgrades}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><ShieldCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Audits</p><p className="text-2xl font-bold text-gray-900">{draftRevenueIntegrityAudits}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><ArrowRightLeft className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Slot Swaps</p><p className="text-2xl font-bold text-gray-900">{draftSlotSwapCoordinations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Deviations</p><p className="text-2xl font-bold text-gray-900">{draftScheduleDeviations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Brain className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Cargo Mix</p><p className="text-2xl font-bold text-gray-900">{draftCargoMixOptimizations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Load Factor</p><p className="text-2xl font-bold text-gray-900">{draftLoadFactorReports}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Cutoff ref, port..."
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
          <Link href="/liner-operations-control" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No cargo cutoffs found.</p>
          {canCreate && (
            <Link href="/liner-operations-control/cargo-cutoffs/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first cargo cutoff</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Port</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Cutoff</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/liner-operations-control/cargo-cutoffs/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.cutoffRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.portName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.cutoffType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.cutoffDatetime ? new Date(t.cutoffDatetime).toLocaleString() : "-"}</td>
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
