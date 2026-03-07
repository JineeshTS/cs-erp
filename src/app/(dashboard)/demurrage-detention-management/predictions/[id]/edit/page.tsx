import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDdmPrediction } from "@/lib/demurrage-detention-management/service";
import { DdmForm } from "@/components/demurrage-detention-management/ddm-form";
import type { FieldConfig } from "@/components/demurrage-detention-management/ddm-form";
import { getPortOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditPredictionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:edit")))
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

  const { id } = await params;

  const prediction = await getDdmPrediction(id, session.tenantId);
  if (!prediction) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/demurrage-detention-management/predictions/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Prediction</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Prediction"
          apiPath={`/api/v1/demurrage-detention-management/predictions/${id}`}
          fields={PREDICTION_FIELDS}
          initialData={{
            containerNumber: prediction.containerNumber ?? "",
            bookingRef: prediction.bookingRef ?? "",
            customerName: prediction.customerName ?? "",
            portName: prediction.portName ?? "",
            predictionType: prediction.predictionType ?? "",
            riskLevel: prediction.riskLevel ?? "",
            predictedDemurrageDays: prediction.predictedDemurrageDays ?? "",
            predictedDetentionDays: prediction.predictedDetentionDays ?? "",
            predictedAmount: prediction.predictedAmount ?? "",
            currency: prediction.currency ?? "",
            confidenceScore: prediction.confidenceScore ?? "",
            modelVersion: prediction.modelVersion ?? "",
            aiInsights: prediction.aiInsights ?? "",
            alertSent: prediction.alertSent ?? false,
            alertSentAt: prediction.alertSentAt
              ? new Date(prediction.alertSentAt).toISOString()
              : "",
            actualOutcome: prediction.actualOutcome ?? "",
            accuracy: prediction.accuracy ?? "",
            notes: prediction.notes ?? "",
          }}
          isEdit
          returnPath={`/demurrage-detention-management/predictions/${id}`}
        />
      </div>
    </div>
  );
}
