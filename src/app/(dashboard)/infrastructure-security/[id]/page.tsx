import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  isfK8sClusters,
  isfK8sNamespaces,
  isfDeploymentConfigs,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "namespaces", label: "Namespaces" },
  { key: "deployments", label: "Deployments" },
  { key: "health", label: "Health" },
  { key: "cost", label: "Cost" },
] as const;

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function ClusterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:read")))
    redirect("/infrastructure-security");

  const { id } = await params;
  const sp = await searchParams;
  const activeTab = sp.tab ?? "overview";

  const record = await db.select().from(isfK8sClusters)
    .where(and(eq(isfK8sClusters.id, id), eq(isfK8sClusters.tenantId, session.tenantId), isNull(isfK8sClusters.deletedAt)))
    .limit(1).then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "infra:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "infra:delete");

  const [namespaces, deployments] = await Promise.all([
    db.select().from(isfK8sNamespaces).where(and(eq(isfK8sNamespaces.tenantId, session.tenantId), eq(isfK8sNamespaces.clusterId, id), isNull(isfK8sNamespaces.deletedAt))).orderBy(desc(isfK8sNamespaces.createdAt)).limit(50),
    db.select().from(isfDeploymentConfigs).where(and(eq(isfDeploymentConfigs.tenantId, session.tenantId), eq(isfDeploymentConfigs.clusterId, id), isNull(isfDeploymentConfigs.deletedAt))).orderBy(desc(isfDeploymentConfigs.createdAt)).limit(50),
  ]);

  const tabData: Record<string, { headers: string[]; rows: string[][] }> = {
    namespaces: {
      headers: ["Name", "Environment", "Status", "Created"],
      rows: namespaces.map((n) => [n.namespaceName, n.environment, n.status, fmtDate(n.createdAt)]),
    },
    deployments: {
      headers: ["Name", "Code", "Image", "Replicas", "Strategy", "Status", "Health"],
      rows: deployments.map((d) => [d.deploymentName, d.deploymentCode, `${d.imageName}:${d.imageTag}`, d.replicas.toString(), d.strategy, d.status, d.healthStatus]),
    },
    health: {
      headers: ["Deployment", "Status", "Health", "Replicas", "Last Deployed"],
      rows: deployments.map((d) => [d.deploymentName, d.status, d.healthStatus, d.replicas.toString(), fmtDate(d.lastDeployedAt)]),
    },
    cost: {
      headers: ["Metric", "Value"],
      rows: [
        ["Nodes", record.nodeCount?.toString() ?? "-"],
        ["CPU Capacity", record.cpuCapacity?.toString() ?? "-"],
        ["Memory (MB)", record.memoryCapacityMb?.toString() ?? "-"],
        ["Cost/Hour", record.costPerHour ? `$${(record.costPerHour / 100).toFixed(2)}` : "-"],
        ["Est. Monthly", record.costPerHour ? `$${((record.costPerHour * 720) / 100).toFixed(2)}` : "-"],
      ],
    },
  };

  const currentTab = tabData[activeTab];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/infrastructure-security" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.clusterName}</h1>
          <p className="text-sm text-gray-500">{record.clusterCode} &middot; {record.provider} &middot; {record.region}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/infrastructure-security/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <form action={`/api/v1/infrastructure-security/clusters/${id}`} method="POST">
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-gray-50 p-1">
        {TABS.map((tab) => (
          <Link key={tab.key} href={`/infrastructure-security/${id}?tab=${tab.key}`}
            className={cn("shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
            {tab.label}
          </Link>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="rounded-lg border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Cluster Name", value: record.clusterName },
              { label: "Cluster Code", value: record.clusterCode },
              { label: "Provider", value: record.provider },
              { label: "Region", value: record.region },
              { label: "Environment", value: record.environment },
              { label: "Version", value: record.version ?? "-" },
              { label: "Endpoint", value: record.endpoint ?? "-" },
              { label: "Nodes", value: record.nodeCount?.toString() ?? "-" },
              { label: "CPU Capacity", value: record.cpuCapacity?.toString() ?? "-" },
              { label: "Memory (MB)", value: record.memoryCapacityMb?.toString() ?? "-" },
              { label: "Created", value: fmtDate(record.createdAt) },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-xs font-medium text-gray-500">{field.label}</p>
                <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs font-medium text-gray-500">Status</p>
              <div className="mt-0.5">
                <Badge variant={record.status === "active" ? "success" : record.status === "decommissioned" ? "destructive" : "secondary"}>{record.status}</Badge>
              </div>
            </div>
          </div>
          {record.notes && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-medium text-gray-500">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.notes}</p>
            </div>
          )}
        </div>
      ) : currentTab ? (
        currentTab.rows.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center"><p className="text-gray-500">No records found.</p></div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {currentTab.headers.map((h) => (<th key={h} className="px-4 py-3 text-start font-medium text-gray-500">{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {currentTab.rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-gray-600">
                        {(currentTab.headers[j] ?? "").toLowerCase().includes("status") || (currentTab.headers[j] ?? "").toLowerCase().includes("health")
                          ? <Badge variant="secondary">{String(cell).replace(/_/g, " ")}</Badge>
                          : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
