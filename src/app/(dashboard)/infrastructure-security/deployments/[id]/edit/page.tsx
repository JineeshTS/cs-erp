import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { isfDeploymentConfigs } from "@/db/schema";
import { IsfForm } from "@/components/infrastructure-security/isf-form";
import type { FieldConfig } from "@/components/infrastructure-security/isf-form";

const DEPLOYMENT_FIELDS: FieldConfig[] = [
  {
    name: "deploymentName",
    label: "Deployment Name",
    type: "text",
    required: true,
  },
  {
    name: "deploymentCode",
    label: "Deployment Code",
    type: "text",
    required: true,
  },
  {
    name: "clusterId",
    label: "Cluster ID",
    type: "text",
    required: true,
  },
  {
    name: "namespaceId",
    label: "Namespace ID",
    type: "text",
  },
  {
    name: "imageName",
    label: "Image Name",
    type: "text",
    required: true,
  },
  {
    name: "imageTag",
    label: "Image Tag",
    type: "text",
    required: true,
  },
  {
    name: "replicas",
    label: "Replicas",
    type: "number",
  },
  {
    name: "strategy",
    label: "Strategy",
    type: "select",
    options: [
      { value: "rolling", label: "Rolling Update" },
      { value: "recreate", label: "Recreate" },
      { value: "blue_green", label: "Blue/Green" },
      { value: "canary", label: "Canary" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "deploying", label: "Deploying" },
      { value: "running", label: "Running" },
      { value: "failed", label: "Failed" },
      { value: "stopped", label: "Stopped" },
    ],
  },
  {
    name: "healthStatus",
    label: "Health Status",
    type: "select",
    options: [
      { value: "unknown", label: "Unknown" },
      { value: "healthy", label: "Healthy" },
      { value: "unhealthy", label: "Unhealthy" },
      { value: "degraded", label: "Degraded" },
    ],
  },
  {
    name: "cpuRequest",
    label: "CPU Request (millicores)",
    type: "number",
  },
  {
    name: "cpuLimit",
    label: "CPU Limit (millicores)",
    type: "number",
  },
  {
    name: "memoryRequestMb",
    label: "Memory Request (MB)",
    type: "number",
  },
  {
    name: "memoryLimitMb",
    label: "Memory Limit (MB)",
    type: "number",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function EditDeploymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:edit")))
    redirect("/infrastructure-security");

  const { id } = await params;

  const record = await db
    .select()
    .from(isfDeploymentConfigs)
    .where(
      and(
        eq(isfDeploymentConfigs.id, id),
        eq(isfDeploymentConfigs.tenantId, session.tenantId),
        isNull(isfDeploymentConfigs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    deploymentName: record.deploymentName,
    deploymentCode: record.deploymentCode,
    clusterId: record.clusterId,
    namespaceId: record.namespaceId ?? "",
    imageName: record.imageName,
    imageTag: record.imageTag,
    replicas: record.replicas,
    strategy: record.strategy,
    status: record.status,
    healthStatus: record.healthStatus,
    cpuRequest: record.cpuRequest ?? "",
    cpuLimit: record.cpuLimit ?? "",
    memoryRequestMb: record.memoryRequestMb ?? "",
    memoryLimitMb: record.memoryLimitMb ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/infrastructure-security/deployments/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Deployment</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IsfForm
          entityType="Deployment"
          apiPath={`/api/v1/infrastructure-security/deployments/${id}`}
          fields={DEPLOYMENT_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/infrastructure-security/deployments/${id}`}
        />
      </div>
    </div>
  );
}
