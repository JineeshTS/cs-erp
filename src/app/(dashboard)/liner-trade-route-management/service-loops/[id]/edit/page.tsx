import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getServiceLoop } from "@/lib/liner-trade-route-management/service";
import { LtrForm } from "@/components/liner-trade-route-management/ltr-form";
import type { FieldConfig } from "@/components/liner-trade-route-management/ltr-form";

const SERVICE_LOOP_FIELDS: FieldConfig[] = [
  { name: "loopName", label: "Loop Name", type: "text", required: true },
  { name: "loopCode", label: "Loop Code", type: "text", required: true },
  { name: "tradeRoute", label: "Trade Route", type: "text", required: true },
  {
    name: "direction",
    label: "Direction",
    type: "select",
    required: true,
    options: [
      { value: "eastbound", label: "Eastbound" },
      { value: "westbound", label: "Westbound" },
      { value: "northbound", label: "Northbound" },
      { value: "southbound", label: "Southbound" },
      { value: "pendulum", label: "Pendulum" },
      { value: "round_trip", label: "Round Trip" },
    ],
  },
  { name: "totalPorts", label: "Total Ports", type: "number", required: true },
  { name: "roundTripDays", label: "Round Trip Days", type: "number" },
  {
    name: "frequency",
    label: "Frequency",
    type: "select",
    required: true,
    options: [
      { value: "weekly", label: "Weekly" },
      { value: "biweekly", label: "Biweekly" },
      { value: "monthly", label: "Monthly" },
      { value: "fortnightly", label: "Fortnightly" },
      { value: "ten_day", label: "Ten Day" },
    ],
  },
  { name: "vesselCount", label: "Vessel Count", type: "number" },
  { name: "deployedCapacityTeu", label: "Deployed Capacity (TEU)", type: "number" },
  { name: "alliancePartner", label: "Alliance Partner", type: "text" },
  { name: "operatingCarrier", label: "Operating Carrier", type: "text" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditServiceLoopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:edit")))
    redirect("/liner-trade-route-management/service-loops");

  const { id } = await params;

  const loop = await getServiceLoop(id, session.tenantId);
  if (!loop) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/liner-trade-route-management/service-loops/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Service Loop
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LtrForm
          entityType="Service Loop"
          apiPath={`/api/v1/liner-trade-route-management/service-loops/${id}`}
          fields={SERVICE_LOOP_FIELDS}
          initialData={{
            loopName: loop.loopName,
            loopCode: loop.loopCode,
            tradeRoute: loop.tradeRoute,
            direction: loop.direction,
            totalPorts: loop.totalPorts,
            roundTripDays: loop.roundTripDays ?? "",
            frequency: loop.frequency,
            vesselCount: loop.vesselCount ?? "",
            deployedCapacityTeu: loop.deployedCapacityTeu ?? "",
            alliancePartner: loop.alliancePartner ?? "",
            operatingCarrier: loop.operatingCarrier ?? "",
            effectiveFrom: loop.effectiveFrom
              ? new Date(loop.effectiveFrom).toISOString()
              : "",
            effectiveTo: loop.effectiveTo
              ? new Date(loop.effectiveTo).toISOString()
              : "",
            notes: loop.notes ?? "",
          }}
          isEdit
          returnPath={`/liner-trade-route-management/service-loops/${id}`}
        />
      </div>
    </div>
  );
}
