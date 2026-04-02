import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getDemandForecast } from "@/lib/empty-container-repositioning-ai/service";

export default async function DemandForecastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:read")))
    redirect("/");

  const { id } = await params;
  const forecast = await getDemandForecast(id, session.tenantId);
  if (!forecast) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/empty-container-repositioning-ai/demand-forecasts"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {forecast.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {forecast.forecastRef}
            </p>
          </div>
        </div>
        <Link
          href={`/empty-container-repositioning-ai/demand-forecasts/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <div className="rounded-lg border">
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <div className="mt-1">
              <Badge
                variant={
                  forecast.status === "active" ? "default" : "secondary"
                }
              >
                {forecast.status}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Forecast Type
            </p>
            <p className="mt-1 text-sm">
              <Badge variant="outline">{forecast.forecastType}</Badge>
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Trade Lane
            </p>
            <p className="mt-1 text-sm">{forecast.tradeLane}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Container Type
            </p>
            <p className="mt-1 text-sm">{forecast.containerType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Period From
            </p>
            <p className="mt-1 text-sm">
              {forecast.periodFrom
                ? new Date(forecast.periodFrom).toLocaleString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Period To
            </p>
            <p className="mt-1 text-sm">
              {forecast.periodTo
                ? new Date(forecast.periodTo).toLocaleString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Forecasted Demand
            </p>
            <p className="mt-1 text-sm">{forecast.forecastedDemand}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Actual Demand
            </p>
            <p className="mt-1 text-sm">{forecast.actualDemand ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Accuracy %
            </p>
            <p className="mt-1 text-sm">{forecast.accuracyPct ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Confidence Level
            </p>
            <p className="mt-1 text-sm">{forecast.confidenceLevel ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              AI Model Version
            </p>
            <p className="mt-1 text-sm">{forecast.aiModelVersion ?? "—"}</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm font-medium text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {forecast.notes ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
