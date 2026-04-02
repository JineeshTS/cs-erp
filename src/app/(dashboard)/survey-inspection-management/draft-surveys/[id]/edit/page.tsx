import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDraftSurvey } from "@/lib/survey-inspection-management/service";
import { SimForm } from "@/components/survey-inspection-management/sim-form";
import type { FieldConfig } from "@/components/survey-inspection-management/sim-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function EditDraftSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:edit")))
    redirect("/survey-inspection-management/draft-surveys");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const FIELDS: FieldConfig[] = [
    {
      name: "surveyType",
      label: "Survey Type",
      type: "select",
      required: true,
      options: [
        { value: "initial", label: "Initial" },
        { value: "intermediate", label: "Intermediate" },
        { value: "final", label: "Final" },
      ],
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "berthName", label: "Berth Name", type: "text" },
    { name: "cargoType", label: "Cargo Type", type: "text" },
    { name: "draftFore", label: "Draft Fore", type: "text", placeholder: "0.000" },
    { name: "draftAft", label: "Draft Aft", type: "text", placeholder: "0.000" },
    { name: "draftMidPort", label: "Draft Mid Port", type: "text", placeholder: "0.000" },
    { name: "draftMidStarboard", label: "Draft Mid Starboard", type: "text", placeholder: "0.000" },
    { name: "meanDraft", label: "Mean Draft", type: "text", placeholder: "0.000" },
    { name: "trim", label: "Trim", type: "text", placeholder: "0.000" },
    { name: "displacement", label: "Displacement", type: "text", placeholder: "0.00" },
    { name: "ballastWeight", label: "Ballast Weight", type: "text", placeholder: "0.00" },
    { name: "constantsWeight", label: "Constants Weight", type: "text", placeholder: "0.00" },
    { name: "freshWaterWeight", label: "Fresh Water Weight", type: "text", placeholder: "0.00" },
    { name: "fuelWeight", label: "Fuel Weight", type: "text", placeholder: "0.00" },
    { name: "netCargoWeight", label: "Net Cargo Weight", type: "text", placeholder: "0.00" },
    { name: "waterDensity", label: "Water Density", type: "text", placeholder: "1.0250" },
    { name: "waterTemp", label: "Water Temp", type: "text", placeholder: "0.00" },
    { name: "surveyorName", label: "Surveyor Name", type: "text" },
    { name: "surveyorCompany", label: "Surveyor Company", type: "text" },
    { name: "scheduledAt", label: "Scheduled At", type: "datetime-local" },
    { name: "completedAt", label: "Completed At", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const record = await getDraftSurvey(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/survey-inspection-management/draft-surveys/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Draft Survey
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SimForm
          entityType="Draft Survey"
          apiPath={`/api/v1/survey-inspection-management/draft-surveys/${id}`}
          fields={FIELDS}
          initialData={{
            surveyType: record.surveyType ?? "",
            vesselName: record.vesselName ?? "",
            imoNumber: record.imoNumber ?? "",
            voyageNumber: record.voyageNumber ?? "",
            portName: record.portName ?? "",
            berthName: record.berthName ?? "",
            cargoType: record.cargoType ?? "",
            draftFore: record.draftFore ?? "",
            draftAft: record.draftAft ?? "",
            draftMidPort: record.draftMidPort ?? "",
            draftMidStarboard: record.draftMidStarboard ?? "",
            meanDraft: record.meanDraft ?? "",
            trim: record.trim ?? "",
            displacement: record.displacement ?? "",
            ballastWeight: record.ballastWeight ?? "",
            constantsWeight: record.constantsWeight ?? "",
            freshWaterWeight: record.freshWaterWeight ?? "",
            fuelWeight: record.fuelWeight ?? "",
            netCargoWeight: record.netCargoWeight ?? "",
            waterDensity: record.waterDensity ?? "",
            waterTemp: record.waterTemp ?? "",
            surveyorName: record.surveyorName ?? "",
            surveyorCompany: record.surveyorCompany ?? "",
            scheduledAt: record.scheduledAt?.toISOString() ?? "",
            completedAt: record.completedAt?.toISOString() ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/survey-inspection-management/draft-surveys/${id}`}
        />
      </div>
    </div>
  );
}
