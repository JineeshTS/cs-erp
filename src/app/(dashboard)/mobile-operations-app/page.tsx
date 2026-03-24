import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  DoorOpen,
  ClipboardCheck,
  Container,
  RefreshCcw,
  Camera,
  Truck,
  LayoutDashboard,
  Bell,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  mobGateProcessings,
  mobYardInspections,
  mobContainerSurveys,
  mobOfflineSyncs,
  mobDamageAssessments,
  mobDriverDeliveries,
  mobExecutiveDashboards,
  mobPushNotifications,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function MobileOperationsAppPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mob:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "mob:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftGateProcessings, draftYardInspections, draftContainerSurveys, draftOfflineSyncs, draftDamageAssessments, draftDriverDeliveries, draftExecutiveDashboards, draftPushNotifications] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(mobGateProcessings)
        .where(and(eq(mobGateProcessings.tenantId, session.tenantId), isNull(mobGateProcessings.deletedAt), eq(mobGateProcessings.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(mobYardInspections)
        .where(and(eq(mobYardInspections.tenantId, session.tenantId), isNull(mobYardInspections.deletedAt), eq(mobYardInspections.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(mobContainerSurveys)
        .where(and(eq(mobContainerSurveys.tenantId, session.tenantId), isNull(mobContainerSurveys.deletedAt), eq(mobContainerSurveys.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(mobOfflineSyncs)
        .where(and(eq(mobOfflineSyncs.tenantId, session.tenantId), isNull(mobOfflineSyncs.deletedAt), eq(mobOfflineSyncs.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(mobDamageAssessments)
        .where(and(eq(mobDamageAssessments.tenantId, session.tenantId), isNull(mobDamageAssessments.deletedAt), eq(mobDamageAssessments.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(mobDriverDeliveries)
        .where(and(eq(mobDriverDeliveries.tenantId, session.tenantId), isNull(mobDriverDeliveries.deletedAt), eq(mobDriverDeliveries.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(mobExecutiveDashboards)
        .where(and(eq(mobExecutiveDashboards.tenantId, session.tenantId), isNull(mobExecutiveDashboards.deletedAt), eq(mobExecutiveDashboards.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(mobPushNotifications)
        .where(and(eq(mobPushNotifications.tenantId, session.tenantId), isNull(mobPushNotifications.deletedAt), eq(mobPushNotifications.status, "draft")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(mobGateProcessings.tenantId, session.tenantId),
    isNull(mobGateProcessings.deletedAt),
  ];
  if (status) conditions.push(eq(mobGateProcessings.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(mobGateProcessings.gateRef, `%${escapeIlike(search)}%`),
        ilike(mobGateProcessings.containerNumber, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(mobGateProcessings.createdAt, mobGateProcessings.id, parsedCursor));

  const data = await db.select().from(mobGateProcessings)
    .where(and(...conditions))
    .orderBy(desc(mobGateProcessings.createdAt), desc(mobGateProcessings.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/mobile-operations-app?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile Operations App</h1>
          <p className="text-sm text-gray-500">Gate processing, yard inspections, container surveys, offline sync, damage assessment, driver deliveries, dashboards, notifications</p>
        </div>
        {canCreate && (
          <Link href="/mobile-operations-app/gate-processings/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Gate Processing
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><DoorOpen className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Gate Proc.</p><p className="text-2xl font-bold text-gray-900">{draftGateProcessings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><ClipboardCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Yard Insp.</p><p className="text-2xl font-bold text-gray-900">{draftYardInspections}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Container className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Surveys</p><p className="text-2xl font-bold text-gray-900">{draftContainerSurveys}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><RefreshCcw className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Syncs</p><p className="text-2xl font-bold text-gray-900">{draftOfflineSyncs}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><Camera className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Damage Asst.</p><p className="text-2xl font-bold text-gray-900">{draftDamageAssessments}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Truck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Deliveries</p><p className="text-2xl font-bold text-gray-900">{draftDriverDeliveries}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><LayoutDashboard className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Dashboards</p><p className="text-2xl font-bold text-gray-900">{draftExecutiveDashboards}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Bell className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Notifications</p><p className="text-2xl font-bold text-gray-900">{draftPushNotifications}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Gate ref, container..."
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
          <Link href="/mobile-operations-app" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No gate processings found.</p>
          {canCreate && (
            <Link href="/mobile-operations-app/gate-processings/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first gate processing</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Container</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Truck</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Driver</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/mobile-operations-app/gate-processings/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.gateRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.containerNumber || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.gateType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{t.truckPlate || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.driverName || "\u2014"}</td>
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
