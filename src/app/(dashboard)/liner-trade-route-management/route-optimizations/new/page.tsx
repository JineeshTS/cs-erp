import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { LtrForm } from "@/components/liner-trade-route-management/ltr-form";
import type { FieldConfig } from "@/components/liner-trade-route-management/ltr-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewRouteOptimizationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:create")))
    redirect("/liner-trade-route-management/route-optimizations");

  const currencyOpts = await getCurrencyOptions();

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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "approvedByName", label: "Approved By", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-trade-route-management/route-optimizations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Route Optimization
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LtrForm
          entityType="Route Optimization"
          apiPath="/api/v1/liner-trade-route-management/route-optimizations"
          fields={OPTIMIZATION_FIELDS}
          initialData={{ currentRoute: [] }}
          returnPath="/liner-trade-route-management/route-optimizations"
        />
      </div>
    </div>
  );
}
