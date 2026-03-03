import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPayrollProcessing } from "@/lib/hr-payroll-shore-staff/service";
import { HpsForm } from "@/components/hr-payroll-shore-staff/hps-form";
import type { FieldConfig } from "@/components/hr-payroll-shore-staff/hps-form";

const PAYROLL_PROCESSING_FIELDS: FieldConfig[] = [
  {
    name: "payrollType",
    label: "Payroll Type",
    type: "select",
    required: true,
    options: [
      { value: "monthly", label: "Monthly" },
      { value: "supplementary", label: "Supplementary" },
      { value: "final_settlement", label: "Final Settlement" },
      { value: "bonus", label: "Bonus" },
    ],
  },
  { name: "payrollPeriod", label: "Payroll Period", type: "text", placeholder: "YYYY-MM" },
  { name: "employeeRef", label: "Employee Ref", type: "text" },
  { name: "employeeName", label: "Employee Name", type: "text" },
  { name: "basicSalary", label: "Basic Salary", type: "text" },
  { name: "housingAllowance", label: "Housing Allowance", type: "text" },
  { name: "transportAllowance", label: "Transport Allowance", type: "text" },
  { name: "otherAllowances", label: "Other Allowances", type: "text" },
  { name: "totalDeductions", label: "Total Deductions", type: "text" },
  { name: "grossPay", label: "Gross Pay", type: "text" },
  { name: "netPay", label: "Net Pay", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
  { name: "wpsFileRef", label: "WPS File Ref", type: "text" },
  { name: "wpsSubmissionDate", label: "WPS Submission Date", type: "datetime-local" },
  {
    name: "wpsStatus",
    label: "WPS Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "submitted", label: "Submitted" },
      { value: "accepted", label: "Accepted" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  { name: "bankName", label: "Bank Name", type: "text" },
  { name: "iban", label: "IBAN", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditPayrollProcessingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:edit")))
    redirect("/hr-payroll-shore-staff/payroll-processings");

  const { id } = await params;

  const record = await getPayrollProcessing(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/hr-payroll-shore-staff/payroll-processings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Payroll Processing</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <HpsForm
          entityType="Payroll Processing"
          apiPath={`/api/v1/hr-payroll-shore-staff/payroll-processings/${id}`}
          fields={PAYROLL_PROCESSING_FIELDS}
          initialData={{
            payrollType: record.payrollType,
            payrollPeriod: record.payrollPeriod ?? "",
            employeeRef: record.employeeRef ?? "",
            employeeName: record.employeeName ?? "",
            basicSalary: record.basicSalary ?? "",
            housingAllowance: record.housingAllowance ?? "",
            transportAllowance: record.transportAllowance ?? "",
            otherAllowances: record.otherAllowances ?? "",
            totalDeductions: record.totalDeductions ?? "",
            grossPay: record.grossPay ?? "",
            netPay: record.netPay ?? "",
            currency: record.currency ?? "",
            wpsFileRef: record.wpsFileRef ?? "",
            wpsSubmissionDate: record.wpsSubmissionDate
              ? record.wpsSubmissionDate.toISOString()
              : "",
            wpsStatus: record.wpsStatus ?? "",
            bankName: record.bankName ?? "",
            iban: record.iban ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/hr-payroll-shore-staff/payroll-processings/${id}`}
        />
      </div>
    </div>
  );
}
