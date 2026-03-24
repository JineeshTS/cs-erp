import Link from "next/link";
import {
  Plus, FileText, Search, Navigation, BarChart3, Globe,
  Brain, DollarSign, ArrowRightLeft, FileCheck, TrendingUp,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  fdpDeploymentDecisions, fdpFleetUtilizations, fdpNetworkDesigns, fdpDeploymentOptimizers,
  fdpFleetFinancials, fdpVesselSwaps, fdpDeploymentContracts, fdpMarketIntelligence,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function FleetDeploymentPlanningPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "fdp:read"))) redirect("/");
  const canCreate = await hasPermission(session.id, session.tenantId, "fdp:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [d1, d2, d3, d4, d5, d6, d7, d8] = await Promise.all([
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(fdpDeploymentDecisions).where(and(eq(fdpDeploymentDecisions.tenantId, session.tenantId), isNull(fdpDeploymentDecisions.deletedAt), eq(fdpDeploymentDecisions.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(fdpFleetUtilizations).where(and(eq(fdpFleetUtilizations.tenantId, session.tenantId), isNull(fdpFleetUtilizations.deletedAt), eq(fdpFleetUtilizations.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(fdpNetworkDesigns).where(and(eq(fdpNetworkDesigns.tenantId, session.tenantId), isNull(fdpNetworkDesigns.deletedAt), eq(fdpNetworkDesigns.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(fdpDeploymentOptimizers).where(and(eq(fdpDeploymentOptimizers.tenantId, session.tenantId), isNull(fdpDeploymentOptimizers.deletedAt), eq(fdpDeploymentOptimizers.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(fdpFleetFinancials).where(and(eq(fdpFleetFinancials.tenantId, session.tenantId), isNull(fdpFleetFinancials.deletedAt), eq(fdpFleetFinancials.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(fdpVesselSwaps).where(and(eq(fdpVesselSwaps.tenantId, session.tenantId), isNull(fdpVesselSwaps.deletedAt), eq(fdpVesselSwaps.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(fdpDeploymentContracts).where(and(eq(fdpDeploymentContracts.tenantId, session.tenantId), isNull(fdpDeploymentContracts.deletedAt), eq(fdpDeploymentContracts.status, "draft"))).then((r) => r[0]?.value ?? 0),
    db.select({ value: sql<number>`cast(count(*) as int)` }).from(fdpMarketIntelligence).where(and(eq(fdpMarketIntelligence.tenantId, session.tenantId), isNull(fdpMarketIntelligence.deletedAt), eq(fdpMarketIntelligence.status, "draft"))).then((r) => r[0]?.value ?? 0),
  ]);

  const conditions = [eq(fdpDeploymentDecisions.tenantId, session.tenantId), isNull(fdpDeploymentDecisions.deletedAt)];
  if (status) conditions.push(eq(fdpDeploymentDecisions.status, status));
  if (search) conditions.push(or(ilike(fdpDeploymentDecisions.decisionRef, `%${escapeIlike(search)}%`), ilike(fdpDeploymentDecisions.title, `%${escapeIlike(search)}%`))!);
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(fdpDeploymentDecisions.createdAt, fdpDeploymentDecisions.id, parsedCursor));

  const data = await db.select().from(fdpDeploymentDecisions).where(and(...conditions)).orderBy(desc(fdpDeploymentDecisions.createdAt), desc(fdpDeploymentDecisions.id)).limit(limit + 1);
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Deployment Planning</h1>
          <p className="text-sm text-gray-500">Deployment decisions, utilization, network design, optimization, financials, swaps, contracts, market intelligence</p>
        </div>
        {canCreate && (
          <Link href="/fleet-deployment-planning/deployment-decisions/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Decision
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Draft Decisions", count: d1, icon: Navigation, color: "blue" },
          { label: "Draft Utilizations", count: d2, icon: BarChart3, color: "green" },
          { label: "Draft Networks", count: d3, icon: Globe, color: "orange" },
          { label: "Draft Optimizers", count: d4, icon: Brain, color: "purple" },
          { label: "Draft Financials", count: d5, icon: DollarSign, color: "indigo" },
          { label: "Draft Swaps", count: d6, icon: ArrowRightLeft, color: "teal" },
          { label: "Draft Contracts", count: d7, icon: FileCheck, color: "yellow" },
          { label: "Draft Intelligence", count: d8, icon: TrendingUp, color: "red" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border bg-white p-5">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${({ blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600", orange: "bg-orange-50 text-orange-600", red: "bg-red-50 text-red-600", purple: "bg-purple-50 text-purple-600", indigo: "bg-indigo-50 text-indigo-600", teal: "bg-teal-50 text-teal-600", yellow: "bg-yellow-50 text-yellow-600" } as Record<string, string>)[c.color] ?? ""}`}><c.icon className="h-5 w-5" /></div>
              <div><p className="text-sm text-gray-500">{c.label}</p><p className="text-2xl font-bold text-gray-900">{c.count}</p></div>
            </div>
          </div>
        ))}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Decision ref, title..." className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status} className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option><option value="draft">Draft</option><option value="verified">Verified</option><option value="published">Published</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && <Link href="/fleet-deployment-planning" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No deployment decisions found.</p>
          {canCreate && <Link href="/fleet-deployment-planning/deployment-decisions/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first deployment decision</Link>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Vessel</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Expected TCE</th>
              <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
            </tr></thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3"><Link href={`/fleet-deployment-planning/deployment-decisions/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.decisionRef}</Link></td>
                  <td className="px-4 py-3 text-gray-600">{t.title || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.decisionType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{t.vesselName || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.expectedTce ? `$${t.expectedTce}` : "\u2014"}</td>
                  <td className="px-4 py-3"><Badge variant={t.status === "verified" ? "success" : t.status === "published" ? "default" : "secondary"}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link href={`/fleet-deployment-planning?cursor=${nextCursor}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`} className="text-sm text-blue-600 hover:underline">Load more</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
