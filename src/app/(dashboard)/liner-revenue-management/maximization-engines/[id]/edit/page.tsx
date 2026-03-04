import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getMaximizationEngine } from "@/lib/liner-revenue-management/service";
import { LrmForm, type FieldConfig } from "@/components/liner-revenue-management/lrm-form";

const MAXIMIZATION_ENGINE_FIELDS: FieldConfig[] = [
  {
    name: "engineType",
    label: "Engine Type",
    type: "select",
    required: true,
    options: [
      { value: "dynamic_pricing", label: "Dynamic Pricing" },
      { value: "overbooking_optimization", label: "Overbooking Optimization" },
      { value: "cargo_allocation", label: "Cargo Allocation" },
      { value: "surcharge_optimization", label: "Surcharge Optimization" },
      { value: "bundle_pricing", label: "Bundle Pricing" },
    ],
  },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "modelName", label: "Model Name", type: "text" },
  { name: "modelVersion", label: "Model Version", type: "text" },
  { name: "recommendedRate", label: "Recommended Rate", type: "text" },
  { name: "currentRate", label: "Current Rate", type: "text" },
  { name: "upliftPct", label: "Uplift %", type: "text" },
  { name: "confidenceScore", label: "Confidence Score", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "simulationRunAt", label: "Simulation Run At", type: "datetime-local" },
  { name: "acceptedRecommendation", label: "Accepted Recommendation", type: "checkbox" },
  { name: "revenueImpact", label: "Revenue Impact", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditMaximizationEnginePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lrm:edit")))
    redirect("/liner-revenue-management/maximization-engines");

  const { id } = await params;

  const record = await getMaximizationEngine(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/liner-revenue-management/maximization-engines/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Maximization Engine
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="Maximization Engine"
          apiPath={`/api/v1/liner-revenue-management/maximization-engines/${id}`}
          fields={MAXIMIZATION_ENGINE_FIELDS}
          initialData={{
            engineType: record.engineType,
            tradeLane: record.tradeLane ?? "",
            modelName: record.modelName ?? "",
            modelVersion: record.modelVersion ?? "",
            recommendedRate: record.recommendedRate ?? "",
            currentRate: record.currentRate ?? "",
            upliftPct: record.upliftPct ?? "",
            confidenceScore: record.confidenceScore ?? "",
            currency: record.currency ?? "",
            simulationRunAt: record.simulationRunAt ? record.simulationRunAt.toISOString().slice(0, 16) : "",
            acceptedRecommendation: record.acceptedRecommendation ?? false,
            revenueImpact: record.revenueImpact ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/liner-revenue-management/maximization-engines/${id}`}
        />
      </div>
    </div>
  );
}
