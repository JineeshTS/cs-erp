import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { HpsForm } from "@/components/hr-payroll-shore-staff/hps-form";
import type { FieldConfig } from "@/components/hr-payroll-shore-staff/hps-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewSocialInsuranceRecordPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:create")))
    redirect("/hr-payroll-shore-staff/social-insurance-records");

  const currencyOpts = await getCurrencyOptions();

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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/hr-payroll-shore-staff/social-insurance-records"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Social Insurance Record</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <HpsForm
          entityType="Social Insurance Record"
          apiPath="/api/v1/hr-payroll-shore-staff/social-insurance-records"
          fields={SOCIAL_INSURANCE_FIELDS}
          returnPath="/hr-payroll-shore-staff/social-insurance-records"
        />
      </div>
    </div>
  );
}
