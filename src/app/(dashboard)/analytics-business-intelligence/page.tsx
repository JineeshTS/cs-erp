import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Gauge,
  Ship,
  Route,
  Users,
  Brain,
  Globe,
  Activity,
  FileBarChart,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  abiExecutiveKpiDashboards,
  abiVoyageAnalytics,
  abiTradeLaneAnalytics,
  abiCustomerRevenueAnalytics,
  abiPredictiveForecasts,
  abiMarketIntelligenceReports,
  abiOperationalEfficiencies,
  abiBiReports,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function AnalyticsBusinessIntelligencePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "analytics:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [publishedKpi, draftVoyage, draftTradeLane, draftCustomer, activePredictions, draftMarket, draftEfficiency, scheduledReports] =
    await Promise.all([
      db.select({ id: abiExecutiveKpiDashboards.id }).from(abiExecutiveKpiDashboards)
        .where(and(eq(abiExecutiveKpiDashboards.tenantId, session.tenantId), isNull(abiExecutiveKpiDashboards.deletedAt), eq(abiExecutiveKpiDashboards.status, "published")))
        .then((r) => r.length),
      db.select({ id: abiVoyageAnalytics.id }).from(abiVoyageAnalytics)
        .where(and(eq(abiVoyageAnalytics.tenantId, session.tenantId), isNull(abiVoyageAnalytics.deletedAt), eq(abiVoyageAnalytics.status, "draft")))
        .then((r) => r.length),
      db.select({ id: abiTradeLaneAnalytics.id }).from(abiTradeLaneAnalytics)
        .where(and(eq(abiTradeLaneAnalytics.tenantId, session.tenantId), isNull(abiTradeLaneAnalytics.deletedAt), eq(abiTradeLaneAnalytics.status, "draft")))
        .then((r) => r.length),
      db.select({ id: abiCustomerRevenueAnalytics.id }).from(abiCustomerRevenueAnalytics)
        .where(and(eq(abiCustomerRevenueAnalytics.tenantId, session.tenantId), isNull(abiCustomerRevenueAnalytics.deletedAt), eq(abiCustomerRevenueAnalytics.status, "draft")))
        .then((r) => r.length),
      db.select({ id: abiPredictiveForecasts.id }).from(abiPredictiveForecasts)
        .where(and(eq(abiPredictiveForecasts.tenantId, session.tenantId), isNull(abiPredictiveForecasts.deletedAt), eq(abiPredictiveForecasts.status, "active")))
        .then((r) => r.length),
      db.select({ id: abiMarketIntelligenceReports.id }).from(abiMarketIntelligenceReports)
        .where(and(eq(abiMarketIntelligenceReports.tenantId, session.tenantId), isNull(abiMarketIntelligenceReports.deletedAt), eq(abiMarketIntelligenceReports.status, "draft")))
        .then((r) => r.length),
      db.select({ id: abiOperationalEfficiencies.id }).from(abiOperationalEfficiencies)
        .where(and(eq(abiOperationalEfficiencies.tenantId, session.tenantId), isNull(abiOperationalEfficiencies.deletedAt), eq(abiOperationalEfficiencies.status, "draft")))
        .then((r) => r.length),
      db.select({ id: abiBiReports.id }).from(abiBiReports)
        .where(and(eq(abiBiReports.tenantId, session.tenantId), isNull(abiBiReports.deletedAt), eq(abiBiReports.status, "scheduled")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(abiExecutiveKpiDashboards.tenantId, session.tenantId),
    isNull(abiExecutiveKpiDashboards.deletedAt),
  ];
  if (status) conditions.push(eq(abiExecutiveKpiDashboards.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(abiExecutiveKpiDashboards.dashboardRef, `%${search}%`),
        ilike(abiExecutiveKpiDashboards.dashboardType, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(abiExecutiveKpiDashboards.createdAt, new Date(cursor)));

  const data = await db.select().from(abiExecutiveKpiDashboards)
    .where(and(...conditions))
    .orderBy(desc(abiExecutiveKpiDashboards.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/analytics-business-intelligence?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Business Intelligence</h1>
          <p className="text-sm text-gray-500">KPI dashboards, voyage analytics, trade lanes, customer revenue, predictions, market intel, efficiency, and BI reports</p>
        </div>
        {canCreate && (
          <Link href="/analytics-business-intelligence/executive-kpi-dashboards/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New KPI Dashboard
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Gauge className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">KPI Dashboards</p><p className="text-2xl font-bold text-gray-900">{publishedKpi}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Ship className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Voyage Analytics</p><p className="text-2xl font-bold text-gray-900">{draftVoyage}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Route className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Trade Lanes</p><p className="text-2xl font-bold text-gray-900">{draftTradeLane}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Users className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Customer Revenue</p><p className="text-2xl font-bold text-gray-900">{draftCustomer}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><Brain className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Predictions</p><p className="text-2xl font-bold text-gray-900">{activePredictions}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Globe className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Market Intel</p><p className="text-2xl font-bold text-gray-900">{draftMarket}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Activity className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Efficiency</p><p className="text-2xl font-bold text-gray-900">{draftEfficiency}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><FileBarChart className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">BI Reports</p><p className="text-2xl font-bold text-gray-900">{scheduledReports}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Dashboard ref, type..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/analytics-business-intelligence" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No executive KPI dashboards found.</p>
          {canCreate && (
            <Link href="/analytics-business-intelligence/executive-kpi-dashboards/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first KPI dashboard</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Period Start</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Revenue</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">TEU</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/analytics-business-intelligence/executive-kpi-dashboards/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.dashboardRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.dashboardType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.periodStart ? new Date(t.periodStart).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.totalRevenue ? `${t.totalRevenue} ${t.revenueCurrency}` : "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.totalTeu || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "published" ? "success" : t.status === "archived" ? "destructive" : "secondary"}>{t.status}</Badge>
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
