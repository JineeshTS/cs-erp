import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IotForm, type FieldConfig } from "@/components/real-time-iot-asset-tracking/iot-form";

const SHOCK_DETECTION_FIELDS: FieldConfig[] = [
  {
    name: "detectionType",
    label: "Detection Type",
    type: "select",
    required: true,
    options: [
      { value: "shock_event", label: "Shock Event" },
      { value: "tilt_alert", label: "Tilt Alert" },
      { value: "vibration_anomaly", label: "Vibration Anomaly" },
      { value: "drop_detection", label: "Drop Detection" },
      { value: "continuous_monitoring", label: "Continuous Monitoring" },
    ],
  },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "shockIntensityG", label: "Shock Intensity (G)", type: "text" },
  { name: "tiltAngle", label: "Tilt Angle", type: "text" },
  { name: "vibrationFrequency", label: "Vibration Frequency", type: "text" },
  { name: "duration", label: "Duration", type: "text" },
  { name: "thresholdExceeded", label: "Threshold Exceeded", type: "checkbox" },
  { name: "severityLevel", label: "Severity Level", type: "text" },
  { name: "latitude", label: "Latitude", type: "text" },
  { name: "longitude", label: "Longitude", type: "text" },
  { name: "sensorId", label: "Sensor ID", type: "text" },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewShockDetectionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "iot:create"))
  )
    redirect("/real-time-iot-asset-tracking/shock-detections");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/real-time-iot-asset-tracking/shock-detections"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Shock Detection
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IotForm
          entityType="Shock Detection"
          apiPath="/api/v1/real-time-iot-asset-tracking/shock-detections"
          fields={SHOCK_DETECTION_FIELDS}
          returnPath="/real-time-iot-asset-tracking/shock-detections"
        />
      </div>
    </div>
  );
}
