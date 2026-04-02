import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { HpsForm } from "@/components/hr-payroll-shore-staff/hps-form";
import type { FieldConfig } from "@/components/hr-payroll-shore-staff/hps-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewVisaResidencyRecordPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:create")))
    redirect("/hr-payroll-shore-staff/visa-residency-records");

  const currencyOpts = await getCurrencyOptions();

  const VISA_FIELDS: FieldConfig[] = [
    {
      name: "visaType",
      label: "Visa Type",
      type: "select",
      required: true,
      options: [
        { value: "employment", label: "Employment" },
        { value: "visit", label: "Visit" },
        { value: "transit", label: "Transit" },
        { value: "family", label: "Family" },
        { value: "investor", label: "Investor" },
        { value: "golden", label: "Golden" },
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
      name: "passportNumber",
      label: "Passport Number",
      type: "text",
      placeholder: "Passport number",
    },
    {
      name: "nationality",
      label: "Nationality",
      type: "text",
      placeholder: "e.g. Qatari",
    },
    {
      name: "issueDate",
      label: "Issue Date",
      type: "datetime-local",
    },
    {
      name: "expiryDate",
      label: "Expiry Date",
      type: "datetime-local",
    },
    {
      name: "sponsorName",
      label: "Sponsor Name",
      type: "text",
      placeholder: "Sponsor name",
    },
    {
      name: "sponsorId",
      label: "Sponsor ID",
      type: "text",
      placeholder: "Sponsor ID number",
    },
    {
      name: "residencyPermitNo",
      label: "Residency Permit No",
      type: "text",
      placeholder: "Residency permit number",
    },
    {
      name: "residencyIssueDate",
      label: "Residency Issue Date",
      type: "datetime-local",
    },
    {
      name: "residencyExpiryDate",
      label: "Residency Expiry Date",
      type: "datetime-local",
    },
    {
      name: "medicalStatus",
      label: "Medical Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "cleared", label: "Cleared" },
        { value: "failed", label: "Failed" },
      ],
    },
    {
      name: "medicalDate",
      label: "Medical Date",
      type: "datetime-local",
    },
    {
      name: "biometricStatus",
      label: "Biometric Status",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "completed", label: "Completed" },
      ],
    },
    {
      name: "biometricDate",
      label: "Biometric Date",
      type: "datetime-local",
    },
    {
      name: "renewalDate",
      label: "Renewal Date",
      type: "datetime-local",
    },
    {
      name: "cost",
      label: "Cost",
      type: "text",
      placeholder: "e.g. 2500.00",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/hr-payroll-shore-staff/visa-residency-records"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Visa & Residency Record
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <HpsForm
          entityType="Visa & Residency Record"
          apiPath="/api/v1/hr-payroll-shore-staff/visa-residency-records"
          fields={VISA_FIELDS}
          returnPath="/hr-payroll-shore-staff/visa-residency-records"
        />
      </div>
    </div>
  );
}
