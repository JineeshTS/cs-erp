import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Snowflake,
  Thermometer,
  ClipboardCheck,
  Plug,
  AlertTriangle,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  rcmReeferBookings,
  rcmTempMonitorings,
  rcmPtiInspections,
  rcmBreakdownResponses,
  rcmTempAlerts,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ReeferContainerManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "reefer:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [pendingBookings, activeMonitorings, scheduledInspections, openBreakdowns, activeAlerts] =
    await Promise.all([
      db.select({ id: rcmReeferBookings.id }).from(rcmReeferBookings)
        .where(and(eq(rcmReeferBookings.tenantId, session.tenantId), isNull(rcmReeferBookings.deletedAt), eq(rcmReeferBookings.status, "pending")))
        .then((r) => r.length),
      db.select({ id: rcmTempMonitorings.id }).from(rcmTempMonitorings)
        .where(and(eq(rcmTempMonitorings.tenantId, session.tenantId), isNull(rcmTempMonitorings.deletedAt), eq(rcmTempMonitorings.status, "active")))
        .then((r) => r.length),
      db.select({ id: rcmPtiInspections.id }).from(rcmPtiInspections)
        .where(and(eq(rcmPtiInspections.tenantId, session.tenantId), isNull(rcmPtiInspections.deletedAt), eq(rcmPtiInspections.status, "scheduled")))
        .then((r) => r.length),
      db.select({ id: rcmBreakdownResponses.id }).from(rcmBreakdownResponses)
        .where(and(eq(rcmBreakdownResponses.tenantId, session.tenantId), isNull(rcmBreakdownResponses.deletedAt), eq(rcmBreakdownResponses.status, "reported")))
        .then((r) => r.length),
      db.select({ id: rcmTempAlerts.id }).from(rcmTempAlerts)
        .where(and(eq(rcmTempAlerts.tenantId, session.tenantId), isNull(rcmTempAlerts.deletedAt), eq(rcmTempAlerts.status, "active")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(rcmReeferBookings.tenantId, session.tenantId),
    isNull(rcmReeferBookings.deletedAt),
  ];
  if (status) conditions.push(eq(rcmReeferBookings.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(rcmReeferBookings.bookingRef, `%${search}%`),
        ilike(rcmReeferBookings.customerName, `%${search}%`),
        ilike(rcmReeferBookings.containerNumber, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(rcmReeferBookings.createdAt, new Date(cursor)));

  const data = await db.select().from(rcmReeferBookings)
    .where(and(...conditions))
    .orderBy(desc(rcmReeferBookings.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/reefer-container-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reefer Container Management</h1>
          <p className="text-sm text-gray-500">Bookings, temperature monitoring, PTI inspections, power management, cold chain docs, breakdowns, alerts, and claim analytics</p>
        </div>
        {canCreate && (
          <Link href="/reefer-container-management/reefer-bookings/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Booking
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Snowflake className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Bookings</p><p className="text-2xl font-bold text-gray-900">{pendingBookings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Thermometer className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Monitors</p><p className="text-2xl font-bold text-gray-900">{activeMonitorings}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><ClipboardCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Scheduled PTIs</p><p className="text-2xl font-bold text-gray-900">{scheduledInspections}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Open Breakdowns</p><p className="text-2xl font-bold text-gray-900">{openBreakdowns}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Plug className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Alerts</p><p className="text-2xl font-bold text-gray-900">{activeAlerts}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Ref, customer, container..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_transit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/reefer-container-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No reefer bookings found.</p>
          {canCreate && (
            <Link href="/reefer-container-management/reefer-bookings/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first reefer booking</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Container</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Commodity</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Temp (°C)</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/reefer-container-management/reefer-bookings/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.bookingRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.containerNumber || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.commodityName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.requiredTempC}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "accepted" ? "success" : t.status === "cancelled" ? "destructive" : t.status === "completed" ? "success" : "secondary"}>{t.status}</Badge>
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
