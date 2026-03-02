import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPredictiveForecast } from "@/lib/analytics-business-intelligence/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "success" | "secondary" | "destructive"> = {
  draft: "secondary",
  active: "success",
  completed: "default",
  archived: "destructive",
};

export default async function PredictiveForecastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:read")))
    redirect("/analytics-business-intelligence");

  const { id } = await params;

  const forecast = await getPredictiveForecast(id, session.tenantId);
  if (!forecast) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "analytics:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/predictive-forecasts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {forecast.forecastRef}
          </h1>
          <p className="text-sm text-gray-500">
            {forecast.forecastType} &middot; {forecast.targetMetric}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/analytics-business-intelligence/predictive-forecasts/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Forecast Ref</dt>
            <dd className="mt-1 text-gray-900">{forecast.forecastRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Forecast Type</dt>
            <dd className="mt-1 text-gray-900">{forecast.forecastType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={STATUS_VARIANT[forecast.status] ?? "secondary"}
              >
                {forecast.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Model Name</dt>
            <dd className="mt-1 text-gray-900">
              {forecast.modelName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Model Version</dt>
            <dd className="mt-1 text-gray-900">
              {forecast.modelVersion ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Target Metric</dt>
            <dd className="mt-1 text-gray-900">{forecast.targetMetric}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Target Entity</dt>
            <dd className="mt-1 text-gray-900">
              {forecast.targetEntity ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Forecast Horizon
            </dt>
            <dd className="mt-1 text-gray-900">
              {forecast.forecastHorizon ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Forecast Start
            </dt>
            <dd className="mt-1 text-gray-900">
              {forecast.forecastStart
                ? forecast.forecastStart.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Forecast End</dt>
            <dd className="mt-1 text-gray-900">
              {forecast.forecastEnd
                ? forecast.forecastEnd.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Predicted Value
            </dt>
            <dd className="mt-1 text-gray-900">
              {forecast.predictedValue ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Confidence Lower
            </dt>
            <dd className="mt-1 text-gray-900">
              {forecast.confidenceLower ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Confidence Upper
            </dt>
            <dd className="mt-1 text-gray-900">
              {forecast.confidenceUpper ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Confidence %
            </dt>
            <dd className="mt-1 text-gray-900">
              {forecast.confidencePct != null
                ? `${forecast.confidencePct}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Actual Value</dt>
            <dd className="mt-1 text-gray-900">
              {forecast.actualValue ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Variance %</dt>
            <dd className="mt-1 text-gray-900">
              {forecast.variancePct != null
                ? `${forecast.variancePct}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Accuracy Score
            </dt>
            <dd className="mt-1 text-gray-900">
              {forecast.accuracyScore ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Data Points</dt>
            <dd className="mt-1 text-gray-900">
              {forecast.dataPoints ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">
              {forecast.notes || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {forecast.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {forecast.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
