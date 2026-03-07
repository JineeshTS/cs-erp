import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmAiPricingModels } from "@/db/schema";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditAiPricingModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const currencyOpts = await getCurrencyOptions();

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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "isActive", label: "Active", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [item] = await db
    .select()
    .from(cpmAiPricingModels)
    .where(
      and(
        eq(cpmAiPricingModels.id, id),
        eq(cpmAiPricingModels.tenantId, session.tenantId),
        isNull(cpmAiPricingModels.deletedAt)
      )
    )
    .limit(1);

  if (!item) notFound();

  const defaultValues: Record<string, string> = {};
  for (const field of fields) {
    const val = item[field.name as keyof typeof item];
    if (val !== null && val !== undefined) {
      if (field.type === "checkbox") {
        defaultValues[field.name] = val ? "true" : "false";
      } else if (val instanceof Date) {
        defaultValues[field.name] = field.type === "date"
          ? val.toISOString().split("T")[0]
          : val.toISOString().slice(0, 16);
      } else {
        defaultValues[field.name] = String(val);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/commercial-pricing-management/ai-pricing-models/${id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">Edit AI Pricing Model</h1>
      </div>

      <CpmForm
        entityType="AI Pricing Model"
        fields={fields}
        apiPath={`/api/v1/commercial-pricing-management/ai-pricing-models/${id}`}
        returnPath="/commercial-pricing-management/ai-pricing-models"
        initialData={defaultValues}
        isEdit
      />
    </div>
  );
}
