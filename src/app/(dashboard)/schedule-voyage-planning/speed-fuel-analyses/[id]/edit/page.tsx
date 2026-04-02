import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSpeedFuelAnalysis } from "@/lib/schedule-voyage-planning/service";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditSpeedFuelAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "svp:edit")))
    redirect("/schedule-voyage-planning/speed-fuel-analyses");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const SPEED_FUEL_ANALYSIS_FIELDS: FieldConfig[] = [
    {
      name: "analysisType",
      label: "Analysis Type",
      type: "select",
      required: true,
      options: [
        { value: "slow_steaming", label: "Slow Steaming" },
        { value: "eco_speed", label: "Eco Speed" },
        { value: "full_speed", label: "Full Speed" },
        { value: "variable_speed", label: "Variable Speed" },
        { value: "weather_adjusted", label: "Weather Adjusted" },
      ],
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    { name: "speedKnots", label: "Speed (Knots)", type: "text" },
    { name: "fuelConsumptionMt", label: "Fuel Consumption (MT)", type: "text" },
    { name: "fuelCostPerDay", label: "Fuel Cost Per Day", type: "text" },
    { name: "timeSavingHours", label: "Time Saving (Hours)", type: "text" },
    { name: "co2EmissionsMt", label: "CO2 Emissions (MT)", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "optimalSpeed", label: "Optimal Speed", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const record = await getSpeedFuelAnalysis(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/schedule-voyage-planning/speed-fuel-analyses/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Speed Fuel Analysis
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Speed Fuel Analysis"
          apiPath={`/api/v1/schedule-voyage-planning/speed-fuel-analyses/${id}`}
          fields={SPEED_FUEL_ANALYSIS_FIELDS}
          initialData={{
            analysisType: record.analysisType,
            vesselName: record.vesselName ?? "",
            voyageRef: record.voyageRef ?? "",
            speedKnots: record.speedKnots ?? "",
            fuelConsumptionMt: record.fuelConsumptionMt ?? "",
            fuelCostPerDay: record.fuelCostPerDay ?? "",
            timeSavingHours: record.timeSavingHours ?? "",
            co2EmissionsMt: record.co2EmissionsMt ?? "",
            currency: record.currency ?? "",
            optimalSpeed: record.optimalSpeed ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/schedule-voyage-planning/speed-fuel-analyses/${id}`}
        />
      </div>
    </div>
  );
}
