import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPredictiveAlert } from "@/lib/real-time-iot-asset-tracking/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  active: "success",
  acknowledged: "warning",
  resolved: "default",
  dismissed: "destructive",
} as const;

export default async function PredictiveAlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:read")))
    redirect("/real-time-iot-asset-tracking");

  const { id } = await params;

  const record = await getPredictiveAlert(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "iot:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/real-time-iot-asset-tracking/predictive-alerts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.alertRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.alertType?.replace(/_/g, " ")} &middot;{" "}
            {record.assetIdentifier || "No asset"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/real-time-iot-asset-tracking/predictive-alerts/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Alert Ref</dt>
            <dd className="mt-1 text-gray-900">{record.alertRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Alert Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">
              {record.alertType?.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Type</dt>
            <dd className="mt-1 text-gray-900">
              {record.assetType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Asset Identifier
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.assetIdentifier || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Alert Severity
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.alertSeverity || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Prediction Confidence
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.predictionConfidence ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Predicted Failure Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.predictedFailureDate
                ? record.predictedFailureDate.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">
              Recommended Action
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.recommendedAction || "-"}
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
              Cost Currency
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.costCurrency || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Acknowledged</dt>
            <dd className="mt-1 text-gray-900">
              {record.acknowledged ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Acknowledged At
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.acknowledgedAt
                ? record.acknowledgedAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Resolved At</dt>
            <dd className="mt-1 text-gray-900">
              {record.resolvedAt
                ? record.resolvedAt.toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
