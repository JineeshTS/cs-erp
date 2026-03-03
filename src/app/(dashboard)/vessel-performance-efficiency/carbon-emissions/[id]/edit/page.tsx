import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCarbonEmission } from "@/lib/vessel-performance-efficiency/service";
import { VpeForm } from "@/components/vessel-performance-efficiency/vpe-form";
import type { FieldConfig } from "@/components/vessel-performance-efficiency/vpe-form";

const CARBON_EMISSION_FIELDS: FieldConfig[] = [
  {
    name: "emissionType",
    label: "Emission Type",
    type: "select",
    required: true,
    options: [
      { value: "voyage", label: "Voyage" },
      { value: "annual", label: "Annual" },
      { value: "fleet", label: "Fleet" },
      { value: "well_to_wake", label: "Well to Wake" },
      { value: "tank_to_wake", label: "Tank to Wake" },
    ],
  },
  { name: "vesselId", label: "Vessel ID", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageId", label: "Voyage ID", type: "text" },
  {
    name: "reportingPeriodStart",
    label: "Reporting Period Start",
    type: "datetime-local",
  },
  {
    name: "reportingPeriodEnd",
    label: "Reporting Period End",
    type: "datetime-local",
  },
  { name: "totalCo2Mt", label: "Total CO2 MT", type: "text" },
  { name: "totalCh4Mt", label: "Total CH4 MT", type: "text" },
  { name: "totalN2oMt", label: "Total N2O MT", type: "text" },
  { name: "co2eTotal", label: "CO2e Total", type: "text" },
  { name: "fuelConsumedMt", label: "Fuel Consumed MT", type: "text" },
  { name: "emissionFactor", label: "Emission Factor", type: "text" },
  { name: "euMrvCompliance", label: "EU MRV Compliance", type: "checkbox" },
  { name: "imoDataCollection", label: "IMO Data Collection", type: "checkbox" },
  { name: "euEtsLiability", label: "EU ETS Liability", type: "text" },
  { name: "carbonIntensity", label: "Carbon Intensity", type: "text" },
  { name: "reductionTarget", label: "Reduction Target", type: "text" },
  { name: "reductionAchieved", label: "Reduction Achieved", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditCarbonEmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:edit")))
    redirect("/vessel-performance-efficiency/carbon-emissions");

  const { id } = await params;

  const record = await getCarbonEmission(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/vessel-performance-efficiency/carbon-emissions/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Carbon Emission
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VpeForm
          entityType="Carbon Emission"
          apiPath={`/api/v1/vessel-performance-efficiency/carbon-emissions/${id}`}
          fields={CARBON_EMISSION_FIELDS}
          initialData={{
            emissionType: record.emissionType,
            vesselId: record.vesselId ?? "",
            vesselName: record.vesselName ?? "",
            voyageId: record.voyageId ?? "",
            reportingPeriodStart: record.reportingPeriodStart
              ? record.reportingPeriodStart.toISOString()
              : "",
            reportingPeriodEnd: record.reportingPeriodEnd
              ? record.reportingPeriodEnd.toISOString()
              : "",
            totalCo2Mt: record.totalCo2Mt ?? "",
            totalCh4Mt: record.totalCh4Mt ?? "",
            totalN2oMt: record.totalN2oMt ?? "",
            co2eTotal: record.co2eTotal ?? "",
            fuelConsumedMt: record.fuelConsumedMt ?? "",
            emissionFactor: record.emissionFactor ?? "",
            euMrvCompliance: record.euMrvCompliance ?? false,
            imoDataCollection: record.imoDataCollection ?? false,
            euEtsLiability: record.euEtsLiability ?? "",
            carbonIntensity: record.carbonIntensity ?? "",
            reductionTarget: record.reductionTarget ?? "",
            reductionAchieved: record.reductionAchieved ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/vessel-performance-efficiency/carbon-emissions/${id}`}
        />
      </div>
    </div>
  );
}
