import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPscPreparation } from "@/lib/customs-compliance-regulatory/service";
import { CcrForm } from "@/components/customs-compliance-regulatory/ccr-form";
import type { FieldConfig } from "@/components/customs-compliance-regulatory/ccr-form";
import React from "react";

const FIELDS: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "flagState", label: "Flag State", type: "text" },
  { name: "classificationSociety", label: "Classification Society", type: "text" },
  { name: "inspectionPort", label: "Inspection Port", type: "text", required: true },
  { name: "inspectionDate", label: "Inspection Date", type: "datetime-local" },
  { name: "inspectorName", label: "Inspector Name", type: "text" },
  {
    name: "inspectionType",
    label: "Inspection Type",
    type: "select",
    options: [
      { value: "initial", label: "Initial" },
      { value: "expanded", label: "Expanded" },
      { value: "detailed", label: "Detailed" },
      { value: "follow_up", label: "Follow-up" },
    ],
  },
  {
    name: "mouRegime",
    label: "MOU Regime",
    type: "select",
    options: [
      { value: "paris_mou", label: "Paris MOU" },
      { value: "tokyo_mou", label: "Tokyo MOU" },
      { value: "indian_ocean_mou", label: "Indian Ocean MOU" },
      { value: "riyadh_mou", label: "Riyadh MOU" },
    ],
  },
  { name: "targetFactor", label: "Target Factor", type: "text", placeholder: "0.0000" },
  { name: "deficienciesFound", label: "Deficiencies Found", type: "number" },
  { name: "detentionIssued", label: "Detention Issued", type: "checkbox" },
  { name: "detentionReason", label: "Detention Reason", type: "textarea" },
  { name: "rectifiedAt", label: "Rectified At", type: "datetime-local" },
  {
    name: "overallResult",
    label: "Overall Result",
    type: "select",
    options: [
      { value: "clear", label: "Clear" },
      { value: "deficiency", label: "Deficiency" },
      { value: "detention", label: "Detention" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditPscPreparationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customs:edit")))
    redirect("/customs-compliance-regulatory/psc-preparations");

  const { id } = await params;

  const record = await getPscPreparation(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/customs-compliance-regulatory/psc-preparations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit PSC Preparation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CcrForm
          entityType="PSC Preparation"
          apiPath={`/api/v1/customs-compliance-regulatory/psc-preparations/${id}`}
          fields={FIELDS}
          initialData={{
            vesselName: record.vesselName ?? "",
            imoNumber: record.imoNumber ?? "",
            flagState: record.flagState ?? "",
            classificationSociety: record.classificationSociety ?? "",
            inspectionPort: record.inspectionPort ?? "",
            inspectionDate: record.inspectionDate?.toISOString() ?? "",
            inspectorName: record.inspectorName ?? "",
            inspectionType: record.inspectionType ?? "",
            mouRegime: record.mouRegime ?? "",
            targetFactor: record.targetFactor ?? "",
            deficienciesFound: record.deficienciesFound ? Number(record.deficienciesFound) : "",
            detentionIssued: record.detentionIssued ?? false,
            detentionReason: record.detentionReason ?? "",
            rectifiedAt: record.rectifiedAt?.toISOString() ?? "",
            overallResult: record.overallResult ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/customs-compliance-regulatory/psc-preparations/${id}`}
        />
      </div>
    </div>
  );
}
