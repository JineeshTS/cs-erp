import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DdmForm } from "@/components/demurrage-detention-management/ddm-form";
import type { FieldConfig } from "@/components/demurrage-detention-management/ddm-form";
import { getPortOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewPredictionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "demurrage:create"))
  )
    redirect("/demurrage-detention-management/predictions");

  const [portOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const PREDICTION_FIELDS: FieldConfig[] = [
    { name: "containerNumber", label: "Container Number", type: "text", required: true },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    {
      name: "predictionType",
      label: "Prediction Type",
      type: "select",
      required: true,
      options: [
        { value: "demurrage", label: "Demurrage" },
        { value: "detention", label: "Detention" },
        { value: "combined", label: "Combined" },
      ],
    },
    {
      name: "riskLevel",
      label: "Risk Level",
      type: "select",
      required: true,
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
      ],
    },
    { name: "predictedDemurrageDays", label: "Predicted Demurrage Days", type: "number" },
    { name: "predictedDetentionDays", label: "Predicted Detention Days", type: "number" },
    { name: "predictedAmount", label: "Predicted Amount", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "confidenceScore", label: "Confidence Score", type: "text" },
    { name: "modelVersion", label: "Model Version", type: "text" },
    { name: "aiInsights", label: "AI Insights", type: "textarea" },
    { name: "alertSent", label: "Alert Sent", type: "checkbox" },
    { name: "alertSentAt", label: "Alert Sent At", type: "datetime-local" },
    { name: "actualOutcome", label: "Actual Outcome", type: "textarea" },
    { name: "accuracy", label: "Accuracy", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/demurrage-detention-management/predictions"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Prediction</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Prediction"
          apiPath="/api/v1/demurrage-detention-management/predictions"
          fields={PREDICTION_FIELDS}
          returnPath="/demurrage-detention-management/predictions"
        />
      </div>
    </div>
  );
}
