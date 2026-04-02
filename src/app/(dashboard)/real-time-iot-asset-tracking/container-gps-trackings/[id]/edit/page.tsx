import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getContainerGpsTracking } from "@/lib/real-time-iot-asset-tracking/service";
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

export default async function EditContainerGpsTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:edit")))
    redirect("/real-time-iot-asset-tracking/container-gps-trackings");

  const { id } = await params;

  const record = await getContainerGpsTracking(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/real-time-iot-asset-tracking/container-gps-trackings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit GPS Tracking
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IotForm
          entityType="GPS Tracking"
          apiPath={`/api/v1/real-time-iot-asset-tracking/container-gps-trackings/${id}`}
          fields={GPS_TRACKING_FIELDS}
          initialData={{
            trackingType: record.trackingType,
            containerNumber: record.containerNumber ?? "",
            containerType: record.containerType ?? "",
            latitude: record.latitude ?? "",
            longitude: record.longitude ?? "",
            altitude: record.altitude ?? "",
            speed: record.speed ?? "",
            heading: record.heading ?? "",
            locationName: record.locationName ?? "",
            geofenceId: record.geofenceId ?? "",
            deviceId: record.deviceId ?? "",
            batteryLevel: record.batteryLevel ?? "",
            signalStrength: record.signalStrength ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/real-time-iot-asset-tracking/container-gps-trackings/${id}`}
        />
      </div>
    </div>
  );
}
