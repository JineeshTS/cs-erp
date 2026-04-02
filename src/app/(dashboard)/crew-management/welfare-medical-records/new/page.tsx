import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CrmForm } from "@/components/crew-management/crm-form";
import type { FieldConfig } from "@/components/crew-management/crm-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewWelfareMedicalRecordPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:create")))
    redirect("/");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const fields: FieldConfig[] = [
    { name: "crewMemberName", label: "Crew Member Name", type: "text", required: true },
    { name: "rank", label: "Rank", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    {
      name: "recordType",
      label: "Record Type",
      type: "select",
      required: true,
      options: [
        { value: "medical_exam", label: "Medical Exam" },
        { value: "injury", label: "Injury" },
        { value: "illness", label: "Illness" },
        { value: "welfare", label: "Welfare" },
        { value: "counseling", label: "Counseling" },
        { value: "dental", label: "Dental" },
        { value: "eye", label: "Eye" },
      ],
    },
    { name: "description", label: "Description", type: "textarea" },
    { name: "diagnosis", label: "Diagnosis", type: "textarea" },
    { name: "medicalProviderName", label: "Medical Provider Name", type: "text" },
    { name: "hospitalName", label: "Hospital Name", type: "text" },
    { name: "examinationDate", label: "Examination Date", type: "datetime-local" },
    { name: "treatmentStartDate", label: "Treatment Start Date", type: "datetime-local" },
    { name: "treatmentEndDate", label: "Treatment End Date", type: "datetime-local" },
    { name: "fitForDuty", label: "Fit for Duty", type: "checkbox" },
    { name: "restrictionNotes", label: "Restriction Notes", type: "textarea" },
    { name: "costAmount", label: "Cost Amount", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "insuranceClaim", label: "Insurance Claim", type: "checkbox" },
    { name: "claimNumber", label: "Claim Number", type: "text" },
    { name: "followUpDate", label: "Follow-Up Date", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/crew-management/welfare-medical-records"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Welfare &amp; Medical Records
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          New Welfare &amp; Medical Record
        </h1>
      </div>

      <CrmForm
        entityType="Welfare Medical Record"
        apiPath="/api/v1/crew-management/welfare-medical-records"
        fields={fields}
        returnPath="/crew-management/welfare-medical-records"
      />
    </div>
  );
}
