import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getTcfdReport } from "@/lib/sustainability-esg-reporting/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "published":
    case "verified":
      return <Badge variant="success">{status}</Badge>;
    case "rejected":
      return <Badge variant="destructive">{status}</Badge>;
    case "submitted":
      return <Badge variant="warning">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function TcfdReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:read")))
    redirect("/sustainability-esg-reporting");

  const { id } = await params;
  const record = await getTcfdReport(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/sustainability-esg-reporting/tcfd-reports"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to TCFD Reports
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{record.tcfdRef}</h1>
        </div>
        <Link
          href={`/sustainability-esg-reporting/tcfd-reports/${record.id}/edit`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              TCFD Ref
            </dt>
            <dd className="mt-1 text-sm">{record.tcfdRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              TCFD Type
            </dt>
            <dd className="mt-1 text-sm">{record.tcfdType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Reporting Year
            </dt>
            <dd className="mt-1 text-sm">
              {record.reportingYear ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Pillar Area
            </dt>
            <dd className="mt-1 text-sm">{record.pillarArea ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Disclosure Title
            </dt>
            <dd className="mt-1 text-sm">
              {record.disclosureTitle ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Scenario Name
            </dt>
            <dd className="mt-1 text-sm">
              {record.scenarioName ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Temperature Pathway
            </dt>
            <dd className="mt-1 text-sm">
              {record.temperaturePathway ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Financial Impact
            </dt>
            <dd className="mt-1 text-sm">
              {record.financialImpact ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Impact Currency
            </dt>
            <dd className="mt-1 text-sm">
              {record.impactCurrency ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Risk Category
            </dt>
            <dd className="mt-1 text-sm">
              {record.riskCategory ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Opportunity Category
            </dt>
            <dd className="mt-1 text-sm">
              {record.opportunityCategory ?? "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Maturity Level
            </dt>
            <dd className="mt-1 text-sm">
              {record.maturityLevel ?? "\u2014"}
            </dd>
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
