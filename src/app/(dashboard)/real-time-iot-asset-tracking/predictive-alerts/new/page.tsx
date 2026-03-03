import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  IotForm,
  type FieldConfig,
} from "@/components/real-time-iot-asset-tracking/iot-form";

const PREDICTIVE_ALERT_FIELDS: FieldConfig[] = [
  {
    name: "alertType",
    label: "Alert Type",
    type: "select",
    required: true,
    options: [
      { value: "predictive_failure", label: "Predictive Failure" },
      { value: "anomaly_detection", label: "Anomaly Detection" },
      { value: "threshold_breach", label: "Threshold Breach" },
      { value: "maintenance_due", label: "Maintenance Due" },
      { value: "pattern_alert", label: "Pattern Alert" },
    ],
  },
  { name: "assetType", label: "Asset Type", type: "text" },
  { name: "assetIdentifier", label: "Asset Identifier", type: "text" },
  { name: "alertSeverity", label: "Alert Severity", type: "text" },
  { name: "predictionConfidence", label: "Prediction Confidence", type: "text" },
  {
    name: "predictedFailureDate",
    label: "Predicted Failure Date",
    type: "datetime-local",
  },
  {
    name: "recommendedAction",
    label: "Recommended Action",
    type: "textarea",
  },
  { name: "estimatedCost", label: "Estimated Cost", type: "text" },
  { name: "costCurrency", label: "Cost Currency", type: "text" },
  { name: "acknowledged", label: "Acknowledged", type: "checkbox" },
  {
    name: "acknowledgedAt",
    label: "Acknowledged At",
    type: "datetime-local",
  },
  { name: "resolvedAt", label: "Resolved At", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPredictiveAlertPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "iot:create"))
  )
    redirect("/real-time-iot-asset-tracking/predictive-alerts");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/real-time-iot-asset-tracking/predictive-alerts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Predictive Alert
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IotForm
          entityType="Predictive Alert"
          apiPath="/api/v1/real-time-iot-asset-tracking/predictive-alerts"
          fields={PREDICTIVE_ALERT_FIELDS}
          returnPath="/real-time-iot-asset-tracking/predictive-alerts"
        />
      </div>
    </div>
  );
}
