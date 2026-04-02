import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getComplianceRecord } from "@/lib/vessel-technical-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "valid":
      return <Badge variant="success">{status}</Badge>;
    case "expired":
    case "suspended":
    case "withdrawn":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-gray-100 py-3 dark:border-gray-800">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="col-span-2 text-sm text-gray-900 dark:text-gray-100">
        {value ?? "-"}
      </dd>
    </div>
  );
}

export default async function ComplianceRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:read")))
    redirect("/");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "technical:edit"
  );

  const { id } = await params;
  const record = await getComplianceRecord(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/vessel-technical-management/compliance-records"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {record.recordRef}
          </h1>
          {statusBadge(record.status)}
        </div>
        {canEdit && (
          <Link
            href={`/vessel-technical-management/compliance-records/${record.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <dl className="space-y-0">
          <DetailRow label="Vessel Name" value={record.vesselName} />
          <DetailRow label="Compliance Type" value={record.complianceType} />
          <DetailRow label="Certificate Name" value={record.certificateName} />
          <DetailRow label="Certificate Number" value={record.certificateNumber} />
          <DetailRow label="Issuing Authority" value={record.issuingAuthority} />
          <DetailRow
            label="Issued Date"
            value={
              record.issuedDate
                ? new Date(record.issuedDate).toLocaleDateString()
                : null
            }
          />
          <DetailRow
            label="Expiry Date"
            value={
              record.expiryDate
                ? new Date(record.expiryDate).toLocaleDateString()
                : null
            }
          />
          <DetailRow
            label="Audit Date"
            value={
              record.auditDate
                ? new Date(record.auditDate).toLocaleDateString()
                : null
            }
          />
          <DetailRow label="Auditor Name" value={record.auditorName} />
          <DetailRow label="Non-Conformities" value={record.nonConformities} />
          <DetailRow label="Major NC" value={record.majorNc} />
          <DetailRow label="Minor NC" value={record.minorNc} />
          <DetailRow label="Observations" value={record.observations} />
          <DetailRow
            label="Closure Deadline"
            value={
              record.closureDeadline
                ? new Date(record.closureDeadline).toLocaleDateString()
                : null
            }
          />
          <DetailRow
            label="Last Inspection Date"
            value={
              record.lastInspectionDate
                ? new Date(record.lastInspectionDate).toLocaleDateString()
                : null
            }
          />
          <DetailRow
            label="Next Inspection Date"
            value={
              record.nextInspectionDate
                ? new Date(record.nextInspectionDate).toLocaleDateString()
                : null
            }
          />
          <DetailRow label="Status" value={statusBadge(record.status)} />
        </dl>
      </div>
    </div>
  );
}
