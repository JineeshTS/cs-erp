import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDemandForecast } from "@/lib/liner-revenue-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function DemandForecastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lrm:read")))
    redirect("/liner-revenue-management");

  const { id } = await params;

  const record = await getDemandForecast(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "lrm:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-revenue-management/demand-forecasts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.forecastRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.forecastType?.replace(/_/g, " ")} &middot; {record.tradeLane || "No trade lane"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/liner-revenue-management/demand-forecasts/${id}/edit`}
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
            <dd className="mt-1 text-gray-900">{record.forecastRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Forecast Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.forecastType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Trade Lane</dt>
            <dd className="mt-1 text-gray-900">{record.tradeLane || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Origin Region</dt>
            <dd className="mt-1 text-gray-900">{record.originRegion || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Destination Region</dt>
            <dd className="mt-1 text-gray-900">{record.destinationRegion || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Forecast Period</dt>
            <dd className="mt-1 text-gray-900">{record.forecastPeriod || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Predicted TEU</dt>
            <dd className="mt-1 text-gray-900">{record.predictedTeu ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Actual TEU</dt>
            <dd className="mt-1 text-gray-900">{record.actualTeu ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Confidence %</dt>
            <dd className="mt-1 text-gray-900">{record.confidencePct ? `${record.confidencePct}%` : "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Accuracy %</dt>
            <dd className="mt-1 text-gray-900">{record.accuracyPct ? `${record.accuracyPct}%` : "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Model Version</dt>
            <dd className="mt-1 text-gray-900">{record.modelVersion || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Forecast Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.forecastDate ? record.forecastDate.toLocaleDateString() : "-"}
            </dd>
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
