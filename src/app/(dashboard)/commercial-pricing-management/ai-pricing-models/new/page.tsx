import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

const fields: FieldConfig[] = [
  { name: "modelName", label: "Model Name", type: "text", required: true },
  { name: "modelCode", label: "Model Code", type: "text", required: true },
  {
    name: "modelType",
    label: "Model Type",
    type: "select",
    options: [
      { label: "Regression", value: "regression" },
      { label: "Classification", value: "classification" },
      { label: "Time Series", value: "time_series" },
      { label: "Ensemble", value: "ensemble" },
      { label: "Neural Network", value: "neural_network" },
    ],
  },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "trainingDataFrom", label: "Training Data From", type: "date" },
  { name: "trainingDataTo", label: "Training Data To", type: "date" },
  { name: "accuracy", label: "Accuracy", type: "number" },
  { name: "confidenceThreshold", label: "Confidence Threshold", type: "number" },
  { name: "predictedRate", label: "Predicted Rate", type: "number" },
  { name: "suggestedRate", label: "Suggested Rate", type: "number" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "isActive", label: "Active", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewAiPricingModelPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/commercial-pricing-management/ai-pricing-models"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">New AI Pricing Model</h1>
      </div>

      <CpmForm
        entityType="AI Pricing Model"
        fields={fields}
        apiPath="/api/v1/commercial-pricing-management/ai-pricing-models"
        returnPath="/commercial-pricing-management/ai-pricing-models"
      />
    </div>
  );
}
