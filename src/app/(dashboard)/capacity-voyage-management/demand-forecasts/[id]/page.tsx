import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { capDemandForecasts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function DemandForecastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const { id } = await params;

  const df = await db
    .select()
    .from(capDemandForecasts)
    .where(
      and(
        eq(capDemandForecasts.id, id),
        eq(capDemandForecasts.tenantId, session.tenantId),
        isNull(capDemandForecasts.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!df) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/demand-forecasts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{df.tradeLane}</h1>
          <p className="text-sm text-gray-500">
            {df.originRegion ?? "-"} &rarr; {df.destinationRegion ?? "-"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/demand-forecasts/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Trade Lane</dt>
            <dd className="mt-1 text-gray-900">{df.tradeLane}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Origin Region
            </dt>
            <dd className="mt-1 text-gray-900">
              {df.originRegion ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Destination Region
            </dt>
            <dd className="mt-1 text-gray-900">
              {df.destinationRegion ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Forecast Period Start
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(df.forecastPeriodStart)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Forecast Period End
            </dt>
            <dd className="mt-1 text-gray-900">
              {fmtDate(df.forecastPeriodEnd)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Forecasted Demand TEU
            </dt>
            <dd className="mt-1 text-gray-900">
              {df.forecastedDemandTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Actual Demand TEU
            </dt>
            <dd className="mt-1 text-gray-900">
              {df.actualDemandTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Available Capacity TEU
            </dt>
            <dd className="mt-1 text-gray-900">
              {df.availableCapacityTeu ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Utilization Forecast
            </dt>
            <dd className="mt-1 text-gray-900">
              {df.utilizationForecastPercent != null
                ? `${Number(df.utilizationForecastPercent)}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Confidence Level
            </dt>
            <dd className="mt-1 text-gray-900">
              {df.confidenceLevel != null
                ? `${Number(df.confidenceLevel)}%`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Methodology</dt>
            <dd className="mt-1 text-gray-900">{df.methodology}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Season Factor
            </dt>
            <dd className="mt-1 text-gray-900">
              {df.seasonFactor != null ? Number(df.seasonFactor) : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AI Model</dt>
            <dd className="mt-1 text-gray-900">{df.aiModel ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  df.status === "final"
                    ? "success"
                    : df.status === "expired"
                      ? "destructive"
                      : df.status === "preliminary"
                        ? "default"
                        : "secondary"
                }
              >
                {df.status}
              </Badge>
            </dd>
          </div>
          {df.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                {df.notes}
              </dd>
            </div>
          )}
          {df.marketConditions != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Market Conditions
              </dt>
              <dd className="mt-1">
                <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs">
                  {JSON.stringify(
                    df.marketConditions as Record<string, unknown>,
                    null,
                    2
                  )}
                </pre>
              </dd>
            </div>
          )}
          {df.recommendations != null && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Recommendations
              </dt>
              <dd className="mt-1">
                <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs">
                  {JSON.stringify(
                    df.recommendations as Record<string, unknown>,
                    null,
                    2
                  )}
                </pre>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
