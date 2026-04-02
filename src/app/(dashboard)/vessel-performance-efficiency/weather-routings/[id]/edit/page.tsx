import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getWeatherRouting } from "@/lib/vessel-performance-efficiency/service";
import { VpeForm } from "@/components/vessel-performance-efficiency/vpe-form";
import type { FieldConfig } from "@/components/vessel-performance-efficiency/vpe-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditWeatherRoutingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:edit")))
    redirect("/vessel-performance-efficiency/weather-routings");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const WEATHER_ROUTING_FIELDS: FieldConfig[] = [
    {
      name: "routingType",
      label: "Routing Type",
      type: "select",
      required: true,
      options: [
        { value: "optimized", label: "Optimized" },
        { value: "standard", label: "Standard" },
        { value: "shortest", label: "Shortest" },
        { value: "safest", label: "Safest" },
        { value: "eco", label: "Eco" },
      ],
    },
    { name: "vesselId", label: "Vessel ID", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageId", label: "Voyage ID", type: "text" },
    { name: "departurePort", label: "Departure Port", type: "text" },
    { name: "arrivalPort", label: "Arrival Port", type: "text" },
    { name: "departureDate", label: "Departure Date", type: "datetime-local" },
    { name: "arrivalDate", label: "Arrival Date", type: "datetime-local" },
    { name: "optimizedEta", label: "Optimized ETA", type: "datetime-local" },
    { name: "totalDistanceNm", label: "Total Distance NM", type: "text" },
    { name: "estimatedFuelMt", label: "Estimated Fuel MT", type: "text" },
    { name: "fuelSavingMt", label: "Fuel Saving MT", type: "text" },
    { name: "timeSavingHours", label: "Time Saving Hours", type: "text" },
    { name: "riskAssessment", label: "Risk Assessment", type: "text" },
    { name: "confidenceScore", label: "Confidence Score", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getWeatherRouting(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/vessel-performance-efficiency/weather-routings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Weather Routing
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VpeForm
          entityType="Weather Routing"
          apiPath={`/api/v1/vessel-performance-efficiency/weather-routings/${id}`}
          fields={WEATHER_ROUTING_FIELDS}
          initialData={{
            routingType: record.routingType,
            vesselId: record.vesselId ?? "",
            vesselName: record.vesselName ?? "",
            voyageId: record.voyageId ?? "",
            departurePort: record.departurePort ?? "",
            arrivalPort: record.arrivalPort ?? "",
            departureDate: record.departureDate
              ? record.departureDate.toISOString()
              : "",
            arrivalDate: record.arrivalDate
              ? record.arrivalDate.toISOString()
              : "",
            optimizedEta: record.optimizedEta
              ? record.optimizedEta.toISOString()
              : "",
            totalDistanceNm: record.totalDistanceNm ?? "",
            estimatedFuelMt: record.estimatedFuelMt ?? "",
            fuelSavingMt: record.fuelSavingMt ?? "",
            timeSavingHours: record.timeSavingHours ?? "",
            riskAssessment: record.riskAssessment ?? "",
            confidenceScore: record.confidenceScore ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/vessel-performance-efficiency/weather-routings/${id}`}
        />
      </div>
    </div>
  );
}
