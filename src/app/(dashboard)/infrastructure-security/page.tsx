import Link from "next/link";
import {
  Plus,
  Server,
  Rocket,
  Shield,
  FileText,
  Search,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  isfK8sClusters,
  isfDeploymentConfigs,
  isfIamPolicies,
  isfAuditEvents,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function InfrastructureSecurityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "infra:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [clusterCount, deploymentCount, policyCount, auditCount] =
    await Promise.all([
      db.select({ id: isfK8sClusters.id }).from(isfK8sClusters)
        .where(and(eq(isfK8sClusters.tenantId, session.tenantId), isNull(isfK8sClusters.deletedAt), eq(isfK8sClusters.status, "active")))
        .then((r) => r.length),
      db.select({ id: isfDeploymentConfigs.id }).from(isfDeploymentConfigs)
        .where(and(eq(isfDeploymentConfigs.tenantId, session.tenantId), isNull(isfDeploymentConfigs.deletedAt), eq(isfDeploymentConfigs.status, "running")))
        .then((r) => r.length),
      db.select({ id: isfIamPolicies.id }).from(isfIamPolicies)
        .where(and(eq(isfIamPolicies.tenantId, session.tenantId), isNull(isfIamPolicies.deletedAt), eq(isfIamPolicies.isActive, true)))
        .then((r) => r.length),
      db.select({ id: isfAuditEvents.id }).from(isfAuditEvents)
        .where(and(eq(isfAuditEvents.tenantId, session.tenantId), isNull(isfAuditEvents.deletedAt), eq(isfAuditEvents.severity, "critical")))
        .then((r) => r.length),
    ]);

  const conditions = [
    eq(isfK8sClusters.tenantId, session.tenantId),
    isNull(isfK8sClusters.deletedAt),
  ];
  if (status) conditions.push(eq(isfK8sClusters.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(isfK8sClusters.clusterName, `%${search}%`),
        ilike(isfK8sClusters.clusterCode, `%${search}%`),
        ilike(isfK8sClusters.provider, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(isfK8sClusters.createdAt, new Date(cursor)));

  const data = await db.select().from(isfK8sClusters)
    .where(and(...conditions))
    .orderBy(desc(isfK8sClusters.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/infrastructure-security?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure & Security</h1>
          <p className="text-sm text-gray-500">Cloud deployment, IAM, encryption, and compliance management</p>
        </div>
        {canCreate && (
          <Link href="/infrastructure-security/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Cluster
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><Server className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Clusters</p><p className="text-2xl font-bold text-gray-900">{clusterCount}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Rocket className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Running Deployments</p><p className="text-2xl font-bold text-gray-900">{deploymentCount}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><Shield className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Policies</p><p className="text-2xl font-bold text-gray-900">{policyCount}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><FileText className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Critical Events</p><p className="text-2xl font-bold text-gray-900">{auditCount}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Cluster name, code, or provider..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="provisioning">Provisioning</option>
            <option value="decommissioned">Decommissioned</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/infrastructure-security" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Server className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No clusters found.</p>
          {canCreate && (
            <Link href="/infrastructure-security/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Register your first cluster</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Cluster Name</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Code</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Provider</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Region</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Environment</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Nodes</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/infrastructure-security/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.clusterName}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.clusterCode}</td>
                  <td className="px-4 py-3 text-gray-600">{t.provider}</td>
                  <td className="px-4 py-3 text-gray-600">{t.region}</td>
                  <td className="px-4 py-3 text-gray-600">{t.environment}</td>
                  <td className="px-4 py-3 text-gray-600">{t.nodeCount ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "active" ? "success" : t.status === "decommissioned" ? "destructive" : "secondary"}>{t.status}</Badge>
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
