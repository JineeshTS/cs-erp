import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSocialInsuranceRecord } from "@/lib/hr-payroll-shore-staff/service";
import { HpsForm } from "@/components/hr-payroll-shore-staff/hps-form";
import type { FieldConfig } from "@/components/hr-payroll-shore-staff/hps-form";

const SOCIAL_INSURANCE_FIELDS: FieldConfig[] = [
  {
    name: "recordType",
    label: "Record Type",
    type: "select",
    required: true,
    options: [
      { value: "gosi", label: "GOSI" },
      { value: "pifss", label: "PIFSS" },
      { value: "epf", label: "EPF" },
      { value: "pension", label: "Pension" },
      { value: "social_security", label: "Social Security" },
    ],
  },
  { name: "employeeRef", label: "Employee Ref", type: "text" },
  { name: "employeeName", label: "Employee Name", type: "text" },
  { name: "schemeName", label: "Scheme Name", type: "text" },
  { name: "registrationNumber", label: "Registration Number", type: "text" },
  { name: "contributionPeriod", label: "Contribution Period", type: "text", placeholder: "YYYY-MM" },
  { name: "employeeContribution", label: "Employee Contribution", type: "text" },
  { name: "employerContribution", label: "Employer Contribution", type: "text" },
  { name: "totalContribution", label: "Total Contribution", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
  { name: "contributionRate", label: "Contribution Rate", type: "text" },
  { name: "baseSalary", label: "Base Salary", type: "text" },
  { name: "filingDate", label: "Filing Date", type: "datetime-local" },
  { name: "filingRef", label: "Filing Ref", type: "text" },
  {
    name: "filingStatus",
    label: "Filing Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "filed", label: "Filed" },
      { value: "accepted", label: "Accepted" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditSocialInsuranceRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:edit")))
    redirect("/hr-payroll-shore-staff/social-insurance-records");

  const { id } = await params;

  const record = await getSocialInsuranceRecord(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/hr-payroll-shore-staff/social-insurance-records/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Social Insurance Record</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <HpsForm
          entityType="Social Insurance Record"
          apiPath={`/api/v1/hr-payroll-shore-staff/social-insurance-records/${id}`}
          fields={SOCIAL_INSURANCE_FIELDS}
          initialData={{
            recordType: record.recordType,
            employeeRef: record.employeeRef ?? "",
            employeeName: record.employeeName ?? "",
            schemeName: record.schemeName ?? "",
            registrationNumber: record.registrationNumber ?? "",
            contributionPeriod: record.contributionPeriod ?? "",
            employeeContribution: record.employeeContribution ?? "",
            employerContribution: record.employerContribution ?? "",
            totalContribution: record.totalContribution ?? "",
            currency: record.currency ?? "",
            contributionRate: record.contributionRate ?? "",
            baseSalary: record.baseSalary ?? "",
            filingDate: record.filingDate
              ? record.filingDate.toISOString()
              : "",
            filingRef: record.filingRef ?? "",
            filingStatus: record.filingStatus ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/hr-payroll-shore-staff/social-insurance-records/${id}`}
        />
      </div>
    </div>
  );
}
