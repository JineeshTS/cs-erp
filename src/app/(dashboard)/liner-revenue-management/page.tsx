import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  TrendingUp,
  PieChart,
  BrainCircuit,
  FileSignature,
  SearchX,
  ShieldCheck,
  Calculator,
  Zap,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  lrmTeuMaximizations,
  lrmCargoMixes,
  lrmDemandForecasts,
  lrmFreightContracts,
  lrmLeakageDetections,
  lrmRateIntegrities,
  lrmRevenueAccruals,
  lrmMaximizationEngines,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function LinerRevenueManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lrm:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "lrm:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftTeuMaximizations, draftCargoMixes, draftDemandForecasts, draftFreightContracts, draftLeakageDetections, draftRateIntegrities, draftRevenueAccruals, draftMaximizationEngines] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(lrmTeuMaximizations)
        .where(and(eq(lrmTeuMaximizations.tenantId, session.tenantId), isNull(lrmTeuMaximizations.deletedAt), eq(lrmTeuMaximizations.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(lrmCargoMixes)
        .where(and(eq(lrmCargoMixes.tenantId, session.tenantId), isNull(lrmCargoMixes.deletedAt), eq(lrmCargoMixes.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(lrmDemandForecasts)
        .where(and(eq(lrmDemandForecasts.tenantId, session.tenantId), isNull(lrmDemandForecasts.deletedAt), eq(lrmDemandForecasts.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(lrmFreightContracts)
        .where(and(eq(lrmFreightContracts.tenantId, session.tenantId), isNull(lrmFreightContracts.deletedAt), eq(lrmFreightContracts.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(lrmLeakageDetections)
        .where(and(eq(lrmLeakageDetections.tenantId, session.tenantId), isNull(lrmLeakageDetections.deletedAt), eq(lrmLeakageDetections.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(lrmRateIntegrities)
        .where(and(eq(lrmRateIntegrities.tenantId, session.tenantId), isNull(lrmRateIntegrities.deletedAt), eq(lrmRateIntegrities.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(lrmRevenueAccruals)
        .where(and(eq(lrmRevenueAccruals.tenantId, session.tenantId), isNull(lrmRevenueAccruals.deletedAt), eq(lrmRevenueAccruals.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(lrmMaximizationEngines)
        .where(and(eq(lrmMaximizationEngines.tenantId, session.tenantId), isNull(lrmMaximizationEngines.deletedAt), eq(lrmMaximizationEngines.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(lrmTeuMaximizations.tenantId, session.tenantId),
    isNull(lrmTeuMaximizations.deletedAt),
  ];
  if (status) conditions.push(eq(lrmTeuMaximizations.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(lrmTeuMaximizations.strategyRef, `%${escapeIlike(search)}%`),
        ilike(lrmTeuMaximizations.tradeLane, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(lrmTeuMaximizations.createdAt, lrmTeuMaximizations.id, parsedCursor));

  const data = await db.select().from(lrmTeuMaximizations)
    .where(and(...conditions))
    .orderBy(desc(lrmTeuMaximizations.createdAt), desc(lrmTeuMaximizations.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/liner-revenue-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liner Revenue Management</h1>
          <p className="text-sm text-gray-500">TEU maximization, cargo mix, demand forecasting, freight contracts, leakage detection, rate integrity, accruals, AI engine</p>
        </div>
        {canCreate && (
          <Link href="/liner-revenue-management/teu-maximizations/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New TEU Strategy
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft TEU Strat.</p><p className="text-2xl font-bold text-gray-900">{draftTeuMaximizations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><PieChart className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Cargo Mix</p><p className="text-2xl font-bold text-gray-900">{draftCargoMixes}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><BrainCircuit className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Forecasts</p><p className="text-2xl font-bold text-gray-900">{draftDemandForecasts}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><FileSignature className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Contracts</p><p className="text-2xl font-bold text-gray-900">{draftFreightContracts}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><SearchX className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Leakages</p><p className="text-2xl font-bold text-gray-900">{draftLeakageDetections}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><ShieldCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Rate Int.</p><p className="text-2xl font-bold text-gray-900">{draftRateIntegrities}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Calculator className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Accruals</p><p className="text-2xl font-bold text-gray-900">{draftRevenueAccruals}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Zap className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft AI Engine</p><p className="text-2xl font-bold text-gray-900">{draftMaximizationEngines}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Strategy ref, trade lane..."
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
          <Link href="/liner-revenue-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No TEU maximization strategies found.</p>
          {canCreate && (
            <Link href="/liner-revenue-management/teu-maximizations/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first TEU strategy</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Trade Lane</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Current/TEU</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Target/TEU</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/liner-revenue-management/teu-maximizations/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.strategyRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.tradeLane || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.strategyType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{t.currentRevenueTeu ?? "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.targetRevenueTeu ?? "\u2014"}</td>
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
