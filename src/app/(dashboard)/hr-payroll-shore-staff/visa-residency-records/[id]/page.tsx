import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVisaResidencyRecord } from "@/lib/hr-payroll-shore-staff/service";
import { Badge } from "@/components/ui/badge";

function formatAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function statusBadgeVariant(status: string) {
  if (status === "active" || status === "approved") return "success" as const;
  if (status === "expired" || status === "cancelled" || status === "revoked")
    return "destructive" as const;
  if (status === "pending" || status === "in_process")
    return "warning" as const;
  return "secondary" as const;
}

export default async function VisaResidencyRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:read")))
    redirect("/hr-payroll-shore-staff");

  const { id } = await params;

  const record = await getVisaResidencyRecord(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "hr:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/hr-payroll-shore-staff/visa-residency-records"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Visa & Residency Record
          </h1>
          <p className="text-sm text-gray-500">{record.visaRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/hr-payroll-shore-staff/visa-residency-records/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Visa Ref</dt>
            <dd className="mt-1 text-gray-900">{record.visaRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Visa Type</dt>
            <dd className="mt-1 text-gray-900">{record.visaType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Employee Ref</dt>
            <dd className="mt-1 text-gray-900">
              {record.employeeRef ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Employee Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.employeeName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Passport Number
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.passportNumber ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Nationality</dt>
            <dd className="mt-1 text-gray-900">
              {record.nationality ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.issueDate
                ? new Date(record.issueDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.expiryDate
                ? new Date(record.expiryDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Sponsor Name
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.sponsorName ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sponsor ID</dt>
            <dd className="mt-1 text-gray-900">
              {record.sponsorId ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Residency Permit No
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.residencyPermitNo ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Residency Issue Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.residencyIssueDate
                ? new Date(record.residencyIssueDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Residency Expiry Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.residencyExpiryDate
                ? new Date(record.residencyExpiryDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Medical Status
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.medicalStatus ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Medical Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.medicalDate
                ? new Date(record.medicalDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Biometric Status
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.biometricStatus ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Biometric Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.biometricDate
                ? new Date(record.biometricDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Renewal Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.renewalDate
                ? new Date(record.renewalDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Cost</dt>
            <dd className="mt-1 text-gray-900">
              {formatAmount(record.cost)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusBadgeVariant(record.status)}>
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
