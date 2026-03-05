import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect, notFound } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";
import { getAnnexCompliance } from "@/lib/marpol-environmental-compliance/service";

const fields: FieldConfig[] = [
  {
    name: "complianceType",
    label: "Compliance Type",
    type: "select",
    options: [
      { label: "Annex I - Oil", value: "annex_i_oil" },
      { label: "Annex II - NLS", value: "annex_ii_nls" },
      { label: "Annex III - Harmful", value: "annex_iii_harmful" },
      { label: "Annex IV - Sewage", value: "annex_iv_sewage" },
      { label: "Annex V - Garbage", value: "annex_v_garbage" },
      { label: "Annex VI - Air", value: "annex_vi_air" },
    ],
    required: true,
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "imoNumber", label: "IMO Number", type: "text", required: true },
  { name: "inspectionDate", label: "Inspection Date", type: "datetime-local" },
  { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
  { name: "certificateNumber", label: "Certificate Number", type: "text" },
  { name: "issuingAuthority", label: "Issuing Authority", type: "text" },
  { name: "isCompliant", label: "Is Compliant", type: "checkbox" },
  { name: "findingsCount", label: "Findings Count", type: "number" },
  { name: "correctiveActions", label: "Corrective Actions", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditAnnexCompliancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getAnnexCompliance(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Annex Compliance</h1>
      <MecForm
        entityType="annex-compliance"
        apiPath="/api/v1/marpol-environmental-compliance/annex-compliances"
        fields={fields}
        initialData={record as unknown as Record<string, unknown>}
        isEdit
        returnPath="/marpol-environmental-compliance/annex-compliances"
      />
    </div>
  );
}
