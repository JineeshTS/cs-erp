import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";

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
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "speedKnots", label: "Speed (Knots)", type: "text" },
  { name: "fuelConsumptionMt", label: "Fuel Consumption (MT)", type: "text" },
  { name: "fuelCostPerDay", label: "Fuel Cost Per Day", type: "text" },
  { name: "timeSavingHours", label: "Time Saving (Hours)", type: "text" },
  { name: "co2EmissionsMt", label: "CO2 Emissions (MT)", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "optimalSpeed", label: "Optimal Speed", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewSpeedFuelAnalysisPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "svp:create"))
  )
    redirect("/schedule-voyage-planning/speed-fuel-analyses");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/schedule-voyage-planning/speed-fuel-analyses"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Speed Fuel Analysis
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Speed Fuel Analysis"
          apiPath="/api/v1/schedule-voyage-planning/speed-fuel-analyses"
          fields={SPEED_FUEL_ANALYSIS_FIELDS}
          returnPath="/schedule-voyage-planning/speed-fuel-analyses"
        />
      </div>
    </div>
  );
}
