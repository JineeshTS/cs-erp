import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Gauge,
  Activity,
  Shield,
  ScrollText,
  TrendingUp,
  Navigation,
  Leaf,
  Fuel,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  vpeSpeedConsumptions,
  vpeCiiRatings,
  vpeEexiCompliances,
  vpeNoonReports,
  vpeVoyagePerformances,
  vpeWeatherRoutings,
  vpeCarbonEmissions,
  vpeFuelBenchmarks,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function VesselPerformanceEfficiencyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "vpe:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftSpeedConsumptions, draftCiiRatings, draftEexiCompliances, draftNoonReports, draftVoyagePerformances, draftWeatherRoutings, draftCarbonEmissions, draftFuelBenchmarks] =
    await Promise.all([
      db.select({ id: vpeSpeedConsumptions.id }).from(vpeSpeedConsumptions)
        .where(and(eq(vpeSpeedConsumptions.tenantId, session.tenantId), isNull(vpeSpeedConsumptions.deletedAt), eq(vpeSpeedConsumptions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeCiiRatings.id }).from(vpeCiiRatings)
        .where(and(eq(vpeCiiRatings.tenantId, session.tenantId), isNull(vpeCiiRatings.deletedAt), eq(vpeCiiRatings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeEexiCompliances.id }).from(vpeEexiCompliances)
        .where(and(eq(vpeEexiCompliances.tenantId, session.tenantId), isNull(vpeEexiCompliances.deletedAt), eq(vpeEexiCompliances.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeNoonReports.id }).from(vpeNoonReports)
        .where(and(eq(vpeNoonReports.tenantId, session.tenantId), isNull(vpeNoonReports.deletedAt), eq(vpeNoonReports.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeVoyagePerformances.id }).from(vpeVoyagePerformances)
        .where(and(eq(vpeVoyagePerformances.tenantId, session.tenantId), isNull(vpeVoyagePerformances.deletedAt), eq(vpeVoyagePerformances.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeWeatherRoutings.id }).from(vpeWeatherRoutings)
        .where(and(eq(vpeWeatherRoutings.tenantId, session.tenantId), isNull(vpeWeatherRoutings.deletedAt), eq(vpeWeatherRoutings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeCarbonEmissions.id }).from(vpeCarbonEmissions)
        .where(and(eq(vpeCarbonEmissions.tenantId, session.tenantId), isNull(vpeCarbonEmissions.deletedAt), eq(vpeCarbonEmissions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: vpeFuelBenchmarks.id }).from(vpeFuelBenchmarks)
        .where(and(eq(vpeFuelBenchmarks.tenantId, session.tenantId), isNull(vpeFuelBenchmarks.deletedAt), eq(vpeFuelBenchmarks.status, "draft")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(vpeSpeedConsumptions.tenantId, session.tenantId),
    isNull(vpeSpeedConsumptions.deletedAt),
  ];
  if (status) conditions.push(eq(vpeSpeedConsumptions.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(vpeSpeedConsumptions.consumptionRef, `%${search}%`),
        ilike(vpeSpeedConsumptions.vesselName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(vpeSpeedConsumptions.createdAt, new Date(cursor)));

  const data = await db.select().from(vpeSpeedConsumptions)
    .where(and(...conditions))
    .orderBy(desc(vpeSpeedConsumptions.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/vessel-performance-efficiency?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vessel Performance & Efficiency</h1>
          <p className="text-sm text-gray-500">Speed consumption, CII ratings, EEXI compliance, noon reports, voyage performance, weather routing, carbon emissions, and fuel benchmarking</p>
        </div>
        {canCreate && (
          <Link href="/vessel-performance-efficiency/speed-consumptions/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Speed Report
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Gauge className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Speed Reports</p><p className="text-2xl font-bold text-gray-900">{draftSpeedConsumptions}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Activity className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft CII Ratings</p><p className="text-2xl font-bold text-gray-900">{draftCiiRatings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Shield className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft EEXI Compliances</p><p className="text-2xl font-bold text-gray-900">{draftEexiCompliances}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><ScrollText className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Noon Reports</p><p className="text-2xl font-bold text-gray-900">{draftNoonReports}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Voyage Perf.</p><p className="text-2xl font-bold text-gray-900">{draftVoyagePerformances}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Navigation className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Weather Routes</p><p className="text-2xl font-bold text-gray-900">{draftWeatherRoutings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Leaf className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Carbon Emissions</p><p className="text-2xl font-bold text-gray-900">{draftCarbonEmissions}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Fuel className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Fuel Benchmarks</p><p className="text-2xl font-bold text-gray-900">{draftFuelBenchmarks}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Consumption ref, vessel..."
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
          <Link href="/vessel-performance-efficiency" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No speed consumption reports found.</p>
          {canCreate && (
            <Link href="/vessel-performance-efficiency/speed-consumptions/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first speed report</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Speed (Actual)</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Fuel (MT)</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/vessel-performance-efficiency/speed-consumptions/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.consumptionRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.consumptionType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.speedActual ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.fuelConsumedMt ?? "-"}</td>
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
