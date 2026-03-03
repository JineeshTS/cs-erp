import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VpeForm } from "@/components/vessel-performance-efficiency/vpe-form";
import type { FieldConfig } from "@/components/vessel-performance-efficiency/vpe-form";

const SPEED_CONSUMPTION_FIELDS: FieldConfig[] = [
  {
    name: "consumptionType",
    label: "Consumption Type",
    type: "select",
    required: true,
    options: [
      { value: "laden", label: "Laden" },
      { value: "ballast", label: "Ballast" },
      { value: "port", label: "Port" },
      { value: "anchored", label: "Anchored" },
      { value: "canal_transit", label: "Canal Transit" },
    ],
  },
  { name: "vesselId", label: "Vessel ID", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageId", label: "Voyage ID", type: "text" },
  { name: "reportDate", label: "Report Date", type: "datetime-local" },
  { name: "speedOrdered", label: "Speed Ordered", type: "text" },
  { name: "speedActual", label: "Speed Actual", type: "text" },
  { name: "speedOverGround", label: "Speed Over Ground", type: "text" },
  { name: "fuelConsumedMt", label: "Fuel Consumed MT", type: "text" },
  { name: "fuelType", label: "Fuel Type", type: "text" },
  { name: "dailyConsumption", label: "Daily Consumption", type: "text" },
  { name: "distanceTraveled", label: "Distance Traveled", type: "text" },
  { name: "slipPercentage", label: "Slip Percentage", type: "text" },
  { name: "windForce", label: "Wind Force", type: "number" },
  { name: "seaState", label: "Sea State", type: "text" },
  { name: "currentFactor", label: "Current Factor", type: "text" },
  { name: "performanceIndex", label: "Performance Index", type: "text" },
  { name: "weatherImpact", label: "Weather Impact", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewSpeedConsumptionPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "vpe:create"))
  )
    redirect("/vessel-performance-efficiency/speed-consumptions");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-performance-efficiency/speed-consumptions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Speed Consumption
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VpeForm
          entityType="Speed Consumption"
          apiPath="/api/v1/vessel-performance-efficiency/speed-consumptions"
          fields={SPEED_CONSUMPTION_FIELDS}
          returnPath="/vessel-performance-efficiency/speed-consumptions"
        />
      </div>
    </div>
  );
}
