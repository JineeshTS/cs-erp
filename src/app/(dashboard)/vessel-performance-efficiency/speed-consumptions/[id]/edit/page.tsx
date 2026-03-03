import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSpeedConsumption } from "@/lib/vessel-performance-efficiency/service";
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

export default async function EditSpeedConsumptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:edit")))
    redirect("/vessel-performance-efficiency/speed-consumptions");

  const { id } = await params;

  const record = await getSpeedConsumption(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/vessel-performance-efficiency/speed-consumptions/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Speed Consumption
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VpeForm
          entityType="Speed Consumption"
          apiPath={`/api/v1/vessel-performance-efficiency/speed-consumptions/${id}`}
          fields={SPEED_CONSUMPTION_FIELDS}
          initialData={{
            consumptionType: record.consumptionType,
            vesselId: record.vesselId ?? "",
            vesselName: record.vesselName ?? "",
            voyageId: record.voyageId ?? "",
            reportDate: record.reportDate
              ? record.reportDate.toISOString()
              : "",
            speedOrdered: record.speedOrdered ?? "",
            speedActual: record.speedActual ?? "",
            speedOverGround: record.speedOverGround ?? "",
            fuelConsumedMt: record.fuelConsumedMt ?? "",
            fuelType: record.fuelType ?? "",
            dailyConsumption: record.dailyConsumption ?? "",
            distanceTraveled: record.distanceTraveled ?? "",
            slipPercentage: record.slipPercentage ?? "",
            windForce: record.windForce ?? "",
            seaState: record.seaState ?? "",
            currentFactor: record.currentFactor ?? "",
            performanceIndex: record.performanceIndex ?? "",
            weatherImpact: record.weatherImpact ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/vessel-performance-efficiency/speed-consumptions/${id}`}
        />
      </div>
    </div>
  );
}
