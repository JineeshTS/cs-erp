import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getWelfareMedicalRecord } from "@/lib/crew-management/service";
import { Badge } from "@/components/ui/badge";

function statusBadge(status: string) {
  switch (status) {
    case "completed":
    case "closed":
      return <Badge variant="success">{status}</Badge>;
    case "referred":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function WelfareMedicalRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:read")))
    redirect("/");

  const { id } = await params;
  const record = await getWelfareMedicalRecord(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/crew-management/welfare-medical-records"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Back to Welfare &amp; Medical Records
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {record.recordRef}
          </h1>
        </div>
        <Link
          href={`/crew-management/welfare-medical-records/${record.id}/edit`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-lg border p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Crew Member
            </dt>
            <dd className="mt-1 text-sm">{record.crewMemberName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Rank</dt>
            <dd className="mt-1 text-sm">{record.rank}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Vessel
            </dt>
            <dd className="mt-1 text-sm">{record.vesselName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Record Type
            </dt>
            <dd className="mt-1 text-sm">{record.recordType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Description
            </dt>
            <dd className="mt-1 text-sm">{record.description ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Diagnosis
            </dt>
            <dd className="mt-1 text-sm">{record.diagnosis ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Medical Provider
            </dt>
            <dd className="mt-1 text-sm">{record.medicalProviderName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Hospital
            </dt>
            <dd className="mt-1 text-sm">{record.hospitalName ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Examination Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.examinationDate
                ? new Date(record.examinationDate).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Treatment Start
            </dt>
            <dd className="mt-1 text-sm">
              {record.treatmentStartDate
                ? new Date(record.treatmentStartDate).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Treatment End
            </dt>
            <dd className="mt-1 text-sm">
              {record.treatmentEndDate
                ? new Date(record.treatmentEndDate).toLocaleDateString()
                : "\u2014"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Fit for Duty
            </dt>
            <dd className="mt-1 text-sm">{record.fitForDuty ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Restriction Notes
            </dt>
            <dd className="mt-1 text-sm">{record.restrictionNotes ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Cost Amount
            </dt>
            <dd className="mt-1 text-sm">{record.costAmount ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Currency
            </dt>
            <dd className="mt-1 text-sm">{record.currency ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Insurance Claim
            </dt>
            <dd className="mt-1 text-sm">{record.insuranceClaim ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Claim Number
            </dt>
            <dd className="mt-1 text-sm">{record.claimNumber ?? "\u2014"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Follow-Up Date
            </dt>
            <dd className="mt-1 text-sm">
              {record.followUpDate
                ? new Date(record.followUpDate).toLocaleDateString()
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
