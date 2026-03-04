import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  CheckCircle,
  DollarSign,
  BarChart3,
  ArrowRightLeft,
  Workflow,
  Building2,
  Brain,
  TrendingUp,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  vrsVoyageCloses,
  vrsTcSettlements,
  vrsVoyagePnls,
  vrsHireReconciliations,
  vrsResultWorkflows,
  vrsIntercoSettlements,
  vrsProfitBenchmarks,
  vrsVoyageAnalytics,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function VoyageResultsSettlementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "vrs:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftVoyageCloses, draftTcSettlements, draftVoyagePnls, draftHireReconciliations, draftResultWorkflows, draftIntercoSettlements, draftProfitBenchmarks, draftVoyageAnalytics] =
    await Promise.all([
      db.select({ id: vrsVoyageCloses.id }).from(vrsVoyageCloses)
        .where(and(eq(vrsVoyageCloses.tenantId, session.tenantId), isNull(vrsVoyageCloses.deletedAt), eq(vrsVoyageCloses.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vrsTcSettlements.id }).from(vrsTcSettlements)
        .where(and(eq(vrsTcSettlements.tenantId, session.tenantId), isNull(vrsTcSettlements.deletedAt), eq(vrsTcSettlements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vrsVoyagePnls.id }).from(vrsVoyagePnls)
        .where(and(eq(vrsVoyagePnls.tenantId, session.tenantId), isNull(vrsVoyagePnls.deletedAt), eq(vrsVoyagePnls.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vrsHireReconciliations.id }).from(vrsHireReconciliations)
        .where(and(eq(vrsHireReconciliations.tenantId, session.tenantId), isNull(vrsHireReconciliations.deletedAt), eq(vrsHireReconciliations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vrsResultWorkflows.id }).from(vrsResultWorkflows)
        .where(and(eq(vrsResultWorkflows.tenantId, session.tenantId), isNull(vrsResultWorkflows.deletedAt), eq(vrsResultWorkflows.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vrsIntercoSettlements.id }).from(vrsIntercoSettlements)
        .where(and(eq(vrsIntercoSettlements.tenantId, session.tenantId), isNull(vrsIntercoSettlements.deletedAt), eq(vrsIntercoSettlements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vrsProfitBenchmarks.id }).from(vrsProfitBenchmarks)
        .where(and(eq(vrsProfitBenchmarks.tenantId, session.tenantId), isNull(vrsProfitBenchmarks.deletedAt), eq(vrsProfitBenchmarks.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vrsVoyageAnalytics.id }).from(vrsVoyageAnalytics)
        .where(and(eq(vrsVoyageAnalytics.tenantId, session.tenantId), isNull(vrsVoyageAnalytics.deletedAt), eq(vrsVoyageAnalytics.status, "draft")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(vrsVoyageCloses.tenantId, session.tenantId),
    isNull(vrsVoyageCloses.deletedAt),
  ];
  if (status) conditions.push(eq(vrsVoyageCloses.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(vrsVoyageCloses.closeRef, `%${search}%`),
        ilike(vrsVoyageCloses.title, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(vrsVoyageCloses.createdAt, new Date(cursor)));

  const data = await db.select().from(vrsVoyageCloses)
    .where(and(...conditions))
    .orderBy(desc(vrsVoyageCloses.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/voyage-results-settlement?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voyage Results & Settlement</h1>
          <p className="text-sm text-gray-500">Voyage closes, TC settlements, P&L, hire reconciliation, workflows, intercompany, benchmarks, analytics</p>
        </div>
        {canCreate && (
          <Link href="/voyage-results-settlement/voyage-closes/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Voyage Close
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><CheckCircle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Closes</p><p className="text-2xl font-bold text-gray-900">{draftVoyageCloses}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><DollarSign className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft TC Settlements</p><p className="text-2xl font-bold text-gray-900">{draftTcSettlements}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft P&L</p><p className="text-2xl font-bold text-gray-900">{draftVoyagePnls}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><ArrowRightLeft className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Reconciliations</p><p className="text-2xl font-bold text-gray-900">{draftHireReconciliations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Workflow className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Workflows</p><p className="text-2xl font-bold text-gray-900">{draftResultWorkflows}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><Building2 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Intercompany</p><p className="text-2xl font-bold text-gray-900">{draftIntercoSettlements}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Brain className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Benchmarks</p><p className="text-2xl font-bold text-gray-900">{draftProfitBenchmarks}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Analytics</p><p className="text-2xl font-bold text-gray-900">{draftVoyageAnalytics}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Close ref, title..."
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
          <Link href="/voyage-results-settlement" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No voyage closes found.</p>
          {canCreate && (
            <Link href="/voyage-results-settlement/voyage-closes/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first voyage close</Link>
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
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Net Result</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/voyage-results-settlement/voyage-closes/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.closeRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.title || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.closeType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.netResult ? `$${t.netResult}` : "\u2014"}</td>
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
