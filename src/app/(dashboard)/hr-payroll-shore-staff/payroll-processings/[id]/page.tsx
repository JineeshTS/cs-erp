import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPayrollProcessing } from "@/lib/hr-payroll-shore-staff/service";
import { Badge } from "@/components/ui/badge";

function formatAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function PayrollProcessingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:read")))
    redirect("/hr-payroll-shore-staff");

  const { id } = await params;

  const record = await getPayrollProcessing(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "hr:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/hr-payroll-shore-staff/payroll-processings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.payrollRef}</h1>
          <p className="text-sm text-gray-500">Payroll Processing Details</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/hr-payroll-shore-staff/payroll-processings/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Payroll Ref</dt>
            <dd className="mt-1 text-gray-900">{record.payrollRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Payroll Type</dt>
            <dd className="mt-1 text-gray-900">{record.payrollType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Payroll Period</dt>
            <dd className="mt-1 text-gray-900">{record.payrollPeriod || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Employee Ref</dt>
            <dd className="mt-1 text-gray-900">{record.employeeRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Employee Name</dt>
            <dd className="mt-1 text-gray-900">{record.employeeName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Basic Salary</dt>
            <dd className="mt-1 text-gray-900">{formatAmount(record.basicSalary)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Housing Allowance</dt>
            <dd className="mt-1 text-gray-900">{formatAmount(record.housingAllowance)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Transport Allowance</dt>
            <dd className="mt-1 text-gray-900">{formatAmount(record.transportAllowance)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Other Allowances</dt>
            <dd className="mt-1 text-gray-900">{formatAmount(record.otherAllowances)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Allowances</dt>
            <dd className="mt-1 text-gray-900">{formatAmount(record.totalAllowances)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Deductions</dt>
            <dd className="mt-1 text-gray-900">{formatAmount(record.totalDeductions)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gross Pay</dt>
            <dd className="mt-1 text-gray-900">{formatAmount(record.grossPay)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Net Pay</dt>
            <dd className="mt-1 text-gray-900 font-semibold">{formatAmount(record.netPay)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">WPS File Ref</dt>
            <dd className="mt-1 text-gray-900">{record.wpsFileRef || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">WPS Submission Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.wpsSubmissionDate ? new Date(record.wpsSubmissionDate).toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">WPS Status</dt>
            <dd className="mt-1">
              {record.wpsStatus ? (
                <Badge
                  variant={
                    record.wpsStatus === "accepted"
                      ? "success"
                      : record.wpsStatus === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {record.wpsStatus}
                </Badge>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
            <dd className="mt-1 text-gray-900">{record.bankName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IBAN</dt>
            <dd className="mt-1 text-gray-900">{record.iban || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "approved" || record.status === "processed"
                    ? "success"
                    : record.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">{record.createdAt.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">{record.updatedAt.toLocaleString()}</dd>
          </div>
          {record.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">{record.notes}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
