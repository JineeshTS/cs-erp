import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getDeploymentPlan } from "@/lib/schedule-voyage-planning/service";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";

const DEPLOYMENT_PLAN_FIELDS: FieldConfig[] = [
  {
    name: "planType",
    label: "Plan Type",
    type: "select",
    required: true,
    options: [
      { value: "annual_deployment", label: "Annual Deployment" },
      { value: "seasonal_adjustment", label: "Seasonal Adjustment" },
      { value: "fleet_rebalancing", label: "Fleet Rebalancing" },
      { value: "newbuild_allocation", label: "Newbuild Allocation" },
      { value: "charter_strategy", label: "Charter Strategy" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "tradeRoute", label: "Trade Route", type: "text" },
  { name: "deploymentStart", label: "Deployment Start", type: "datetime-local" },
  { name: "deploymentEnd", label: "Deployment End", type: "datetime-local" },
  { name: "vesselCapacityTeu", label: "Vessel Capacity TEU", type: "number" },
  { name: "expectedUtilizationPct", label: "Expected Utilization %", type: "text" },
  { name: "dailyCostUsd", label: "Daily Cost USD", type: "text" },
  { name: "revenueProjection", label: "Revenue Projection", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDeploymentPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "svp:edit")))
    redirect("/schedule-voyage-planning/deployment-plans");

  const { id } = await params;

  const record = await getDeploymentPlan(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/schedule-voyage-planning/deployment-plans/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Deployment Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Deployment Plan"
          apiPath={`/api/v1/schedule-voyage-planning/deployment-plans/${id}`}
          fields={DEPLOYMENT_PLAN_FIELDS}
          initialData={{
            planType: record.planType,
            vesselName: record.vesselName ?? "",
            tradeRoute: record.tradeRoute ?? "",
            deploymentStart: record.deploymentStart ? record.deploymentStart.toISOString().slice(0, 16) : "",
            deploymentEnd: record.deploymentEnd ? record.deploymentEnd.toISOString().slice(0, 16) : "",
            vesselCapacityTeu: record.vesselCapacityTeu ?? "",
            expectedUtilizationPct: record.expectedUtilizationPct ?? "",
            dailyCostUsd: record.dailyCostUsd ?? "",
            revenueProjection: record.revenueProjection ?? "",
            currency: record.currency ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/schedule-voyage-planning/deployment-plans/${id}`}
        />
      </div>
    </div>
  );
}
