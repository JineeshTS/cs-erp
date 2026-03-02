import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Wrench,
  Anchor,
  Shield,
  AlertTriangle,
  Package,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  vtmPlannedMaintenanceTasks,
  vtmDryDockPlans,
  vtmSurveyTrackings,
  vtmDefectRepairs,
  vtmSpareParts,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function VesselTechnicalManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "technical:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [overdueTasks, activeDryDocks, upcomingSurveys, openDefects, lowStockParts] =
    await Promise.all([
      db.select({ id: vtmPlannedMaintenanceTasks.id }).from(vtmPlannedMaintenanceTasks)
        .where(and(eq(vtmPlannedMaintenanceTasks.tenantId, session.tenantId), isNull(vtmPlannedMaintenanceTasks.deletedAt), eq(vtmPlannedMaintenanceTasks.status, "overdue")))
        .then((r) => r.length),
      db.select({ id: vtmDryDockPlans.id }).from(vtmDryDockPlans)
        .where(and(eq(vtmDryDockPlans.tenantId, session.tenantId), isNull(vtmDryDockPlans.deletedAt), eq(vtmDryDockPlans.status, "in_progress")))
        .then((r) => r.length),
      db.select({ id: vtmSurveyTrackings.id }).from(vtmSurveyTrackings)
        .where(and(eq(vtmSurveyTrackings.tenantId, session.tenantId), isNull(vtmSurveyTrackings.deletedAt), eq(vtmSurveyTrackings.status, "upcoming")))
        .then((r) => r.length),
      db.select({ id: vtmDefectRepairs.id }).from(vtmDefectRepairs)
        .where(and(eq(vtmDefectRepairs.tenantId, session.tenantId), isNull(vtmDefectRepairs.deletedAt), eq(vtmDefectRepairs.status, "reported")))
        .then((r) => r.length),
      db.select({ id: vtmSpareParts.id }).from(vtmSpareParts)
        .where(and(eq(vtmSpareParts.tenantId, session.tenantId), isNull(vtmSpareParts.deletedAt), eq(vtmSpareParts.status, "low_stock")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(vtmPlannedMaintenanceTasks.tenantId, session.tenantId),
    isNull(vtmPlannedMaintenanceTasks.deletedAt),
  ];
  if (status) conditions.push(eq(vtmPlannedMaintenanceTasks.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(vtmPlannedMaintenanceTasks.taskRef, `%${search}%`),
        ilike(vtmPlannedMaintenanceTasks.vesselName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(vtmPlannedMaintenanceTasks.createdAt, new Date(cursor)));

  const data = await db.select().from(vtmPlannedMaintenanceTasks)
    .where(and(...conditions))
    .orderBy(desc(vtmPlannedMaintenanceTasks.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/vessel-technical-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vessel Technical Management</h1>
          <p className="text-sm text-gray-500">PMS, dry docks, surveys, defects, spare parts, procurement, compliance, and AI maintenance</p>
        </div>
        {canCreate && (
          <Link href="/vessel-technical-management/planned-maintenance-tasks/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Maintenance Task
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Wrench className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Overdue Tasks</p><p className="text-2xl font-bold text-gray-900">{overdueTasks}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Anchor className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Dry Docks</p><p className="text-2xl font-bold text-gray-900">{activeDryDocks}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Shield className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Upcoming Surveys</p><p className="text-2xl font-bold text-gray-900">{upcomingSurveys}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Open Defects</p><p className="text-2xl font-bold text-gray-900">{openDefects}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Package className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Low Stock Parts</p><p className="text-2xl font-bold text-gray-900">{lowStockParts}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Task ref, vessel name..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="overdue">Overdue</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="deferred">Deferred</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/vessel-technical-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No planned maintenance tasks found.</p>
          {canCreate && (
            <Link href="/vessel-technical-management/planned-maintenance-tasks/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first maintenance task</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Equipment</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Priority</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/vessel-technical-management/planned-maintenance-tasks/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.taskRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.equipmentName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.maintenanceType}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.priority === "critical" ? "destructive" : t.priority === "high" ? "destructive" : "secondary"}>{t.priority}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "completed" ? "success" : t.status === "overdue" ? "destructive" : "secondary"}>{t.status}</Badge>
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
