import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, TrendingUp } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getVoyagePnl } from "@/lib/voyage-results-settlement/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "draft":
      return "secondary";
    case "verified":
      return "success";
    case "published":
      return "default";
    default:
      return "secondary";
  }
}

export default async function VoyagePnlDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:read")))
    redirect("/login");

  const { id } = await params;
  const record = await getVoyagePnl(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/voyage-results-settlement/voyage-pnls"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <TrendingUp className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.pnlRef}</h1>
            <p className="text-sm text-muted-foreground">Voyage P&L Statement Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "vrs:edit")) && (
          <Link
            href={`/voyage-results-settlement/voyage-pnls/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">P&L Ref</dt>
          <dd className="mt-1 text-sm">{record.pnlRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">P&L Type</dt>
          <dd className="mt-1 text-sm capitalize">{record.pnlType?.replace(/_/g, " ")}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Status</dt>
          <dd className="mt-1">
            <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Title</dt>
          <dd className="mt-1 text-sm">{record.title ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Voyage Number</dt>
          <dd className="mt-1 text-sm">{record.voyageNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
          <dd className="mt-1 text-sm">{record.vesselName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Freight Revenue</dt>
          <dd className="mt-1 text-sm">
            {record.freightRevenue !== null && record.freightRevenue !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.freightRevenue))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Demurrage Revenue</dt>
          <dd className="mt-1 text-sm">
            {record.demurrageRevenue !== null && record.demurrageRevenue !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.demurrageRevenue))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Other Revenue</dt>
          <dd className="mt-1 text-sm">
            {record.otherRevenue !== null && record.otherRevenue !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.otherRevenue))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Port Costs</dt>
          <dd className="mt-1 text-sm">
            {record.portCosts !== null && record.portCosts !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.portCosts))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Bunker Costs</dt>
          <dd className="mt-1 text-sm">
            {record.bunkerCosts !== null && record.bunkerCosts !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.bunkerCosts))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Canal Costs</dt>
          <dd className="mt-1 text-sm">
            {record.canalCosts !== null && record.canalCosts !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.canalCosts))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Other Costs</dt>
          <dd className="mt-1 text-sm">
            {record.otherCosts !== null && record.otherCosts !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.otherCosts))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Total Revenue</dt>
          <dd className="mt-1 text-sm">
            {record.totalRevenue !== null && record.totalRevenue !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.totalRevenue))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Total Costs</dt>
          <dd className="mt-1 text-sm">
            {record.totalCosts !== null && record.totalCosts !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.totalCosts))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Net P&L</dt>
          <dd className="mt-1 text-sm font-semibold">
            {record.netPnl !== null && record.netPnl !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Number(record.netPnl))
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Margin %</dt>
          <dd className="mt-1 text-sm">
            {record.marginPct !== null && record.marginPct !== undefined
              ? `${Number(record.marginPct).toFixed(2)}%`
              : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Approved By</dt>
          <dd className="mt-1 text-sm">{record.approvedBy ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Approved Date</dt>
          <dd className="mt-1 text-sm">{record.approvedDate?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.notes ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
          <dd className="mt-1 text-sm">{record.createdAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Updated At</dt>
          <dd className="mt-1 text-sm">{record.updatedAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
      </dl>
    </div>
  );
}
