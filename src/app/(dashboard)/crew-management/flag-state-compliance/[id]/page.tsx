import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getFlagStateCompliance } from "@/lib/crew-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "rectified":
      return <Badge variant="success">{status}</Badge>;
    case "detained":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function FlagStateComplianceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:read")))
    redirect("/");

  const { id } = await params;
  const record = await getFlagStateCompliance(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/crew-management/flag-state-compliance"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Flag State Compliance
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.complianceRef}
          </h1>
        </div>
        <Link
          href={`/crew-management/flag-state-compliance/${record.id}/edit`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Vessel Name
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
              Inspection Type
            </dt>
            <dd className="mt-1 text-sm">{record.inspectionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Inspection Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.inspectionDate
                ? new Date(record.inspectionDate).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Inspector Name
            </dt>
            <dd className="mt-1 text-sm">{record.inspectorName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Inspection Port
            </dt>
            <dd className="mt-1 text-sm">{record.inspectionPort}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Deficiencies Found
            </dt>
            <dd className="mt-1 text-sm">{record.deficienciesFound}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Detainable
            </dt>
            <dd className="mt-1 text-sm">
              {record.detainable ? (
                <Badge variant="destructive">Yes</Badge>
              ) : (
                <Badge variant="secondary">No</Badge>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Report Number
            </dt>
            <dd className="mt-1 text-sm">{record.reportNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Rectification Deadline
            </dt>
            <dd className="mt-1 text-sm">
              {record.rectificationDeadline
                ? new Date(record.rectificationDeadline).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Rectified Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.rectifiedDate
                ? new Date(record.rectifiedDate).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Next Inspection Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.nextInspectionDate
                ? new Date(record.nextInspectionDate).toLocaleDateString()
                : "—"}
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
