import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, BarChart3 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getLossPreventionReport } from "@/lib/insurance-claims-management/service";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "approved":
      return "success";
    case "archived":
      return "destructive";
    case "pending":
      return "warning";
    default:
      return "secondary";
  }
}

export default async function LossPreventionReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:read"))) redirect("/login");

  const { id } = await params;
  const record = await getLossPreventionReport(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/insurance-claims-management/loss-prevention-reports"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <BarChart3 className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{record.reportRef}</h1>
            <p className="text-sm text-muted-foreground">Loss Prevention Report Detail</p>
          </div>
        </div>
        {(await hasPermission(session.id, session.tenantId, "insurance:edit")) && (
          <Link
            href={`/insurance-claims-management/loss-prevention-reports/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Report Ref</dt>
          <dd className="mt-1 text-sm">{record.reportRef}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Report Title</dt>
          <dd className="mt-1 text-sm">{record.reportTitle}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Report Type</dt>
          <dd className="mt-1 text-sm">{record.reportType}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Period Start</dt>
          <dd className="mt-1 text-sm">{record.periodStart?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Period End</dt>
          <dd className="mt-1 text-sm">{record.periodEnd?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Vessel Name</dt>
          <dd className="mt-1 text-sm">{record.vesselName ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Fleet Scope</dt>
          <dd className="mt-1 text-sm">{record.fleetScope ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Total Claims</dt>
          <dd className="mt-1 text-sm">{record.totalClaims ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Total Claim Amount</dt>
          <dd className="mt-1 text-sm">{record.totalClaimAmount ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Total Recovered</dt>
          <dd className="mt-1 text-sm">{record.totalRecovered ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Net Loss</dt>
          <dd className="mt-1 text-sm">{record.netLoss ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Report Currency</dt>
          <dd className="mt-1 text-sm">{record.reportCurrency ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Loss Ratio</dt>
          <dd className="mt-1 text-sm">{record.lossRatio ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Claim Frequency</dt>
          <dd className="mt-1 text-sm">{record.claimFrequency ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Recommendations</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.recommendations ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Document URL</dt>
          <dd className="mt-1 text-sm">{record.documentUrl ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Document Format</dt>
          <dd className="mt-1 text-sm">{record.documentFormat ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Approved By</dt>
          <dd className="mt-1 text-sm">{record.approvedBy ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Approved At</dt>
          <dd className="mt-1 text-sm">{record.approvedAt?.toLocaleDateString() ?? "-"}</dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{record.notes ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Status</dt>
          <dd className="mt-1">
            <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
          </dd>
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
