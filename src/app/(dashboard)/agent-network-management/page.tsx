import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  Handshake,
  Users,
  DollarSign,
  FileCheck,
  BarChart3,
  Globe,
  ShieldCheck,
  Gift,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  anmGaAgreements,
  anmSubAgentConfigs,
  anmAgentCommissions,
  anmAgencyDocuments,
  anmPerformanceKpis,
  anmPortalConfigs,
  anmBookingAuthorities,
  anmAgentIncentives,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function AgentNetworkManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "anm:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [draftGaAgreements, draftSubAgentConfigs, draftAgentCommissions, draftAgencyDocuments, draftPerformanceKpis, draftPortalConfigs, draftBookingAuthorities, draftAgentIncentives] =
    await Promise.all([
      db.select({ id: anmGaAgreements.id }).from(anmGaAgreements)
        .where(and(eq(anmGaAgreements.tenantId, session.tenantId), isNull(anmGaAgreements.deletedAt), eq(anmGaAgreements.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmSubAgentConfigs.id }).from(anmSubAgentConfigs)
        .where(and(eq(anmSubAgentConfigs.tenantId, session.tenantId), isNull(anmSubAgentConfigs.deletedAt), eq(anmSubAgentConfigs.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmAgentCommissions.id }).from(anmAgentCommissions)
        .where(and(eq(anmAgentCommissions.tenantId, session.tenantId), isNull(anmAgentCommissions.deletedAt), eq(anmAgentCommissions.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmAgencyDocuments.id }).from(anmAgencyDocuments)
        .where(and(eq(anmAgencyDocuments.tenantId, session.tenantId), isNull(anmAgencyDocuments.deletedAt), eq(anmAgencyDocuments.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmPerformanceKpis.id }).from(anmPerformanceKpis)
        .where(and(eq(anmPerformanceKpis.tenantId, session.tenantId), isNull(anmPerformanceKpis.deletedAt), eq(anmPerformanceKpis.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmPortalConfigs.id }).from(anmPortalConfigs)
        .where(and(eq(anmPortalConfigs.tenantId, session.tenantId), isNull(anmPortalConfigs.deletedAt), eq(anmPortalConfigs.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmBookingAuthorities.id }).from(anmBookingAuthorities)
        .where(and(eq(anmBookingAuthorities.tenantId, session.tenantId), isNull(anmBookingAuthorities.deletedAt), eq(anmBookingAuthorities.status, "draft")))
        .then((r) => r.length),
      db.select({ id: anmAgentIncentives.id }).from(anmAgentIncentives)
        .where(and(eq(anmAgentIncentives.tenantId, session.tenantId), isNull(anmAgentIncentives.deletedAt), eq(anmAgentIncentives.status, "draft")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(anmGaAgreements.tenantId, session.tenantId),
    isNull(anmGaAgreements.deletedAt),
  ];
  if (status) conditions.push(eq(anmGaAgreements.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(anmGaAgreements.agreementRef, `%${search}%`),
        ilike(anmGaAgreements.agentName, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(anmGaAgreements.createdAt, new Date(cursor)));

  const data = await db.select().from(anmGaAgreements)
    .where(and(...conditions))
    .orderBy(desc(anmGaAgreements.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/agent-network-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Network Management</h1>
          <p className="text-sm text-gray-500">GA agreements, sub-agents, commissions, documents, KPIs, portal configs, booking authorities, and incentives</p>
        </div>
        {canCreate && (
          <Link href="/agent-network-management/ga-agreements/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Agreement
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Handshake className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Agreements</p><p className="text-2xl font-bold text-gray-900">{draftGaAgreements}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Users className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Sub-Agents</p><p className="text-2xl font-bold text-gray-900">{draftSubAgentConfigs}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><DollarSign className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Commissions</p><p className="text-2xl font-bold text-gray-900">{draftAgentCommissions}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><FileCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Documents</p><p className="text-2xl font-bold text-gray-900">{draftAgencyDocuments}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft KPIs</p><p className="text-2xl font-bold text-gray-900">{draftPerformanceKpis}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Globe className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Portal Configs</p><p className="text-2xl font-bold text-gray-900">{draftPortalConfigs}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><ShieldCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Authorities</p><p className="text-2xl font-bold text-gray-900">{draftBookingAuthorities}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Gift className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Draft Incentives</p><p className="text-2xl font-bold text-gray-900">{draftAgentIncentives}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Agreement ref, agent..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/agent-network-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No GA agreements found.</p>
          {canCreate && (
            <Link href="/agent-network-management/ga-agreements/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first GA agreement</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Agent</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Territory</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Expiry</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/agent-network-management/ga-agreements/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.agreementRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.agentName || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.agreementType?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-gray-600">{t.territory || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-600">{t.expiryDate ? new Date(t.expiryDate).toLocaleDateString() : "\u2014"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "active" ? "success" : t.status === "expired" ? "destructive" : "secondary"}>{t.status}</Badge>
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
