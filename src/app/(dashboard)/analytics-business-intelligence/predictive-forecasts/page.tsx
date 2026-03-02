import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { listPredictiveForecasts } from "@/lib/analytics-business-intelligence/service";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "success" | "secondary" | "destructive"> = {
  draft: "secondary",
  active: "success",
  completed: "default",
  archived: "destructive",
};

export default async function PredictiveForecastsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:read")))
    redirect("/analytics-business-intelligence");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "analytics:create"
  );

  const { search, status, cursor } = await searchParams;

  const { data, meta } = await listPredictiveForecasts({
    tenantId: session.tenantId,
    search,
    status,
    cursor,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Predictive Forecasts
          </h1>
          <p className="text-sm text-gray-500">
            Manage demand, rate, volume, and capacity forecasts
          </p>
        </div>
        {canCreate && (
          <Link
            href="/analytics-business-intelligence/predictive-forecasts/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Forecast
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No predictive forecasts found.</p>
          {canCreate && (
            <Link
              href="/analytics-business-intelligence/predictive-forecasts/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first forecast
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Forecast Ref
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Forecast Type
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Target Metric
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Model Name
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Confidence %
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((forecast) => (
                  <tr
                    key={forecast.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/analytics-business-intelligence/predictive-forecasts/${forecast.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {forecast.forecastRef}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {forecast.forecastType}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {forecast.targetMetric}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {forecast.modelName ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {forecast.confidencePct != null
                        ? `${forecast.confidencePct}%`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={STATUS_VARIANT[forecast.status] ?? "secondary"}
                      >
                        {forecast.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta.hasMore && meta.cursor && (
            <div className="flex justify-end">
              <Link
                href={`/analytics-business-intelligence/predictive-forecasts?cursor=${encodeURIComponent(meta.cursor)}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
