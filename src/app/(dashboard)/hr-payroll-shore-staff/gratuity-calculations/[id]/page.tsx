import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getGratuityCalculation } from "@/lib/hr-payroll-shore-staff/service";
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
  if (status === "approved" || status === "paid") return "success" as const;
  if (status === "rejected" || status === "cancelled")
    return "destructive" as const;
  if (status === "pending" || status === "in_review") return "warning" as const;
  return "secondary" as const;
}

export default async function GratuityCalculationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:read")))
    redirect("/hr-payroll-shore-staff");

  const { id } = await params;

  const record = await getGratuityCalculation(id, session.tenantId);
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
          href="/hr-payroll-shore-staff/gratuity-calculations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Gratuity Calculation
          </h1>
          <p className="text-sm text-gray-500">{record.calculationRef}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/hr-payroll-shore-staff/gratuity-calculations/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">
              Calculation Ref
            </dt>
            <dd className="mt-1 text-gray-900">{record.calculationRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Calculation Type
            </dt>
            <dd className="mt-1 text-gray-900">{record.calculationType}</dd>
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
            <dt className="text-sm font-medium text-gray-500">Join Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.joinDate
                ? new Date(record.joinDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Working Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.lastWorkingDate
                ? new Date(record.lastWorkingDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Years</dt>
            <dd className="mt-1 text-gray-900">{record.totalYears ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Months</dt>
            <dd className="mt-1 text-gray-900">
              {record.totalMonths ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Basic Salary</dt>
            <dd className="mt-1 text-gray-900">
              {formatAmount(record.basicSalary)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gratuity Rate
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.gratuityRate ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Gross Gratuity
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatAmount(record.grossGratuity)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Deductions</dt>
            <dd className="mt-1 text-gray-900">
              {formatAmount(record.deductions)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Net Gratuity
            </dt>
            <dd className="mt-1 text-gray-900">
              {formatAmount(record.netGratuity)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-gray-900">{record.currency ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Calculation Method
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.calculationMethod ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-gray-900">
              {record.approvedBy ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Approval Date
            </dt>
            <dd className="mt-1 text-gray-900">
              {record.approvalDate
                ? new Date(record.approvalDate).toLocaleDateString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.paymentDate
                ? new Date(record.paymentDate).toLocaleDateString()
                : "-"}
            </dd>
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
