import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect, notFound } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";
import { getAntiFouling } from "@/lib/marpol-environmental-compliance/service";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditAntiFoulingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:edit")))
    redirect("/");

  const vesselOpts = await getVesselOptions(session.tenantId);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "imoNumber", label: "IMO Number", type: "text", required: true },
    { name: "coatingType", label: "Coating Type", type: "text" },
    { name: "applicationDate", label: "Application Date", type: "datetime-local" },
    { name: "surveyDate", label: "Survey Date", type: "datetime-local" },
    { name: "certificateNumber", label: "Certificate Number", type: "text" },
    { name: "issuingAuthority", label: "Issuing Authority", type: "text" },
    { name: "isTbtFree", label: "TBT Free", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await getAntiFouling(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Anti-Fouling</h1>
      <MecForm
        entityType="anti-fouling"
        apiPath={`/api/v1/marpol-environmental-compliance/anti-foulings/${id}`}
        fields={fields}
        initialData={{
          afsType: record.afsType ?? "",
          title: record.title ?? "",
          vesselName: record.vesselName ?? "",
          imoNumber: record.imoNumber ?? "",
          coatingType: record.coatingType ?? "",
          applicationDate: record.applicationDate ?? "",
          surveyDate: record.surveyDate ?? "",
          certificateNumber: record.certificateNumber ?? "",
          issuingAuthority: record.issuingAuthority ?? "",
          isTbtFree: record.isTbtFree ?? false,
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/marpol-environmental-compliance/anti-foulings/${id}`}
      />
    </div>
  );
}
