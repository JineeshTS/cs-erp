import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";

const fields: FieldConfig[] = [
  {
    name: "afsType",
    label: "AFS Type",
    type: "select",
    options: [
      { label: "Initial Survey", value: "initial_survey" },
      { label: "Renewal Survey", value: "renewal_survey" },
      { label: "Endorsement", value: "endorsement" },
      { label: "Declaration", value: "declaration" },
      { label: "Compliance Check", value: "compliance_check" },
    ],
    required: true,
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "imoNumber", label: "IMO Number", type: "text", required: true },
  { name: "coatingType", label: "Coating Type", type: "text" },
  { name: "applicationDate", label: "Application Date", type: "datetime-local" },
  { name: "surveyDate", label: "Survey Date", type: "datetime-local" },
  { name: "certificateNumber", label: "Certificate Number", type: "text" },
  { name: "issuingAuthority", label: "Issuing Authority", type: "text" },
  { name: "isTbtFree", label: "TBT Free", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewAntiFoulingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Anti-Fouling</h1>
      <MecForm
        entityType="anti-fouling"
        apiPath="/api/v1/marpol-environmental-compliance/anti-foulings"
        fields={fields}
        returnPath="/marpol-environmental-compliance/anti-foulings"
      />
    </div>
  );
}
