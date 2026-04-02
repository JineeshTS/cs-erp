import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getAnomalyDetection } from "@/lib/costing-financial-management/service";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditAnomalyDetectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:edit")))
    redirect("/");


  const currencyOpts = await getCurrencyOptions();
  const { id } = await params;
  const anomaly = await getAnomalyDetection(id, session.tenantId);
  if (!anomaly) notFound();

  const fields: FieldConfig[] = [
    {
      name: "detectedEntity",
      label: "Detected Entity",
      type: "text",
      required: true,
    },
    { name: "entityRef", label: "Entity Ref", type: "text" },
    {
      name: "anomalyType",
      label: "Anomaly Type",
      type: "select",
      required: true,
      options: [
        { value: "cost_spike", label: "Cost Spike" },
        { value: "revenue_drop", label: "Revenue Drop" },
        { value: "margin_deviation", label: "Margin Deviation" },
        { value: "budget_overrun", label: "Budget Overrun" },
        { value: "unusual_pattern", label: "Unusual Pattern" },
        { value: "duplicate_entry", label: "Duplicate Entry" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "severity",
      label: "Severity",
      type: "select",
      required: true,
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
      ],
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    { name: "expectedAmount", label: "Expected Amount", type: "number" },
    { name: "actualAmount", label: "Actual Amount", type: "number" },
    { name: "deviationPercent", label: "Deviation %", type: "number" },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
    },
    { name: "aiConfidence", label: "AI Confidence (%)", type: "number" },
    { name: "modelVersion", label: "Model Version", type: "text" },
    {
      name: "suggestedAction",
      label: "Suggested Action",
      type: "textarea",
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const initialData: Record<string, unknown> = {
    detectedEntity: anomaly.detectedEntity,
    entityRef: anomaly.entityRef,
    anomalyType: anomaly.anomalyType,
    severity: anomaly.severity,
    currency: anomaly.currency,
    expectedAmount: anomaly.expectedAmount,
    actualAmount: anomaly.actualAmount,
    deviationPercent: anomaly.deviationPercent,
    description: anomaly.description,
    aiConfidence: anomaly.aiConfidence,
    modelVersion: anomaly.modelVersion,
    suggestedAction: anomaly.suggestedAction,
    notes: anomaly.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/costing-financial-management/anomaly-detections/${anomaly.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {anomaly.anomalyRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update anomaly detection details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Anomaly Detection"
          apiPath={`/api/v1/costing-financial-management/anomaly-detections/${anomaly.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/costing-financial-management/anomaly-detections"
        />
      </div>
    </div>
  );
}
