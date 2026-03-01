import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IsfForm } from "@/components/infrastructure-security/isf-form";
import type { FieldConfig } from "@/components/infrastructure-security/isf-form";

const CLUSTER_FIELDS: FieldConfig[] = [
  { name: "clusterName", label: "Cluster Name", type: "text", required: true, placeholder: "prod-cluster-01" },
  { name: "clusterCode", label: "Cluster Code", type: "text", required: true, placeholder: "PROD-01" },
  { name: "provider", label: "Provider", type: "select", required: true, options: [
    { value: "aws", label: "AWS EKS" },
    { value: "azure", label: "Azure AKS" },
    { value: "gcp", label: "Google GKE" },
    { value: "on_premise", label: "On-Premise" },
  ]},
  { name: "region", label: "Region", type: "text", required: true, placeholder: "me-south-1" },
  { name: "environment", label: "Environment", type: "select", options: [
    { value: "production", label: "Production" },
    { value: "staging", label: "Staging" },
    { value: "development", label: "Development" },
    { value: "testing", label: "Testing" },
  ]},
  { name: "version", label: "K8s Version", type: "text", placeholder: "1.28" },
  { name: "endpoint", label: "Endpoint URL", type: "text", placeholder: "https://cluster.example.com" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "provisioning", label: "Provisioning" },
    { value: "decommissioned", label: "Decommissioned" },
  ]},
  { name: "nodeCount", label: "Node Count", type: "number", placeholder: "3" },
  { name: "cpuCapacity", label: "CPU Capacity (cores)", type: "number" },
  { name: "memoryCapacityMb", label: "Memory Capacity (MB)", type: "number" },
  { name: "costPerHour", label: "Cost per Hour (cents)", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewClusterPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:create")))
    redirect("/infrastructure-security");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/infrastructure-security" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Cluster</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IsfForm entityType="Cluster" apiPath="/api/v1/infrastructure-security/clusters" fields={CLUSTER_FIELDS} returnPath="/infrastructure-security" />
      </div>
    </div>
  );
}
