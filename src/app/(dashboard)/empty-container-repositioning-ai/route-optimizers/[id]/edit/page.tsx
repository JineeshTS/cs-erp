import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getRouteOptimizer } from "@/lib/empty-container-repositioning-ai/service";
import {
  EcrForm,
  type FieldConfig,
} from "@/components/empty-container-repositioning-ai/ecr-form";

const fields: FieldConfig[] = [
  {
    name: "optimizerType",
    label: "Optimizer Type",
    type: "select",
    required: true,
    options: [
      { label: "Cost Minimization", value: "cost_minimization" },
      { label: "Time Minimization", value: "time_minimization" },
      { label: "Multi-Objective", value: "multi_objective" },
      { label: "Carbon Optimal", value: "carbon_optimal" },
      { label: "Network Flow", value: "network_flow" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "scenarioName", label: "Scenario Name", type: "text" },
  { name: "originPorts", label: "Origin Ports", type: "textarea" },
  { name: "destinationPorts", label: "Destination Ports", type: "textarea" },
  { name: "containerTypes", label: "Container Types", type: "textarea" },
  { name: "objectiveFunction", label: "Objective Function", type: "text" },
  { name: "totalSavings", label: "Total Savings", type: "text" },
  { name: "routeCount", label: "Route Count", type: "number" },
  {
    name: "aiRecommendation",
    label: "AI Recommendation",
    type: "textarea",
  },
  { name: "runDate", label: "Run Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditRouteOptimizerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:edit")))
    redirect("/");

  const { id } = await params;
  const routeOptimizer = await getRouteOptimizer(id, session.tenantId);
  if (!routeOptimizer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/empty-container-repositioning-ai/route-optimizers/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Route Optimizer
        </h1>
      </div>

      <div className="rounded-lg border p-6">
        <EcrForm
          entityType="route-optimizers"
          apiPath={`/api/v1/empty-container-repositioning-ai/route-optimizers/${id}`}
          fields={fields}
          initialData={routeOptimizer}
          isEdit
          returnPath={`/empty-container-repositioning-ai/route-optimizers/${id}`}
        />
      </div>
    </div>
  );
}
