import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getShockDetection } from "@/lib/real-time-iot-asset-tracking/service";
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

export default async function EditShockDetectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:edit")))
    redirect("/real-time-iot-asset-tracking/shock-detections");

  const { id } = await params;

  const record = await getShockDetection(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/real-time-iot-asset-tracking/shock-detections/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Shock Detection
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IotForm
          entityType="Shock Detection"
          apiPath={`/api/v1/real-time-iot-asset-tracking/shock-detections/${id}`}
          fields={SHOCK_DETECTION_FIELDS}
          initialData={{
            detectionType: record.detectionType,
            containerNumber: record.containerNumber ?? "",
            shockIntensityG: record.shockIntensityG ?? "",
            tiltAngle: record.tiltAngle ?? "",
            vibrationFrequency: record.vibrationFrequency ?? "",
            duration: record.duration ?? "",
            thresholdExceeded: record.thresholdExceeded ?? false,
            severityLevel: record.severityLevel ?? "",
            latitude: record.latitude ?? "",
            longitude: record.longitude ?? "",
            sensorId: record.sensorId ?? "",
            cargoDescription: record.cargoDescription ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/real-time-iot-asset-tracking/shock-detections/${id}`}
        />
      </div>
    </div>
  );
}
