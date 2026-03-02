import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRouteOptimization } from "@/lib/liner-trade-route-management/service";
import { LtrForm } from "@/components/liner-trade-route-management/ltr-form";
import type { FieldConfig } from "@/components/liner-trade-route-management/ltr-form";

const OPTIMIZATION_FIELDS: FieldConfig[] = [
  { name: "tradeRoute", label: "Trade Route", type: "text", required: true },
  { name: "serviceLoopName", label: "Service Loop Name", type: "text" },
  {
    name: "optimizationType",
    label: "Optimization Type",
    type: "select",
    required: true,
    options: [
      { value: "speed", label: "Speed" },
      { value: "cost", label: "Cost" },
      { value: "emissions", label: "Emissions" },
      { value: "transit_time", label: "Transit Time" },
      { value: "multi_objective", label: "Multi-Objective" },
    ],
  },
  {
    name: "objectiveFunction",
    label: "Objective Function",
    type: "select",
    required: true,
    options: [
      { value: "minimize_cost", label: "Minimize Cost" },
      { value: "minimize_time", label: "Minimize Time" },
      { value: "minimize_emissions", label: "Minimize Emissions" },
      { value: "maximize_utilization", label: "Maximize Utilization" },
      { value: "balanced", label: "Balanced" },
    ],
  },
  { name: "modelVersion", label: "Model Version", type: "text" },
  { name: "estimatedSavings", label: "Estimated Savings", type: "text" },
  { name: "transitTimeImpact", label: "Transit Time Impact (hours)", type: "number" },
  { name: "capacityImpact", label: "Capacity Impact (%)", type: "number" },
  { name: "emissionsImpact", label: "Emissions Impact", type: "text" },
  { name: "confidenceScore", label: "Confidence Score", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "approvedByName", label: "Approved By", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditRouteOptimizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:edit")))
    redirect("/liner-trade-route-management/route-optimizations");

  const { id } = await params;

  const optimization = await getRouteOptimization(id, session.tenantId);
  if (!optimization) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/liner-trade-route-management/route-optimizations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Route Optimization
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LtrForm
          entityType="Route Optimization"
          apiPath={`/api/v1/liner-trade-route-management/route-optimizations/${id}`}
          fields={OPTIMIZATION_FIELDS}
          initialData={{
            tradeRoute: optimization.tradeRoute,
            serviceLoopName: optimization.serviceLoopName || "",
            optimizationType: optimization.optimizationType,
            objectiveFunction: optimization.objectiveFunction,
            modelVersion: optimization.modelVersion || "",
            estimatedSavings: optimization.estimatedSavings != null
              ? String(optimization.estimatedSavings)
              : "",
            transitTimeImpact: optimization.transitTimeImpact != null
              ? Number(optimization.transitTimeImpact)
              : "",
            capacityImpact: optimization.capacityImpact != null
              ? Number(optimization.capacityImpact)
              : "",
            emissionsImpact: optimization.emissionsImpact != null
              ? String(optimization.emissionsImpact)
              : "",
            confidenceScore: optimization.confidenceScore != null
              ? String(optimization.confidenceScore)
              : "",
            currency: optimization.currency || "",
            approvedByName: optimization.approvedByName || "",
            notes: optimization.notes || "",
            currentRoute: optimization.currentRoute ?? [],
          }}
          isEdit
          returnPath={`/liner-trade-route-management/route-optimizations/${id}`}
        />
      </div>
    </div>
  );
}
