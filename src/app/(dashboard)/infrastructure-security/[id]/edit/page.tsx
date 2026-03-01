import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { isfK8sClusters } from "@/db/schema";
import { IsfForm } from "@/components/infrastructure-security/isf-form";
import type { FieldConfig } from "@/components/infrastructure-security/isf-form";

const CLUSTER_FIELDS: FieldConfig[] = [
  { name: "clusterName", label: "Cluster Name", type: "text", required: true },
  { name: "clusterCode", label: "Cluster Code", type: "text", required: true },
  { name: "provider", label: "Provider", type: "select", required: true, options: [
    { value: "aws", label: "AWS EKS" }, { value: "azure", label: "Azure AKS" },
    { value: "gcp", label: "Google GKE" }, { value: "on_premise", label: "On-Premise" },
  ]},
  { name: "region", label: "Region", type: "text", required: true },
  { name: "environment", label: "Environment", type: "select", options: [
    { value: "production", label: "Production" }, { value: "staging", label: "Staging" },
    { value: "development", label: "Development" }, { value: "testing", label: "Testing" },
  ]},
  { name: "version", label: "K8s Version", type: "text" },
  { name: "endpoint", label: "Endpoint URL", type: "text" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" },
    { value: "provisioning", label: "Provisioning" }, { value: "decommissioned", label: "Decommissioned" },
  ]},
  { name: "nodeCount", label: "Node Count", type: "number" },
  { name: "cpuCapacity", label: "CPU Capacity (cores)", type: "number" },
  { name: "memoryCapacityMb", label: "Memory Capacity (MB)", type: "number" },
  { name: "costPerHour", label: "Cost per Hour (cents)", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditClusterPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:edit")))
    redirect("/infrastructure-security");

  const { id } = await params;
  const record = await db.select().from(isfK8sClusters)
    .where(and(eq(isfK8sClusters.id, id), eq(isfK8sClusters.tenantId, session.tenantId), isNull(isfK8sClusters.deletedAt)))
    .limit(1).then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    clusterName: record.clusterName, clusterCode: record.clusterCode,
    provider: record.provider, region: record.region,
    environment: record.environment, version: record.version ?? "",
    endpoint: record.endpoint ?? "", status: record.status,
    nodeCount: record.nodeCount ?? "", cpuCapacity: record.cpuCapacity ?? "",
    memoryCapacityMb: record.memoryCapacityMb ?? "", costPerHour: record.costPerHour ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/infrastructure-security/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Cluster</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IsfForm entityType="Cluster" apiPath={`/api/v1/infrastructure-security/clusters/${id}`} fields={CLUSTER_FIELDS} initialData={initialData} isEdit returnPath={`/infrastructure-security/${id}`} />
      </div>
    </div>
  );
}
