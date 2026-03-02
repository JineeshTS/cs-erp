import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getTradeLanePnl } from "@/lib/liner-trade-route-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "approved":
    case "finalized":
      return <Badge variant="success">{status}</Badge>;
    case "rejected":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function TradeLanePnlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:read")))
    redirect("/");

  const { id } = await params;
  const record = await getTradeLanePnl(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "liner:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/liner-trade-route-management/trade-lane-pnl"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Trade Lane P&amp;L
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.pnlRef}
          </h1>
        </div>
        {canEdit && (
          <Link
            href={`/liner-trade-route-management/trade-lane-pnl/${record.id}/edit`}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">P&amp;L Ref</dt>
            <dd className="mt-1 text-sm">{record.pnlRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Trade Lane Name</dt>
            <dd className="mt-1 text-sm">{record.tradeLaneName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Service Loop Name</dt>
            <dd className="mt-1 text-sm">{record.serviceLoopName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Period Start</dt>
            <dd className="mt-1 text-sm">
              {record.periodStart
                ? new Date(record.periodStart).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Period End</dt>
            <dd className="mt-1 text-sm">
              {record.periodEnd
                ? new Date(record.periodEnd).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Period Type</dt>
            <dd className="mt-1 text-sm">{record.periodType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Volume (TEU)</dt>
            <dd className="mt-1 text-sm">{record.volumeTeu ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Revenue</dt>
            <dd className="mt-1 text-sm">{record.revenue ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Bunker Cost</dt>
            <dd className="mt-1 text-sm">{record.bunkerCost ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Port Cost</dt>
            <dd className="mt-1 text-sm">{record.portCost ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Canal Cost</dt>
            <dd className="mt-1 text-sm">{record.canalCost ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Equipment Cost</dt>
            <dd className="mt-1 text-sm">{record.equipmentCost ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Overhead Cost</dt>
            <dd className="mt-1 text-sm">{record.overheadCost ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Total Cost</dt>
            <dd className="mt-1 text-sm">{record.totalCost ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Gross Profit</dt>
            <dd className="mt-1 text-sm">{record.grossProfit ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Gross Margin %</dt>
            <dd className="mt-1 text-sm">{record.grossMarginPercent ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Contribution Margin</dt>
            <dd className="mt-1 text-sm">{record.contributionMargin ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Revenue per TEU</dt>
            <dd className="mt-1 text-sm">{record.revenuePerTeu ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Cost per TEU</dt>
            <dd className="mt-1 text-sm">{record.costPerTeu ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Currency</dt>
            <dd className="mt-1 text-sm">{record.currency ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
            <dd className="mt-1 text-sm">{record.notes ?? "\u2014"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
