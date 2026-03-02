import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getMlcCompliance } from "@/lib/crew-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "compliant":
      return <Badge variant="success">{status}</Badge>;
    case "non_compliant":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function MlcComplianceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:read")))
    redirect("/");

  const { id } = await params;
  const record = await getMlcCompliance(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/crew-management/mlc-compliance"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to MLC Compliance
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.complianceRef}
          </h1>
        </div>
        <Link
          href={`/crew-management/mlc-compliance/${record.id}/edit`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Vessel
            </dt>
            <dd className="mt-1 text-sm">{record.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Flag State
            </dt>
            <dd className="mt-1 text-sm">{record.flagState}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              MLC Standard
            </dt>
            <dd className="mt-1 text-sm">{record.mlcStandard}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Compliance Area
            </dt>
            <dd className="mt-1 text-sm">{record.complianceArea}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              DMLC Part I
            </dt>
            <dd className="mt-1 text-sm">{record.dmlcPartI ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              DMLC Part II
            </dt>
            <dd className="mt-1 text-sm">{record.dmlcPartII ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Last Inspection Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.lastInspectionDate
                ? new Date(record.lastInspectionDate).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Next Inspection Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.nextInspectionDate
                ? new Date(record.nextInspectionDate).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Inspector Name
            </dt>
            <dd className="mt-1 text-sm">{record.inspectorName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Closure Deadline
            </dt>
            <dd className="mt-1 text-sm">
              {record.closureDeadline
                ? new Date(record.closureDeadline).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Certificate Number
            </dt>
            <dd className="mt-1 text-sm">{record.certificateNumber ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Certificate Issue Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.certificateIssueDate
                ? new Date(record.certificateIssueDate).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Certificate Expiry Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.certificateExpiryDate
                ? new Date(record.certificateExpiryDate).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1">{statusBadge(record.status)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
