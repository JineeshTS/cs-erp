import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { HpsForm } from "@/components/hr-payroll-shore-staff/hps-form";
import type { FieldConfig } from "@/components/hr-payroll-shore-staff/hps-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewPayrollProcessingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:create")))
    redirect("/hr-payroll-shore-staff/payroll-processings");

  const currencyOpts = await getCurrencyOptions();

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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/hr-payroll-shore-staff/payroll-processings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Payroll Processing</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <HpsForm
          entityType="Payroll Processing"
          apiPath="/api/v1/hr-payroll-shore-staff/payroll-processings"
          fields={PAYROLL_PROCESSING_FIELDS}
          returnPath="/hr-payroll-shore-staff/payroll-processings"
        />
      </div>
    </div>
  );
}
