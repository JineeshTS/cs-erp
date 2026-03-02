import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Thermometer } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getReeferPtiSurvey } from "@/lib/survey-inspection-management/service";
import { SimForm } from "@/components/survey-inspection-management/sim-form";
import type { FieldConfig } from "@/components/survey-inspection-management/sim-form";

const fields: FieldConfig[] = [
  {
    name: "surveyType",
    label: "Survey Type",
    type: "select",
    required: true,
    options: [
      { value: "pti", label: "PTI" },
      { value: "periodic", label: "Periodic" },
      { value: "complaint", label: "Complaint" },
      { value: "pre_trip", label: "Pre-Trip" },
    ],
  },
  { name: "containerNumber", label: "Container Number", type: "text", required: true },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "unitManufacturer", label: "Unit Manufacturer", type: "text" },
  { name: "unitModel", label: "Unit Model", type: "text" },
  { name: "unitSerialNumber", label: "Unit Serial Number", type: "text" },
  { name: "depotName", label: "Depot Name", type: "text" },
  { name: "depotLocation", label: "Depot Location", type: "text" },
  { name: "setPointTemp", label: "Set Point Temp", type: "text", placeholder: "0.00" },
  { name: "supplyAirTemp", label: "Supply Air Temp", type: "text", placeholder: "0.00" },
  { name: "returnAirTemp", label: "Return Air Temp", type: "text", placeholder: "0.00" },
  { name: "ambientTemp", label: "Ambient Temp", type: "text", placeholder: "0.00" },
  { name: "humidityPercent", label: "Humidity Percent", type: "text", placeholder: "0.00" },
  { name: "ventSetting", label: "Vent Setting", type: "text" },
  { name: "defrostOk", label: "Defrost Ok", type: "checkbox" },
  { name: "compressorOk", label: "Compressor Ok", type: "checkbox" },
  { name: "condenserOk", label: "Condenser Ok", type: "checkbox" },
  { name: "evaporatorOk", label: "Evaporator Ok", type: "checkbox" },
  { name: "controllerOk", label: "Controller Ok", type: "checkbox" },
  { name: "gasketOk", label: "Gasket Ok", type: "checkbox" },
  { name: "powerSupplyOk", label: "Power Supply Ok", type: "checkbox" },
  { name: "dataLoggerDownloaded", label: "Data Logger Downloaded", type: "checkbox" },
  {
    name: "overallResult",
    label: "Overall Result",
    type: "select",
    options: [
      { value: "pass", label: "Pass" },
      { value: "fail", label: "Fail" },
      { value: "conditional", label: "Conditional" },
    ],
  },
  { name: "technicianName", label: "Technician Name", type: "text" },
  { name: "technicianCompany", label: "Technician Company", type: "text" },
  { name: "scheduledAt", label: "Scheduled At", type: "datetime-local" },
  { name: "completedAt", label: "Completed At", type: "datetime-local" },
  { name: "nextPtiDue", label: "Next PTI Due", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditReeferPtiSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "survey:edit"))) redirect("/login");

  const { id } = await params;
  const record = await getReeferPtiSurvey(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, string | number | boolean> = {
    surveyType: record.surveyType ?? "",
    containerNumber: record.containerNumber ?? "",
    containerType: record.containerType ?? "",
    unitManufacturer: record.unitManufacturer ?? "",
    unitModel: record.unitModel ?? "",
    unitSerialNumber: record.unitSerialNumber ?? "",
    depotName: record.depotName ?? "",
    depotLocation: record.depotLocation ?? "",
    setPointTemp: record.setPointTemp ?? "",
    supplyAirTemp: record.supplyAirTemp ?? "",
    returnAirTemp: record.returnAirTemp ?? "",
    ambientTemp: record.ambientTemp ?? "",
    humidityPercent: record.humidityPercent ?? "",
    ventSetting: record.ventSetting ?? "",
    defrostOk: record.defrostOk ?? false,
    compressorOk: record.compressorOk ?? false,
    condenserOk: record.condenserOk ?? false,
    evaporatorOk: record.evaporatorOk ?? false,
    controllerOk: record.controllerOk ?? false,
    gasketOk: record.gasketOk ?? false,
    powerSupplyOk: record.powerSupplyOk ?? false,
    dataLoggerDownloaded: record.dataLoggerDownloaded ?? false,
    overallResult: record.overallResult ?? "",
    technicianName: record.technicianName ?? "",
    technicianCompany: record.technicianCompany ?? "",
    scheduledAt: record.scheduledAt?.toISOString() ?? "",
    completedAt: record.completedAt?.toISOString() ?? "",
    nextPtiDue: record.nextPtiDue?.toISOString() ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/survey-inspection-management/reefer-pti-surveys/${record.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Thermometer className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit {record.surveyRef}</h1>
          <p className="text-sm text-muted-foreground">
            Update reefer PTI survey details
          </p>
        </div>
      </div>

      <SimForm
        entityType="Reefer PTI Survey"
        apiPath={`/api/v1/survey-inspection-management/reefer-pti-surveys/${id}`}
        fields={fields}
        initialData={initialData}
        isEdit
        returnPath={`/survey-inspection-management/reefer-pti-surveys/${id}`}
      />
    </div>
  );
}
