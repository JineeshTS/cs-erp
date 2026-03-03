import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getVisaResidencyRecord } from "@/lib/hr-payroll-shore-staff/service";
import { HpsForm } from "@/components/hr-payroll-shore-staff/hps-form";
import type { FieldConfig } from "@/components/hr-payroll-shore-staff/hps-form";

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
    type: "text",
    placeholder: "e.g. QAR",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function EditVisaResidencyRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "hr:edit")))
    redirect("/hr-payroll-shore-staff/visa-residency-records");

  const { id } = await params;

  const record = await getVisaResidencyRecord(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/hr-payroll-shore-staff/visa-residency-records/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Visa & Residency Record
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <HpsForm
          entityType="Visa & Residency Record"
          apiPath={`/api/v1/hr-payroll-shore-staff/visa-residency-records/${id}`}
          fields={VISA_FIELDS}
          initialData={{
            visaType: record.visaType,
            employeeRef: record.employeeRef ?? "",
            employeeName: record.employeeName ?? "",
            passportNumber: record.passportNumber ?? "",
            nationality: record.nationality ?? "",
            issueDate: record.issueDate
              ? record.issueDate.toISOString()
              : "",
            expiryDate: record.expiryDate
              ? record.expiryDate.toISOString()
              : "",
            sponsorName: record.sponsorName ?? "",
            sponsorId: record.sponsorId ?? "",
            residencyPermitNo: record.residencyPermitNo ?? "",
            residencyIssueDate: record.residencyIssueDate
              ? record.residencyIssueDate.toISOString()
              : "",
            residencyExpiryDate: record.residencyExpiryDate
              ? record.residencyExpiryDate.toISOString()
              : "",
            medicalStatus: record.medicalStatus ?? "",
            medicalDate: record.medicalDate
              ? record.medicalDate.toISOString()
              : "",
            biometricStatus: record.biometricStatus ?? "",
            biometricDate: record.biometricDate
              ? record.biometricDate.toISOString()
              : "",
            renewalDate: record.renewalDate
              ? record.renewalDate.toISOString()
              : "",
            cost: record.cost ?? "",
            currency: record.currency ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/hr-payroll-shore-staff/visa-residency-records/${id}`}
        />
      </div>
    </div>
  );
}
