import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IotForm, type FieldConfig } from "@/components/real-time-iot-asset-tracking/iot-form";

const VESSEL_POSITION_FIELDS: FieldConfig[] = [
  {
    name: "positionType",
    label: "Position Type",
    type: "select",
    required: true,
    options: [
      { value: "ais_report", label: "AIS Report" },
      { value: "manual_position", label: "Manual Position" },
      { value: "satellite_fix", label: "Satellite Fix" },
      { value: "port_arrival", label: "Port Arrival" },
      { value: "port_departure", label: "Port Departure" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "vesselImo", label: "Vessel IMO", type: "text" },
  { name: "mmsi", label: "MMSI", type: "text" },
  { name: "latitude", label: "Latitude", type: "text" },
  { name: "longitude", label: "Longitude", type: "text" },
  { name: "courseOverGround", label: "Course Over Ground", type: "text" },
  { name: "speedOverGround", label: "Speed Over Ground", type: "text" },
  { name: "navStatus", label: "Nav Status", type: "text" },
  { name: "destination", label: "Destination", type: "text" },
  { name: "eta", label: "ETA", type: "datetime-local" },
  { name: "draught", label: "Draught", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewVesselPositionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "iot:create"))
  )
    redirect("/real-time-iot-asset-tracking/vessel-positions");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/real-time-iot-asset-tracking/vessel-positions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Vessel Position
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IotForm
          entityType="Vessel Position"
          apiPath="/api/v1/real-time-iot-asset-tracking/vessel-positions"
          fields={VESSEL_POSITION_FIELDS}
          returnPath="/real-time-iot-asset-tracking/vessel-positions"
        />
      </div>
    </div>
  );
}
