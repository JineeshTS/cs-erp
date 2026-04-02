import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getOptimizationEngine } from "@/lib/transshipment-hub-management/service";
import { ThmForm, type FieldConfig } from "@/components/transshipment-hub-management/thm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditOptimizationEnginePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "thm:edit")))
    redirect("/transshipment-hub-management/optimization-engines");

  const currencyOpts = await getCurrencyOptions();

  const OPTIMIZATION_ENGINE_FIELDS: FieldConfig[] = [
    {
      name: "engineType",
      label: "Engine Type",
      type: "select",
      required: true,
      options: [
        { value: "connection_optimizer", label: "Connection Optimizer" },
        { value: "yard_allocation", label: "Yard Allocation" },
        { value: "vessel_pairing", label: "Vessel Pairing" },
        { value: "load_sequencing", label: "Load Sequencing" },
        { value: "dwell_minimizer", label: "Dwell Minimizer" },
      ],
    },
    { name: "hubPort", label: "Hub Port", type: "text" },
    { name: "scenarioName", label: "Scenario Name", type: "text" },
    { name: "currentCost", label: "Current Cost", type: "text" },
    { name: "optimizedCost", label: "Optimized Cost", type: "text" },
    { name: "savingsAmount", label: "Savings Amount", type: "text" },
    { name: "savingsPct", label: "Savings %", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "modelVersion", label: "Model Version", type: "text" },
    { name: "confidenceScore", label: "Confidence Score", type: "text" },
    { name: "accepted", label: "Accepted", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getOptimizationEngine(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/transshipment-hub-management/optimization-engines/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Optimization Engine
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ThmForm
          entityType="Optimization Engine"
          apiPath={`/api/v1/transshipment-hub-management/optimization-engines/${id}`}
          fields={OPTIMIZATION_ENGINE_FIELDS}
          initialData={{
            engineType: record.engineType,
            hubPort: record.hubPort ?? "",
            scenarioName: record.scenarioName ?? "",
            currentCost: record.currentCost ?? "",
            optimizedCost: record.optimizedCost ?? "",
            savingsAmount: record.savingsAmount ?? "",
            savingsPct: record.savingsPct ?? "",
            currency: record.currency ?? "",
            modelVersion: record.modelVersion ?? "",
            confidenceScore: record.confidenceScore ?? "",
            accepted: record.accepted ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/transshipment-hub-management/optimization-engines/${id}`}
        />
      </div>
    </div>
  );
}
