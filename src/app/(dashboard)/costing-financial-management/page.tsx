import Link from "next/link";
import {
  Plus,
  DollarSign,
  Search,
  Anchor,
  AlertTriangle,
  BarChart3,
  Brain,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  cfmVoyageBudgets,
  cfmPortDisbursements,
  cfmAgencyCommissions,
  cfmAnomalyDetections,
  cfmKpiReports,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function CostingFinancialManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "costing:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeBudgets, pendingDisbursements, draftCommissions, detectedAnomalies, draftReports] =
    await Promise.all([
      db.select({ id: cfmVoyageBudgets.id }).from(cfmVoyageBudgets)
        .where(and(eq(cfmVoyageBudgets.tenantId, session.tenantId), isNull(cfmVoyageBudgets.deletedAt), eq(cfmVoyageBudgets.status, "approved")))
        .then((r) => r.length),
      db.select({ id: cfmPortDisbursements.id }).from(cfmPortDisbursements)
        .where(and(eq(cfmPortDisbursements.tenantId, session.tenantId), isNull(cfmPortDisbursements.deletedAt), eq(cfmPortDisbursements.status, "submitted")))
        .then((r) => r.length),
      db.select({ id: cfmAgencyCommissions.id }).from(cfmAgencyCommissions)
        .where(and(eq(cfmAgencyCommissions.tenantId, session.tenantId), isNull(cfmAgencyCommissions.deletedAt), eq(cfmAgencyCommissions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: cfmAnomalyDetections.id }).from(cfmAnomalyDetections)
        .where(and(eq(cfmAnomalyDetections.tenantId, session.tenantId), isNull(cfmAnomalyDetections.deletedAt), eq(cfmAnomalyDetections.status, "detected")))
        .then((r) => r.length),
      db.select({ id: cfmKpiReports.id }).from(cfmKpiReports)
        .where(and(eq(cfmKpiReports.tenantId, session.tenantId), isNull(cfmKpiReports.deletedAt), eq(cfmKpiReports.status, "draft")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(cfmVoyageBudgets.tenantId, session.tenantId),
    isNull(cfmVoyageBudgets.deletedAt),
  ];
  if (status) conditions.push(eq(cfmVoyageBudgets.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(cfmVoyageBudgets.budgetRef, `%${search}%`),
        ilike(cfmVoyageBudgets.vesselName, `%${search}%`),
        ilike(cfmVoyageBudgets.voyageRef, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(cfmVoyageBudgets.createdAt, new Date(cursor)));

  const data = await db.select().from(cfmVoyageBudgets)
    .where(and(...conditions))
    .orderBy(desc(cfmVoyageBudgets.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/costing-financial-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Costing & Financial Management</h1>
          <p className="text-sm text-gray-500">Voyage costing, P&L, disbursements, commissions, and KPI reporting</p>
        </div>
        {canCreate && (
          <Link href="/costing-financial-management/voyage-budgets/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Budget
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><DollarSign className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Budgets</p><p className="text-2xl font-bold text-gray-900">{activeBudgets}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Anchor className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Disbursements</p><p className="text-2xl font-bold text-gray-900">{pendingDisbursements}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Commissions</p><p className="text-2xl font-bold text-gray-900">{draftCommissions}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Detected Anomalies</p><p className="text-2xl font-bold text-gray-900">{detectedAnomalies}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Brain className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Reports</p><p className="text-2xl font-bold text-gray-900">{draftReports}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Budget ref, vessel, or voyage..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/costing-financial-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <DollarSign className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No voyage budgets found.</p>
          {canCreate && (
            <Link href="/costing-financial-management/voyage-budgets/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first budget</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Budget Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Voyage</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Total Budget</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Variance</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/costing-financial-management/voyage-budgets/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.budgetRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.voyageRef}</td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName}</td>
                  <td className="px-4 py-3 text-gray-600">{t.budgetType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.totalBudget?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{t.variance != null ? t.variance.toLocaleString() : "--"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "approved" ? "success" : t.status === "rejected" ? "destructive" : "secondary"}>{t.status}</Badge>
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
