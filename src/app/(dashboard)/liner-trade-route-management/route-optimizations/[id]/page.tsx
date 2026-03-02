import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRouteOptimization } from "@/lib/liner-trade-route-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  active: "success",
  draft: "secondary",
  pending_approval: "warning",
  approved: "success",
  implemented: "outline",
  rejected: "destructive",
} as const;

export default async function RouteOptimizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:read")))
    redirect("/liner-trade-route-management");

  const { id } = await params;

  const optimization = await getRouteOptimization(id, session.tenantId);
  if (!optimization) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "liner:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-trade-route-management/route-optimizations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {optimization.optimizationRef}
          </h1>
          <p className="text-sm text-gray-500">
            {optimization.tradeRoute} &middot; {optimization.optimizationType}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/liner-trade-route-management/route-optimizations/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Optimization Ref</dt>
            <dd className="mt-1 text-gray-900">{optimization.optimizationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Service Loop Name</dt>
            <dd className="mt-1 text-gray-900">
              {optimization.serviceLoopName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Trade Route</dt>
            <dd className="mt-1 text-gray-900">{optimization.tradeRoute}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Optimization Type</dt>
            <dd className="mt-1 text-gray-900">{optimization.optimizationType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Objective Function</dt>
            <dd className="mt-1 text-gray-900">{optimization.objectiveFunction}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Model Version</dt>
            <dd className="mt-1 text-gray-900">
              {optimization.modelVersion || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estimated Savings</dt>
            <dd className="mt-1 text-gray-900">
              {optimization.estimatedSavings != null
                ? String(optimization.estimatedSavings)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Transit Time Impact</dt>
            <dd className="mt-1 text-gray-900">
              {optimization.transitTimeImpact != null
                ? `${optimization.transitTimeImpact} hours`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Capacity Impact</dt>
            <dd className="mt-1 text-gray-900">
              {optimization.capacityImpact != null
                ? `${optimization.capacityImpact}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Emissions Impact</dt>
            <dd className="mt-1 text-gray-900">
              {optimization.emissionsImpact != null
                ? String(optimization.emissionsImpact)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Confidence Score</dt>
            <dd className="mt-1 text-gray-900">
              {optimization.confidenceScore != null
                ? String(optimization.confidenceScore)
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">
              {optimization.currency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">
              {optimization.approvedByName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {optimization.approvedAt
                ? new Date(optimization.approvedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Implemented At</dt>
            <dd className="mt-1 text-gray-900">
              {optimization.implementedAt
                ? new Date(optimization.implementedAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    optimization.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {optimization.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {optimization.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
