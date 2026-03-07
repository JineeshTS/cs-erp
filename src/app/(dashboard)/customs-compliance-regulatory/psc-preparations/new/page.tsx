import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcrForm } from "@/components/customs-compliance-regulatory/ccr-form";
import type { FieldConfig } from "@/components/customs-compliance-regulatory/ccr-form";
import React from "react";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewPscPreparationPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "customs:create"))
  )
    redirect("/customs-compliance-regulatory/psc-preparations");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const FIELDS: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customs-compliance-regulatory/psc-preparations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New PSC Preparation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CcrForm
          entityType="PSC Preparation"
          apiPath="/api/v1/customs-compliance-regulatory/psc-preparations"
          fields={FIELDS}
          returnPath="/customs-compliance-regulatory/psc-preparations"
        />
      </div>
    </div>
  );
}
