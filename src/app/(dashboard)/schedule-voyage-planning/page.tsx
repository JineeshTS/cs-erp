import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  CalendarRange,
  Anchor,
  Navigation,
  Clock,
  Brain,
  Gauge,
  Cloud,
  Ship,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  svpServiceSchedules,
  svpPortSequences,
  svpCanalTransits,
  svpEtaManagements,
  svpVoyageOptimizations,
  svpSpeedFuelAnalyses,
  svpWeatherRoutings,
  svpDeploymentPlans,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ScheduleVoyagePlanningPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "svp:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "svp:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftServiceSchedules, draftPortSequences, draftCanalTransits, draftEtaManagements, draftVoyageOptimizations, draftSpeedFuelAnalyses, draftWeatherRoutings, draftDeploymentPlans] =
    await Promise.all([
      db.select({ id: svpServiceSchedules.id }).from(svpServiceSchedules)
        .where(and(eq(svpServiceSchedules.tenantId, session.tenantId), isNull(svpServiceSchedules.deletedAt), eq(svpServiceSchedules.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpPortSequences.id }).from(svpPortSequences)
        .where(and(eq(svpPortSequences.tenantId, session.tenantId), isNull(svpPortSequences.deletedAt), eq(svpPortSequences.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpCanalTransits.id }).from(svpCanalTransits)
        .where(and(eq(svpCanalTransits.tenantId, session.tenantId), isNull(svpCanalTransits.deletedAt), eq(svpCanalTransits.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpEtaManagements.id }).from(svpEtaManagements)
        .where(and(eq(svpEtaManagements.tenantId, session.tenantId), isNull(svpEtaManagements.deletedAt), eq(svpEtaManagements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpVoyageOptimizations.id }).from(svpVoyageOptimizations)
        .where(and(eq(svpVoyageOptimizations.tenantId, session.tenantId), isNull(svpVoyageOptimizations.deletedAt), eq(svpVoyageOptimizations.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpSpeedFuelAnalyses.id }).from(svpSpeedFuelAnalyses)
        .where(and(eq(svpSpeedFuelAnalyses.tenantId, session.tenantId), isNull(svpSpeedFuelAnalyses.deletedAt), eq(svpSpeedFuelAnalyses.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpWeatherRoutings.id }).from(svpWeatherRoutings)
        .where(and(eq(svpWeatherRoutings.tenantId, session.tenantId), isNull(svpWeatherRoutings.deletedAt), eq(svpWeatherRoutings.status, "draft")))
        .then((r) => r.length),
      db.select({ id: svpDeploymentPlans.id }).from(svpDeploymentPlans)
        .where(and(eq(svpDeploymentPlans.tenantId, session.tenantId), isNull(svpDeploymentPlans.deletedAt), eq(svpDeploymentPlans.status, "draft")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(svpServiceSchedules.tenantId, session.tenantId),
    isNull(svpServiceSchedules.deletedAt),
  ];
  if (status) conditions.push(eq(svpServiceSchedules.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(svpServiceSchedules.scheduleRef, `%${search}%`),
        ilike(svpServiceSchedules.serviceName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(svpServiceSchedules.createdAt, new Date(cursor)));

  const data = await db.select().from(svpServiceSchedules)
    .where(and(...conditions))
    .orderBy(desc(svpServiceSchedules.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/schedule-voyage-planning?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule & Voyage Planning</h1>
          <p className="text-sm text-gray-500">Service schedules, port sequences, canal transits, ETA management, voyage optimization, speed/fuel, weather routing, deployment</p>
        </div>
        {canCreate && (
          <Link href="/schedule-voyage-planning/service-schedules/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Schedule
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><CalendarRange className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Schedules</p><p className="text-2xl font-bold text-gray-900">{draftServiceSchedules}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Anchor className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Port Seq.</p><p className="text-2xl font-bold text-gray-900">{draftPortSequences}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Navigation className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Transits</p><p className="text-2xl font-bold text-gray-900">{draftCanalTransits}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Clock className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft ETA Mgmt</p><p className="text-2xl font-bold text-gray-900">{draftEtaManagements}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><Brain className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Voyage Opt.</p><p className="text-2xl font-bold text-gray-900">{draftVoyageOptimizations}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Gauge className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Speed/Fuel</p><p className="text-2xl font-bold text-gray-900">{draftSpeedFuelAnalyses}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Cloud className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Weather Rt.</p><p className="text-2xl font-bold text-gray-900">{draftWeatherRoutings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Ship className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Deployment</p><p className="text-2xl font-bold text-gray-900">{draftDeploymentPlans}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Schedule ref, service name..."
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
          <Link href="/schedule-voyage-planning" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No service schedules found.</p>
          {canCreate && (
            <Link href="/schedule-voyage-planning/service-schedules/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first service schedule</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Service</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Trade Route</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Transit Days</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/schedule-voyage-planning/service-schedules/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.scheduleRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.serviceName || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.scheduleType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{t.tradeRoute || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.transitTimeDays ?? "\u2014"}</td>
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
