import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ThmForm, type FieldConfig } from "@/components/transshipment-hub-management/thm-form";

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
  { name: "currency", label: "Currency", type: "text" },
  { name: "modelVersion", label: "Model Version", type: "text" },
  { name: "confidenceScore", label: "Confidence Score", type: "text" },
  { name: "accepted", label: "Accepted", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewOptimizationEnginePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "thm:create"))
  )
    redirect("/transshipment-hub-management/optimization-engines");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/transshipment-hub-management/optimization-engines"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Optimization Engine
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ThmForm
          entityType="Optimization Engine"
          apiPath="/api/v1/transshipment-hub-management/optimization-engines"
          fields={OPTIMIZATION_ENGINE_FIELDS}
          returnPath="/transshipment-hub-management/optimization-engines"
        />
      </div>
    </div>
  );
}
