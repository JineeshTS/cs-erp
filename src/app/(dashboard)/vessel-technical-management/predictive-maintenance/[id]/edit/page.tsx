import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPredictiveMaintenance } from "@/lib/vessel-technical-management/service";
import { VtmForm } from "@/components/vessel-technical-management/vtm-form";
import type { FieldConfig } from "@/components/vessel-technical-management/vtm-form";

const fields: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
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

export default async function EditPredictiveMaintenancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getPredictiveMaintenance(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/vessel-technical-management/predictive-maintenance/${record.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Edit {record.predictionRef}
        </h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <VtmForm
          entityType="Predictive Maintenance"
          apiPath={`/api/v1/vessel-technical-management/predictive-maintenance/${record.id}`}
          fields={fields}
          initialData={record as unknown as Record<string, unknown>}
          isEdit
          returnPath={`/vessel-technical-management/predictive-maintenance/${record.id}`}
        />
      </div>
    </div>
  );
}
