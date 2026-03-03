import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CcmForm, type FieldConfig } from "@/components/cargo-claims-management/ccm-form";

const DAMAGE_SURVEY_FIELDS: FieldConfig[] = [
  {
    name: "surveyType",
    label: "Survey Type",
    type: "select",
    required: true,
    options: [
      { value: "joint_survey", label: "Joint Survey" },
      { value: "independent_survey", label: "Independent Survey" },
      { value: "pre_shipment", label: "Pre-Shipment" },
      { value: "discharge_survey", label: "Discharge Survey" },
      { value: "re_survey", label: "Re-Survey" },
    ],
  },
  { name: "claimId", label: "Claim ID", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "surveyorName", label: "Surveyor Name", type: "text" },
  { name: "surveyorCompany", label: "Surveyor Company", type: "text" },
  { name: "surveyDate", label: "Survey Date", type: "datetime-local" },
  { name: "surveyLocation", label: "Survey Location", type: "text" },
  { name: "damageType", label: "Damage Type", type: "text" },
  { name: "damageExtent", label: "Damage Extent", type: "text" },
  { name: "estimatedDamageUsd", label: "Estimated Damage (USD)", type: "text" },
  { name: "containerCondition", label: "Container Condition", type: "text" },
  { name: "sealCondition", label: "Seal Condition", type: "text" },
  { name: "photosAttached", label: "Photos Attached", type: "checkbox" },
  { name: "reportReceived", label: "Report Received", type: "checkbox" },
  { name: "reportDate", label: "Report Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewDamageSurveyPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/cargo-claims-management/damage-surveys"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Damage Survey
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new cargo damage survey
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <CcmForm
          entityType="Damage Survey"
          apiPath="/api/v1/cargo-claims-management/damage-surveys"
          returnPath="/cargo-claims-management/damage-surveys"
          fields={DAMAGE_SURVEY_FIELDS}
        />
      </div>
    </div>
  );
}
