import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCostOptimization } from "@/lib/port-tariff-terminal-billing/service";
import {
  PttForm,
  type FieldConfig,
} from "@/components/port-tariff-terminal-billing/ptt-form";
import { getPortOptions } from "@/lib/lookups";

export default async function EditCostOptimizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ptt:edit")))
    redirect("/");

  const portOpts = await getPortOptions(session.tenantId);

  const OPTIMIZATION_FIELDS: FieldConfig[] = [
    {
      name: "optimizationType",
      label: "Optimization Type",
      type: "select",
      required: true,
      options: [
        { value: "route_optimization", label: "Route Optimization" },
        { value: "terminal_switch", label: "Terminal Switch" },
        { value: "timing_optimization", label: "Timing Optimization" },
        { value: "volume_discount", label: "Volume Discount" },
        { value: "negotiation_leverage", label: "Negotiation Leverage" },
      ],
    },
    { name: "portCode", label: "Port Code", type: "select", options: portOpts },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "currentCost", label: "Current Cost", type: "number" },
    { name: "optimizedCost", label: "Optimized Cost", type: "number" },
    { name: "projectedSavings", label: "Projected Savings", type: "number" },
    { name: "savingsPercentage", label: "Savings Percentage", type: "number" },
    { name: "optimizationCurrency", label: "Currency", type: "text" },
    { name: "confidenceScore", label: "Confidence Score", type: "number" },
    { name: "implementationDifficulty", label: "Implementation Difficulty", type: "text" },
    { name: "timelineWeeks", label: "Timeline (Weeks)", type: "number" },
    { name: "recommendation", label: "Recommendation", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;
  const record = await getCostOptimization(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/port-tariff-terminal-billing/cost-optimizations/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Cost Optimization
          </h1>
          <p className="text-sm text-muted-foreground">
            Update cost optimization details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <PttForm
          entityType="Cost Optimization"
          apiPath={`/api/v1/port-tariff-terminal-billing/cost-optimizations/${id}`}
          returnPath={`/port-tariff-terminal-billing/cost-optimizations/${id}`}
          fields={OPTIMIZATION_FIELDS}
          initialData={{
            optimizationType: record.optimizationType ?? "",
            portCode: record.portCode ?? "",
            portName: record.portName ?? "",
            currentCost: record.currentCost ?? "",
            optimizedCost: record.optimizedCost ?? "",
            projectedSavings: record.projectedSavings ?? "",
            savingsPercentage: record.savingsPercentage ?? "",
            optimizationCurrency: record.optimizationCurrency ?? "",
            confidenceScore: record.confidenceScore ?? "",
            implementationDifficulty: record.implementationDifficulty ?? "",
            timelineWeeks: record.timelineWeeks ?? "",
            recommendation: record.recommendation ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
        />
      </div>
    </div>
  );
}
