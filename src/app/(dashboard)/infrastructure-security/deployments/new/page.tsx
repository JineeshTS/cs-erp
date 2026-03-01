import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IsfForm } from "@/components/infrastructure-security/isf-form";
import type { FieldConfig } from "@/components/infrastructure-security/isf-form";

const DEPLOYMENT_FIELDS: FieldConfig[] = [
  {
    name: "deploymentName",
    label: "Deployment Name",
    type: "text",
    required: true,
    placeholder: "web-api-prod",
  },
  {
    name: "deploymentCode",
    label: "Deployment Code",
    type: "text",
    required: true,
    placeholder: "WEB-API-01",
  },
  {
    name: "clusterId",
    label: "Cluster ID",
    type: "text",
    required: true,
    placeholder: "Cluster UUID",
  },
  {
    name: "namespaceId",
    label: "Namespace ID",
    type: "text",
    placeholder: "Namespace UUID (optional)",
  },
  {
    name: "imageName",
    label: "Image Name",
    type: "text",
    required: true,
    placeholder: "registry.example.com/app",
  },
  {
    name: "imageTag",
    label: "Image Tag",
    type: "text",
    required: true,
    placeholder: "latest",
  },
  {
    name: "replicas",
    label: "Replicas",
    type: "number",
    placeholder: "1",
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
    name: "cpuRequest",
    label: "CPU Request (millicores)",
    type: "number",
    placeholder: "100",
  },
  {
    name: "cpuLimit",
    label: "CPU Limit (millicores)",
    type: "number",
    placeholder: "500",
  },
  {
    name: "memoryRequestMb",
    label: "Memory Request (MB)",
    type: "number",
    placeholder: "128",
  },
  {
    name: "memoryLimitMb",
    label: "Memory Limit (MB)",
    type: "number",
    placeholder: "512",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewDeploymentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:create")))
    redirect("/infrastructure-security");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/infrastructure-security/deployments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Deployment</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IsfForm
          entityType="Deployment"
          apiPath="/api/v1/infrastructure-security/deployments"
          fields={DEPLOYMENT_FIELDS}
          returnPath="/infrastructure-security/deployments"
        />
      </div>
    </div>
  );
}
