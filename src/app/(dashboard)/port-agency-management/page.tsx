import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Ship,
  Wrench,
  ClipboardCheck,
  MessageSquare,
  Users,
  Banknote,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  pamPortCallPlans,
  pamHusbandryServices,
  pamPreArrivalChecklists,
  pamPortAuthorityCommunications,
  pamCrewChangeCoordinations,
  pamCashToMasters,
  pamVesselClearances,
  pamDisbursementAccounts,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function PortAgencyManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "port_agency:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [plannedPortCalls, pendingServices, pendingChecklists, activeCommunications, plannedCrewChanges, pendingCash, pendingClearances, draftDisbursements] =
    await Promise.all([
      db.select({ id: pamPortCallPlans.id }).from(pamPortCallPlans)
        .where(and(eq(pamPortCallPlans.tenantId, session.tenantId), isNull(pamPortCallPlans.deletedAt), eq(pamPortCallPlans.status, "planned")))
        .then((r) => r.length),
      db.select({ id: pamHusbandryServices.id }).from(pamHusbandryServices)
        .where(and(eq(pamHusbandryServices.tenantId, session.tenantId), isNull(pamHusbandryServices.deletedAt), eq(pamHusbandryServices.status, "requested")))
        .then((r) => r.length),
      db.select({ id: pamPreArrivalChecklists.id }).from(pamPreArrivalChecklists)
        .where(and(eq(pamPreArrivalChecklists.tenantId, session.tenantId), isNull(pamPreArrivalChecklists.deletedAt), eq(pamPreArrivalChecklists.status, "pending")))
        .then((r) => r.length),
      db.select({ id: pamPortAuthorityCommunications.id }).from(pamPortAuthorityCommunications)
        .where(and(eq(pamPortAuthorityCommunications.tenantId, session.tenantId), isNull(pamPortAuthorityCommunications.deletedAt), eq(pamPortAuthorityCommunications.status, "sent")))
        .then((r) => r.length),
      db.select({ id: pamCrewChangeCoordinations.id }).from(pamCrewChangeCoordinations)
        .where(and(eq(pamCrewChangeCoordinations.tenantId, session.tenantId), isNull(pamCrewChangeCoordinations.deletedAt), eq(pamCrewChangeCoordinations.status, "planned")))
        .then((r) => r.length),
      db.select({ id: pamCashToMasters.id }).from(pamCashToMasters)
        .where(and(eq(pamCashToMasters.tenantId, session.tenantId), isNull(pamCashToMasters.deletedAt), eq(pamCashToMasters.status, "requested")))
        .then((r) => r.length),
      db.select({ id: pamVesselClearances.id }).from(pamVesselClearances)
        .where(and(eq(pamVesselClearances.tenantId, session.tenantId), isNull(pamVesselClearances.deletedAt), eq(pamVesselClearances.status, "pending")))
        .then((r) => r.length),
      db.select({ id: pamDisbursementAccounts.id }).from(pamDisbursementAccounts)
        .where(and(eq(pamDisbursementAccounts.tenantId, session.tenantId), isNull(pamDisbursementAccounts.deletedAt), eq(pamDisbursementAccounts.status, "draft")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(pamPortCallPlans.tenantId, session.tenantId),
    isNull(pamPortCallPlans.deletedAt),
  ];
  if (status) conditions.push(eq(pamPortCallPlans.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(pamPortCallPlans.planRef, `%${search}%`),
        ilike(pamPortCallPlans.vesselName, `%${search}%`),
        ilike(pamPortCallPlans.portName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(pamPortCallPlans.createdAt, new Date(cursor)));

  const data = await db.select().from(pamPortCallPlans)
    .where(and(...conditions))
    .orderBy(desc(pamPortCallPlans.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/port-agency-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Port Agency Management</h1>
          <p className="text-sm text-gray-500">Port calls, husbandry, checklists, communications, crew changes, cash, clearances, and disbursements</p>
        </div>
        {canCreate && (
          <Link href="/port-agency-management/port-call-plans/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Port Call
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Ship className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Planned Port Calls</p><p className="text-2xl font-bold text-gray-900">{plannedPortCalls}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Wrench className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Services</p><p className="text-2xl font-bold text-gray-900">{pendingServices}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><ClipboardCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Checklists</p><p className="text-2xl font-bold text-gray-900">{pendingChecklists}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><MessageSquare className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Comms</p><p className="text-2xl font-bold text-gray-900">{activeCommunications}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><Users className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Crew Changes</p><p className="text-2xl font-bold text-gray-900">{plannedCrewChanges}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Banknote className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Cash</p><p className="text-2xl font-bold text-gray-900">{pendingCash}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><ShieldCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Clearances</p><p className="text-2xl font-bold text-gray-900">{pendingClearances}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Receipt className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Disbursements</p><p className="text-2xl font-bold text-gray-900">{draftDisbursements}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Plan ref, vessel, port..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/port-agency-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No port call plans found.</p>
          {canCreate && (
            <Link href="/port-agency-management/port-call-plans/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first port call plan</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Port</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Terminal</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/port-agency-management/port-call-plans/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.planRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.planType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.portName}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{t.terminalName || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "completed" ? "success" : t.status === "cancelled" ? "destructive" : t.status === "in_progress" ? "default" : "secondary"}>{t.status}</Badge>
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
