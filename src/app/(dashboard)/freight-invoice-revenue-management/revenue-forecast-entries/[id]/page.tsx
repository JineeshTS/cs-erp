import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRevenueForecastEntry } from "@/lib/freight-invoice-revenue-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "approved":
    case "published":
      return "success" as const;
    case "archived":
      return "secondary" as const;
    case "draft":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

export default async function RevenueForecastEntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:read")))
    redirect("/freight-invoice-revenue-management");

  const { id } = await params;
  const record = await getRevenueForecastEntry(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "invoice:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/freight-invoice-revenue-management/revenue-forecast-entries"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.forecastRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.forecastPeriod} &middot; {record.forecastYear}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/freight-invoice-revenue-management/revenue-forecast-entries/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Forecast Period
            </dt>
            <dd className="mt-1 text-gray-900">{record.forecastPeriod}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Forecast Year</dt>
            <dd className="mt-1 text-gray-900">{record.forecastYear}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Forecast Month
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.forecastMonth ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Service Route</dt>
            <dd className="mt-1 text-gray-900">
              {record.serviceRoute ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Customer Segment
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.customerSegment ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Forecast Revenue
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.forecastRevenue?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Revenue
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.actualRevenue != null
                ? record.actualRevenue.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Variance</dt>
            <dd className="mt-1 text-gray-900">
              {record.variance != null
                ? record.variance.toLocaleString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Variance Percent
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.variancePercent != null
                ? `${record.variancePercent}%`
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Pipeline Value
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.pipelineValue?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Confirmed Value
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.confirmedValue?.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Probability Percent
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.probabilityPercent != null
                ? `${record.probabilityPercent}%`
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Forecast Method
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.forecastMethod ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              AI Model Version
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.aiModelVersion ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Confidence Score
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.confidenceScore != null
                ? record.confidenceScore
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved At</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedAt
                ? new Date(record.approvedAt).toLocaleString()
                : "--"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes ?? "--"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
