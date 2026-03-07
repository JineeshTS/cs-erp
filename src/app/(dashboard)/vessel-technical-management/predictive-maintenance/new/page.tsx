import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VtmForm } from "@/components/vessel-technical-management/vtm-form";
import type { FieldConfig } from "@/components/vessel-technical-management/vtm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewPredictiveMaintenancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:create")))
    redirect("/");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const fields: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    {
      name: "equipmentCode",
      label: "Equipment Code",
      type: "text",
      required: true,
    },
    {
      name: "equipmentName",
      label: "Equipment Name",
      type: "text",
      required: true,
    },
    {
      name: "modelType",
      label: "Model Type",
      type: "select",
      required: true,
      options: [
        { value: "vibration_analysis", label: "Vibration Analysis" },
        { value: "oil_analysis", label: "Oil Analysis" },
        { value: "thermal", label: "Thermal" },
        { value: "performance_degradation", label: "Performance Degradation" },
        { value: "pattern_recognition", label: "Pattern Recognition" },
        { value: "custom", label: "Custom" },
      ],
    },
    { name: "modelVersion", label: "Model Version", type: "text" },
    {
      name: "predictionDate",
      label: "Prediction Date",
      type: "datetime-local",
      required: true,
    },
    {
      name: "predictedFailureDate",
      label: "Predicted Failure Date",
      type: "datetime-local",
    },
    { name: "confidenceScore", label: "Confidence Score", type: "number" },
    {
      name: "riskLevel",
      label: "Risk Level",
      type: "select",
      options: [
        { value: "critical", label: "Critical" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
    { name: "currentCondition", label: "Current Condition", type: "textarea" },
    { name: "aiInsights", label: "AI Insights", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/vessel-technical-management/predictive-maintenance"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          New Predictive Maintenance
        </h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <VtmForm
          entityType="Predictive Maintenance"
          apiPath="/api/v1/vessel-technical-management/predictive-maintenance"
          fields={fields}
          returnPath="/vessel-technical-management/predictive-maintenance"
        />
      </div>
    </div>
  );
}
