import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDamageSurvey } from "@/lib/cargo-claims-management/service";
import { CcmForm, type FieldConfig } from "@/components/cargo-claims-management/ccm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditDamageSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:edit")))
    redirect("/");

  const vesselOpts = await getVesselOptions(session.tenantId);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
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
  const { id } = await params;
  const record = await getDamageSurvey(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/cargo-claims-management/damage-surveys/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Damage Survey
          </h1>
          <p className="text-sm text-muted-foreground">
            Update damage survey {record.surveyRef}
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <CcmForm
          entityType="Damage Survey"
          apiPath={`/api/v1/cargo-claims-management/damage-surveys/${id}`}
          returnPath={`/cargo-claims-management/damage-surveys/${id}`}
          fields={DAMAGE_SURVEY_FIELDS}
          isEdit
          initialData={{
            surveyType: record.surveyType ?? "",
            claimId: record.claimId ?? "",
            vesselName: record.vesselName ?? "",
            surveyorName: record.surveyorName ?? "",
            surveyorCompany: record.surveyorCompany ?? "",
            surveyDate: record.surveyDate
              ? new Date(record.surveyDate).toISOString()
              : "",
            surveyLocation: record.surveyLocation ?? "",
            damageType: record.damageType ?? "",
            damageExtent: record.damageExtent ?? "",
            estimatedDamageUsd: record.estimatedDamageUsd ?? "",
            containerCondition: record.containerCondition ?? "",
            sealCondition: record.sealCondition ?? "",
            photosAttached: record.photosAttached ?? false,
            reportReceived: record.reportReceived ?? false,
            reportDate: record.reportDate
              ? new Date(record.reportDate).toISOString()
              : "",
            notes: record.notes ?? "",
          }}
        />
      </div>
    </div>
  );
}
