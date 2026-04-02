import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VpeForm } from "@/components/vessel-performance-efficiency/vpe-form";
import type { FieldConfig } from "@/components/vessel-performance-efficiency/vpe-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewWeatherRoutingPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "vpe:create"))
  )
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/vessel-performance-efficiency/weather-routings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Weather Routing
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VpeForm
          entityType="Weather Routing"
          apiPath="/api/v1/vessel-performance-efficiency/weather-routings"
          fields={WEATHER_ROUTING_FIELDS}
          returnPath="/vessel-performance-efficiency/weather-routings"
        />
      </div>
    </div>
  );
}
