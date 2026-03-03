import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getEsgKpi } from "@/lib/sustainability-esg-reporting/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "on_track":
    case "achieved":
      return <Badge variant="success">{status}</Badge>;
    case "at_risk":
    case "missed":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function EsgKpiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:read")))
    redirect("/sustainability-esg-reporting");

  const { id } = await params;
  const record = await getEsgKpi(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/sustainability-esg-reporting/esg-kpis"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to ESG KPIs
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{record.kpiRef}</h1>
        </div>
        <Link
          href={`/sustainability-esg-reporting/esg-kpis/${record.id}/edit`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              KPI Ref
            </dt>
            <dd className="mt-1 text-sm">{record.kpiRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              KPI Type
            </dt>
            <dd className="mt-1 text-sm">{record.kpiType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              KPI Name
            </dt>
            <dd className="mt-1 text-sm">{record.kpiName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              KPI Category
            </dt>
            <dd className="mt-1 text-sm">{record.kpiCategory ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Reporting Period
            </dt>
            <dd className="mt-1 text-sm">
              {record.reportingPeriod ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Target Value
            </dt>
            <dd className="mt-1 text-sm">{record.targetValue ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Actual Value
            </dt>
            <dd className="mt-1 text-sm">{record.actualValue ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Achievement %
            </dt>
            <dd className="mt-1 text-sm">
              {record.achievementPct != null
                ? `${record.achievementPct}%`
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Benchmark Value
            </dt>
            <dd className="mt-1 text-sm">
              {record.benchmarkValue ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Benchmark Source
            </dt>
            <dd className="mt-1 text-sm">
              {record.benchmarkSource ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Trend Direction
            </dt>
            <dd className="mt-1 text-sm">
              {record.trendDirection ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Rating
            </dt>
            <dd className="mt-1 text-sm">{record.rating ?? "\u2014"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Notes
            </dt>
            <dd className="mt-1 text-sm">{record.notes ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Created At
            </dt>
            <dd className="mt-1 text-sm">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Updated At
            </dt>
            <dd className="mt-1 text-sm">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
