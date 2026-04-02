import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortfolioAnalytic } from "@/lib/cargo-claims-management/service";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";


export default async function PortfolioAnalyticDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:read")))
    redirect("/");

  const { id } = await params;
  const record = await getPortfolioAnalytic(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "ccm:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "ccm:delete"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/cargo-claims-management/portfolio-analytics"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {record.analyticsRef}
            </h1>
            <p className="text-sm text-muted-foreground">
              Portfolio Analytics Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/cargo-claims-management/portfolio-analytics/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/cargo-claims-management/portfolio-analytics/${id}`} />
          )}
        </div>
      </div>

      <div className="rounded-md border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Analytics Ref
            </dt>
            <dd className="mt-1 text-sm">{record.analyticsRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">
              <Badge variant="outline">{record.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Analytics Type
            </dt>
            <dd className="mt-1 text-sm capitalize">
              {record.analyticsType?.replace(/_/g, " ") ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Reporting Period
            </dt>
            <dd className="mt-1 text-sm">
              {record.reportingPeriod ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Total Claims Count
            </dt>
            <dd className="mt-1 text-sm">
              {record.totalClaimsCount ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Open Claims Count
            </dt>
            <dd className="mt-1 text-sm">
              {record.openClaimsCount ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Closed Claims Count
            </dt>
            <dd className="mt-1 text-sm">
              {record.closedClaimsCount ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Total Incurred (USD)
            </dt>
            <dd className="mt-1 text-sm">
              {record.totalIncurredUsd ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Total Paid (USD)
            </dt>
            <dd className="mt-1 text-sm">{record.totalPaidUsd ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Total Reserved (USD)
            </dt>
            <dd className="mt-1 text-sm">
              {record.totalReservedUsd ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Total Recovered (USD)
            </dt>
            <dd className="mt-1 text-sm">
              {record.totalRecoveredUsd ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Loss Ratio
            </dt>
            <dd className="mt-1 text-sm">{record.lossRatio ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Avg Settlement Days
            </dt>
            <dd className="mt-1 text-sm">
              {record.avgSettlementDays ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Avg Claim Value (USD)
            </dt>
            <dd className="mt-1 text-sm">
              {record.avgClaimValueUsd ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Top Claim Category
            </dt>
            <dd className="mt-1 text-sm">
              {record.topClaimCategory ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Trend Direction
            </dt>
            <dd className="mt-1 text-sm">
              {record.trendDirection ?? "—"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">
              Notes
            </dt>
            <dd className="mt-1 text-sm whitespace-pre-wrap">
              {record.notes ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Created At
            </dt>
            <dd className="mt-1 text-sm">
              {record.createdAt
                ? new Date(record.createdAt).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Updated At
            </dt>
            <dd className="mt-1 text-sm">
              {record.updatedAt
                ? new Date(record.updatedAt).toLocaleString()
                : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
