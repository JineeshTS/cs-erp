import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHireSurvey } from "@/lib/survey-inspection-management/service";
import { SimForm } from "@/components/survey-inspection-management/sim-form";
import type { FieldConfig } from "@/components/survey-inspection-management/sim-form";

const FIELDS: FieldConfig[] = [
  {
    name: "surveyType",
    label: "Survey Type",
    type: "select",
    required: true,
    options: [
      { value: "on_hire", label: "On-Hire" },
      { value: "off_hire", label: "Off-Hire" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "chartererName", label: "Charterer Name", type: "text" },
  { name: "ownerName", label: "Owner Name", type: "text" },
  { name: "charterPartyRef", label: "Charter Party Ref", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  {
    name: "hullCondition",
    label: "Hull Condition",
    type: "select",
    options: [
      { value: "good", label: "Good" },
      { value: "fair", label: "Fair" },
      { value: "poor", label: "Poor" },
    ],
  },
  {
    name: "deckCondition",
    label: "Deck Condition",
    type: "select",
    options: [
      { value: "good", label: "Good" },
      { value: "fair", label: "Fair" },
      { value: "poor", label: "Poor" },
    ],
  },
  {
    name: "engineCondition",
    label: "Engine Condition",
    type: "select",
    options: [
      { value: "good", label: "Good" },
      { value: "fair", label: "Fair" },
      { value: "poor", label: "Poor" },
    ],
  },
  {
    name: "accommodationCondition",
    label: "Accommodation Condition",
    type: "select",
    options: [
      { value: "good", label: "Good" },
      { value: "fair", label: "Fair" },
      { value: "poor", label: "Poor" },
    ],
  },
  { name: "safetyEquipmentOk", label: "Safety Equipment OK", type: "checkbox" },
  { name: "bunkerRobFuel", label: "Bunker ROB Fuel", type: "text", placeholder: "0.00" },
  { name: "bunkerRobDiesel", label: "Bunker ROB Diesel", type: "text", placeholder: "0.00" },
  { name: "bunkerRobLubeOil", label: "Bunker ROB Lube Oil", type: "text", placeholder: "0.00" },
  { name: "freshWaterRob", label: "Fresh Water ROB", type: "text", placeholder: "0.00" },
  { name: "constantsWeight", label: "Constants Weight", type: "text", placeholder: "0.00" },
  { name: "surveyorName", label: "Surveyor Name", type: "text" },
  { name: "surveyorCompany", label: "Surveyor Company", type: "text" },
  { name: "scheduledAt", label: "Scheduled At", type: "datetime-local" },
  { name: "completedAt", label: "Completed At", type: "datetime-local" },
  { name: "deliveryDate", label: "Delivery Date", type: "datetime-local" },
  { name: "redeliveryDate", label: "Redelivery Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditHireSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:edit")))
    redirect("/survey-inspection-management/hire-surveys");

  const { id } = await params;

  const record = await getHireSurvey(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/survey-inspection-management/hire-surveys/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Hire Survey
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SimForm
          entityType="Hire Survey"
          apiPath={`/api/v1/survey-inspection-management/hire-surveys/${id}`}
          fields={FIELDS}
          initialData={{
            surveyType: record.surveyType ?? "",
            vesselName: record.vesselName ?? "",
            imoNumber: record.imoNumber ?? "",
            chartererName: record.chartererName ?? "",
            ownerName: record.ownerName ?? "",
            charterPartyRef: record.charterPartyRef ?? "",
            portName: record.portName ?? "",
            hullCondition: record.hullCondition ?? "",
            deckCondition: record.deckCondition ?? "",
            engineCondition: record.engineCondition ?? "",
            accommodationCondition: record.accommodationCondition ?? "",
            safetyEquipmentOk: record.safetyEquipmentOk ?? false,
            bunkerRobFuel: record.bunkerRobFuel ?? "",
            bunkerRobDiesel: record.bunkerRobDiesel ?? "",
            bunkerRobLubeOil: record.bunkerRobLubeOil ?? "",
            freshWaterRob: record.freshWaterRob ?? "",
            constantsWeight: record.constantsWeight ?? "",
            surveyorName: record.surveyorName ?? "",
            surveyorCompany: record.surveyorCompany ?? "",
            scheduledAt: record.scheduledAt?.toISOString() ?? "",
            completedAt: record.completedAt?.toISOString() ?? "",
            deliveryDate: record.deliveryDate?.toISOString() ?? "",
            redeliveryDate: record.redeliveryDate?.toISOString() ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/survey-inspection-management/hire-surveys/${id}`}
        />
      </div>
    </div>
  );
}
