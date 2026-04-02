import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFleetOptimizer } from "@/lib/container-leasing-management/service";
import {
  ClmForm,
  type FieldConfig,
} from "@/components/container-leasing-management/clm-form";

const OPTIMIZER_FIELDS: FieldConfig[] = [
  {
    name: "optimizerType",
    label: "Optimizer Type",
    type: "select",
    options: [
      { value: "demand_forecast", label: "Demand Forecast" },
      { value: "fleet_sizing", label: "Fleet Sizing" },
      { value: "type_mix", label: "Type Mix" },
      { value: "regional_allocation", label: "Regional Allocation" },
      { value: "cost_optimization", label: "Cost Optimization" },
    ],
  },
  { name: "modelVersion", label: "Model Version", type: "text" },
  { name: "analysisDate", label: "Analysis Date", type: "datetime-local" },
  { name: "currentFleetSize", label: "Current Fleet Size", type: "number" },
  {
    name: "recommendedFleetSize",
    label: "Recommended Fleet Size",
    type: "number",
  },
  { name: "ownedContainers", label: "Owned Containers", type: "number" },
  { name: "leasedContainers", label: "Leased Containers", type: "number" },
  { name: "recommendedOwnedPct", label: "Recommended Owned %", type: "text" },
  {
    name: "recommendedLeasedPct",
    label: "Recommended Leased %",
    type: "text",
  },
  { name: "projectedSavings", label: "Projected Savings", type: "text" },
  { name: "utilizationTarget", label: "Utilization Target", type: "text" },
  { name: "confidenceScore", label: "Confidence Score", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditFleetOptimizerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "clm:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getFleetOptimizer(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/container-leasing-management/fleet-optimizers/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Fleet Optimizer
          </h1>
          <p className="text-sm text-muted-foreground">
            Update fleet optimizer details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <ClmForm
          entityType="Fleet Optimizer"
          apiPath={`/api/v1/container-leasing-management/fleet-optimizers/${id}`}
          returnPath={`/container-leasing-management/fleet-optimizers/${id}`}
          fields={OPTIMIZER_FIELDS}
          initialData={{
            optimizerType: record.optimizerType ?? "",
            modelVersion: record.modelVersion ?? "",
            analysisDate: record.analysisDate
              ? new Date(record.analysisDate).toISOString()
              : "",
            currentFleetSize: record.currentFleetSize ?? "",
            recommendedFleetSize: record.recommendedFleetSize ?? "",
            ownedContainers: record.ownedContainers ?? "",
            leasedContainers: record.leasedContainers ?? "",
            recommendedOwnedPct: record.recommendedOwnedPct ?? "",
            recommendedLeasedPct: record.recommendedLeasedPct ?? "",
            projectedSavings: record.projectedSavings ?? "",
            utilizationTarget: record.utilizationTarget ?? "",
            confidenceScore: record.confidenceScore ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
        />
      </div>
    </div>
  );
}
