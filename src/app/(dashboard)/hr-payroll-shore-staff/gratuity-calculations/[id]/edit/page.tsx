import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getGratuityCalculation } from "@/lib/hr-payroll-shore-staff/service";
import { HpsForm } from "@/components/hr-payroll-shore-staff/hps-form";
import type { FieldConfig } from "@/components/hr-payroll-shore-staff/hps-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditGratuityCalculationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:edit")))
    redirect("/hr-payroll-shore-staff/gratuity-calculations");

  const currencyOpts = await getCurrencyOptions();

  const GRATUITY_FIELDS: FieldConfig[] = [
    {
      name: "calculationType",
      label: "Calculation Type",
      type: "select",
      required: true,
      options: [
        { value: "resignation", label: "Resignation" },
        { value: "termination", label: "Termination" },
        { value: "retirement", label: "Retirement" },
        { value: "end_of_contract", label: "End of Contract" },
        { value: "death", label: "Death" },
      ],
    },
    {
      name: "employeeRef",
      label: "Employee Ref",
      type: "text",
      placeholder: "Employee reference",
    },
    {
      name: "employeeName",
      label: "Employee Name",
      type: "text",
      placeholder: "Full name",
    },
    {
      name: "joinDate",
      label: "Join Date",
      type: "datetime-local",
    },
    {
      name: "lastWorkingDate",
      label: "Last Working Date",
      type: "datetime-local",
    },
    {
      name: "totalYears",
      label: "Total Years",
      type: "text",
      placeholder: "e.g. 5.50",
    },
    {
      name: "totalMonths",
      label: "Total Months",
      type: "number",
      placeholder: "e.g. 66",
    },
    {
      name: "basicSalary",
      label: "Basic Salary",
      type: "text",
      placeholder: "e.g. 15000.00",
    },
    {
      name: "gratuityRate",
      label: "Gratuity Rate",
      type: "text",
      placeholder: "e.g. 1.0000",
    },
    {
      name: "grossGratuity",
      label: "Gross Gratuity",
      type: "text",
      placeholder: "e.g. 75000.00",
    },
    {
      name: "deductions",
      label: "Deductions",
      type: "text",
      placeholder: "e.g. 5000.00",
    },
    {
      name: "netGratuity",
      label: "Net Gratuity",
      type: "text",
      placeholder: "e.g. 70000.00",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "calculationMethod",
      label: "Calculation Method",
      type: "text",
      placeholder: "e.g. qatar_labor_law",
    },
    {
      name: "approvedBy",
      label: "Approved By",
      type: "text",
      placeholder: "Approver name",
    },
    {
      name: "approvalDate",
      label: "Approval Date",
      type: "datetime-local",
    },
    {
      name: "paymentDate",
      label: "Payment Date",
      type: "datetime-local",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];
  const { id } = await params;

  const record = await getGratuityCalculation(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/hr-payroll-shore-staff/gratuity-calculations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Gratuity Calculation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <HpsForm
          entityType="Gratuity Calculation"
          apiPath={`/api/v1/hr-payroll-shore-staff/gratuity-calculations/${id}`}
          fields={GRATUITY_FIELDS}
          initialData={{
            calculationType: record.calculationType,
            employeeRef: record.employeeRef ?? "",
            employeeName: record.employeeName ?? "",
            joinDate: record.joinDate
              ? record.joinDate.toISOString()
              : "",
            lastWorkingDate: record.lastWorkingDate
              ? record.lastWorkingDate.toISOString()
              : "",
            totalYears: record.totalYears ?? "",
            totalMonths: record.totalMonths ?? "",
            basicSalary: record.basicSalary ?? "",
            gratuityRate: record.gratuityRate ?? "",
            grossGratuity: record.grossGratuity ?? "",
            deductions: record.deductions ?? "",
            netGratuity: record.netGratuity ?? "",
            currency: record.currency ?? "",
            calculationMethod: record.calculationMethod ?? "",
            approvedBy: record.approvedBy ?? "",
            approvalDate: record.approvalDate
              ? record.approvalDate.toISOString()
              : "",
            paymentDate: record.paymentDate
              ? record.paymentDate.toISOString()
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/hr-payroll-shore-staff/gratuity-calculations/${id}`}
        />
      </div>
    </div>
  );
}
