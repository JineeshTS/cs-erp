import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { isfDeploymentConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "running":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    case "deploying":
      return "warning" as const;
    case "stopped":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
}

function healthVariant(health: string) {
  switch (health) {
    case "healthy":
      return "success" as const;
    case "unhealthy":
      return "destructive" as const;
    case "degraded":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function DeploymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:read")))
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

  const canEdit = await hasPermission(session.id, session.tenantId, "infra:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/infrastructure-security/deployments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.deploymentName}
          </h1>
          <p className="text-sm text-gray-500">
            {record.deploymentCode} &middot; {record.imageName}:{record.imageTag}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/infrastructure-security/deployments/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Deployment Name</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.deploymentName}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Deployment Code</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.deploymentCode}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Cluster ID</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.clusterId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Namespace ID</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.namespaceId ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Image Name</p>
            <p className="mt-0.5 font-mono text-sm text-gray-900">
              {record.imageName}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Image Tag</p>
            <p className="mt-0.5 font-mono text-sm text-gray-900">
              {record.imageTag}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Replicas</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.replicas}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Strategy</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.strategy.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-0.5">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Health Status</p>
            <div className="mt-0.5">
              <Badge variant={healthVariant(record.healthStatus)}>
                {record.healthStatus}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">CPU Request</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.cpuRequest != null ? `${record.cpuRequest}m` : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">CPU Limit</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.cpuLimit != null ? `${record.cpuLimit}m` : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Memory Request (MB)
            </p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.memoryRequestMb != null
                ? `${record.memoryRequestMb} MB`
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Memory Limit (MB)
            </p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.memoryLimitMb != null
                ? `${record.memoryLimitMb} MB`
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Last Deployed</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.lastDeployedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Last Rollback</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.lastRollbackAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Rollback Version
            </p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.rollbackVersion ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Created</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Updated</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.updatedAt)}
            </p>
          </div>
        </div>
        {record.notes && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
