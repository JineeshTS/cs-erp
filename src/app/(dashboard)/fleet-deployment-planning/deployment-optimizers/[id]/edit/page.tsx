import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDeploymentOptimizer } from "@/lib/fleet-deployment-planning/service";
import { FdpForm } from "@/components/fleet-deployment-planning/fdp-form";
import type { FieldConfig } from "@/components/fleet-deployment-planning/fdp-form";

const DEPLOYMENT_OPTIMIZER_FIELDS: FieldConfig[] = [
  {
    name: "optimizerType",
    label: "Optimizer Type",
    type: "select",
    required: true,
    options: [
      { value: "profit_maximization", label: "Profit Maximization" },
      { value: "cost_minimization", label: "Cost Minimization" },
      { value: "utilization_optimization", label: "Utilization Optimization" },
      { value: "emission_reduction", label: "Emission Reduction" },
      { value: "balanced", label: "Balanced" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "scenarioName", label: "Scenario Name", type: "text" },
  { name: "objectiveFunction", label: "Objective Function", type: "text" },
  { name: "constraints", label: "Constraints", type: "textarea" },
  { name: "vesselCount", label: "Vessel Count", type: "number" },
  { name: "tradeCount", label: "Trade Count", type: "number" },
  { name: "optimalTce", label: "Optimal TCE", type: "number" },
  { name: "improvementPct", label: "Improvement %", type: "number" },
  { name: "aiRecommendation", label: "AI Recommendation", type: "textarea" },
  { name: "runDate", label: "Run Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDeploymentOptimizerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "fdp:edit")))
    redirect("/fleet-deployment-planning/deployment-optimizers");

  const { id } = await params;

  const optimizer = await getDeploymentOptimizer(session.tenantId, id);

  if (!optimizer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/fleet-deployment-planning/deployment-optimizers/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Optimizer</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FdpForm
          entityType="Deployment Optimizer"
          apiPath={`/api/v1/fleet-deployment-planning/deployment-optimizers/${id}`}
          fields={DEPLOYMENT_OPTIMIZER_FIELDS}
          initialData={{
            optimizerType: optimizer.optimizerType,
            title: optimizer.title,
            scenarioName: optimizer.scenarioName ?? "",
            objectiveFunction: optimizer.objectiveFunction ?? "",
            constraints: optimizer.constraints ?? "",
            vesselCount: optimizer.vesselCount ?? "",
            tradeCount: optimizer.tradeCount ?? "",
            optimalTce: optimizer.optimalTce ?? "",
            improvementPct: optimizer.improvementPct ?? "",
            aiRecommendation: optimizer.aiRecommendation ?? "",
            runDate: optimizer.runDate
              ? new Date(optimizer.runDate).toISOString().slice(0, 16)
              : "",
            notes: optimizer.notes ?? "",
          }}
          isEdit
          returnPath={`/fleet-deployment-planning/deployment-optimizers/${id}`}
        />
      </div>
    </div>
  );
}
