import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDeploymentOptimizer } from "@/lib/fleet-deployment-planning/service";
import { Badge } from "@/components/ui/badge";

export default async function DeploymentOptimizerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "fdp:read")))
    redirect("/fleet-deployment-planning");

  const { id } = await params;

  const optimizer = await getDeploymentOptimizer(session.tenantId, id);

  if (!optimizer) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "fdp:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fleet-deployment-planning/deployment-optimizers"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{optimizer.title}</h1>
          <p className="text-sm text-gray-500">{optimizer.optimizerRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/fleet-deployment-planning/deployment-optimizers/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Ref</dt>
            <dd className="mt-1 text-gray-900">{optimizer.optimizerRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-gray-900">{optimizer.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="mt-1">
              <Badge variant="secondary">{optimizer.optimizerType}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Scenario Name</dt>
            <dd className="mt-1 text-gray-900">{optimizer.scenarioName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Vessel Count
            </dt>
            <dd className="mt-1 text-gray-900">{optimizer.vesselCount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Trade Count</dt>
            <dd className="mt-1 text-gray-900">{optimizer.tradeCount}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Optimal TCE</dt>
            <dd className="mt-1 text-gray-900">{optimizer.optimalTce}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Improvement %
            </dt>
            <dd className="mt-1 text-gray-900">{optimizer.improvementPct}%</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-gray-900">{optimizer.status}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Run Date</dt>
            <dd className="mt-1 text-gray-900">
              {optimizer.runDate
                ? new Date(optimizer.runDate).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Objective Function
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {optimizer.objectiveFunction || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Constraints</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {optimizer.constraints || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              AI Recommendation
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {optimizer.aiRecommendation || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {optimizer.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
