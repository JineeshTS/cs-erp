import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getWeatherRouting } from "@/lib/schedule-voyage-planning/service";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";

const WEATHER_ROUTING_FIELDS: FieldConfig[] = [
  {
    name: "routingType",
    label: "Routing Type",
    type: "select",
    required: true,
    options: [
      { value: "optimal_route", label: "Optimal Route" },
      { value: "storm_avoidance", label: "Storm Avoidance" },
      { value: "current_utilization", label: "Current Utilization" },
      { value: "seasonal_planning", label: "Seasonal Planning" },
      { value: "heavy_weather_alert", label: "Heavy Weather Alert" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  { name: "departurePort", label: "Departure Port", type: "text" },
  { name: "arrivalPort", label: "Arrival Port", type: "text" },
  { name: "recommendedRoute", label: "Recommended Route", type: "textarea" },
  { name: "distanceNm", label: "Distance NM", type: "text" },
  { name: "weatherSeverity", label: "Weather Severity", type: "text" },
  { name: "waveHeightM", label: "Wave Height (m)", type: "text" },
  { name: "windSpeedKnots", label: "Wind Speed (knots)", type: "text" },
  { name: "routeProvider", label: "Route Provider", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditWeatherRoutingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "svp:edit")))
    redirect("/schedule-voyage-planning/weather-routings");

  const { id } = await params;

  const record = await getWeatherRouting(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/schedule-voyage-planning/weather-routings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Weather Routing
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Weather Routing"
          apiPath={`/api/v1/schedule-voyage-planning/weather-routings/${id}`}
          fields={WEATHER_ROUTING_FIELDS}
          initialData={{
            routingType: record.routingType,
            vesselName: record.vesselName ?? "",
            voyageRef: record.voyageRef ?? "",
            departurePort: record.departurePort ?? "",
            arrivalPort: record.arrivalPort ?? "",
            recommendedRoute: record.recommendedRoute ?? "",
            distanceNm: record.distanceNm ?? "",
            weatherSeverity: record.weatherSeverity ?? "",
            waveHeightM: record.waveHeightM ?? "",
            windSpeedKnots: record.windSpeedKnots ?? "",
            routeProvider: record.routeProvider ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/schedule-voyage-planning/weather-routings/${id}`}
        />
      </div>
    </div>
  );
}
