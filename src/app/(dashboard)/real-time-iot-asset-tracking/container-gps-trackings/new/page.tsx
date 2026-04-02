import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IotForm, type FieldConfig } from "@/components/real-time-iot-asset-tracking/iot-form";

const GPS_TRACKING_FIELDS: FieldConfig[] = [
  {
    name: "trackingType",
    label: "Tracking Type",
    type: "select",
    required: true,
    options: [
      { value: "real_time", label: "Real Time" },
      { value: "geofence_alert", label: "Geofence Alert" },
      { value: "route_deviation", label: "Route Deviation" },
      { value: "dwell_time", label: "Dwell Time" },
      { value: "milestone_update", label: "Milestone Update" },
    ],
  },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "latitude", label: "Latitude", type: "text" },
  { name: "longitude", label: "Longitude", type: "text" },
  { name: "altitude", label: "Altitude", type: "text" },
  { name: "speed", label: "Speed", type: "text" },
  { name: "heading", label: "Heading", type: "text" },
  { name: "locationName", label: "Location Name", type: "text" },
  { name: "geofenceId", label: "Geofence ID", type: "text" },
  { name: "deviceId", label: "Device ID", type: "text" },
  { name: "batteryLevel", label: "Battery Level", type: "text" },
  { name: "signalStrength", label: "Signal Strength", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewContainerGpsTrackingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "iot:create"))
  )
    redirect("/real-time-iot-asset-tracking/container-gps-trackings");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/real-time-iot-asset-tracking/container-gps-trackings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New GPS Tracking
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IotForm
          entityType="GPS Tracking"
          apiPath="/api/v1/real-time-iot-asset-tracking/container-gps-trackings"
          fields={GPS_TRACKING_FIELDS}
          returnPath="/real-time-iot-asset-tracking/container-gps-trackings"
        />
      </div>
    </div>
  );
}
