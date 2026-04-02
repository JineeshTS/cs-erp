import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getOptimizationRun } from "@/lib/bunker-fuel-management/service";
import { Badge } from "@/components/ui/badge";

export default async function OptimizationRunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:read")))
    redirect("/");

  const { id } = await params;

  const run = await getOptimizationRun(id, session.tenantId);
  if (!run) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bunker-fuel-management/optimization-runs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{run.runRef}</h1>
          <p className="text-sm text-gray-500">
            {run.vesselName}
            {run.voyageRef ? ` \u00b7 ${run.voyageRef}` : ""}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Run Ref</dt>
            <dd className="mt-1 text-gray-900">{run.runRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel Name</dt>
            <dd className="mt-1 text-gray-900">{run.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Vessel IMO</dt>
            <dd className="mt-1 text-gray-900">{run.vesselImo || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Voyage Ref</dt>
            <dd className="mt-1 text-gray-900">{run.voyageRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Optimization Type
            </dt>
            <dd className="mt-1 text-gray-900">{run.optimizationType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Potential Savings
            </dt>
            <dd className="mt-1 text-gray-900">
              {run.potentialSavings != null ? run.potentialSavings : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Savings Currency
            </dt>
            <dd className="mt-1 text-gray-900">{run.savingsCurrency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Optimal Port</dt>
            <dd className="mt-1 text-gray-900">{run.optimalPort || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Optimal Fuel Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {run.optimalFuelType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Optimal Quantity
            </dt>
            <dd className="mt-1 text-gray-900">
              {run.optimalQuantity != null ? run.optimalQuantity : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Optimal Supplier
            </dt>
            <dd className="mt-1 text-gray-900">
              {run.optimalSupplier || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Confidence Score
            </dt>
            <dd className="mt-1 text-gray-900">
              {run.confidenceScore != null ? `${run.confidenceScore}%` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Model Version
            </dt>
            <dd className="mt-1 text-gray-900">
              {run.modelVersion || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  run.status === "completed" || run.status === "accepted"
                    ? "success"
                    : run.status === "failed"
                      ? "destructive"
                      : run.status === "running"
                        ? "default"
                        : "secondary"
                }
              >
                {run.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Started At</dt>
            <dd className="mt-1 text-gray-900">
              {run.startedAt
                ? new Date(run.startedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Completed At
            </dt>
            <dd className="mt-1 text-gray-900">
              {run.completedAt
                ? new Date(run.completedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Accepted At</dt>
            <dd className="mt-1 text-gray-900">
              {run.acceptedAt
                ? new Date(run.acceptedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Accepted By</dt>
            <dd className="mt-1 text-gray-900">{run.acceptedBy || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {run.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
