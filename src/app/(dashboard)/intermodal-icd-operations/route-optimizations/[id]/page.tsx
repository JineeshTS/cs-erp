import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRouteOptimization } from "@/lib/intermodal-icd-operations/service";
import { Badge } from "@/components/ui/badge";

export default async function RouteOptimizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:read")))
    redirect("/intermodal-icd-operations");

  const { id } = await params;
  const record = await getRouteOptimization(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "intermodal:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/intermodal-icd-operations/route-optimizations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.originLocation} to {record.destinationLocation}
          </h1>
          <p className="text-sm text-gray-500">{record.optimizationRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/intermodal-icd-operations/route-optimizations/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Optimization Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.optimizationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Requested By</dt>
            <dd className="mt-1 text-gray-900">
              {record.requestedByName || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Origin Location
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.originLocation || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Destination Location
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.destinationLocation || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Cargo Description
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.cargoDescription || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Size
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.containerSize || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Container Count
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.containerCount ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gross Weight (kg)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.grossWeightKg ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Required Delivery
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.requiredDeliveryAt
                ? new Date(record.requiredDeliveryAt).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Optimization Criteria
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.optimizationCriteria || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Selected Route Index
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.selectedRouteIndex ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Selected Route Summary
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.selectedRouteSummary || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Estimated Cost
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.estimatedCost ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Est. Transit Days
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.estimatedTransitDays ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Est. Carbon (kg)
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.estimatedCarbonKg ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              AI Model Used
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.aiModelUsed || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              AI Confidence Score
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.aiConfidenceScore ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "completed"
                    ? "success"
                    : record.status === "failed"
                      ? "destructive"
                      : record.status === "processing"
                        ? "warning"
                        : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
