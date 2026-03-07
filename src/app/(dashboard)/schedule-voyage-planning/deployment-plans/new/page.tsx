import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { SvpForm, type FieldConfig } from "@/components/schedule-voyage-planning/svp-form";
import { getVesselOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewDeploymentPlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "svp:create"))
  )
    redirect("/schedule-voyage-planning/deployment-plans");

  const [vesselOpts, currencyOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "tradeRoute", label: "Trade Route", type: "text" },
    { name: "deploymentStart", label: "Deployment Start", type: "datetime-local" },
    { name: "deploymentEnd", label: "Deployment End", type: "datetime-local" },
    { name: "vesselCapacityTeu", label: "Vessel Capacity TEU", type: "number" },
    { name: "expectedUtilizationPct", label: "Expected Utilization %", type: "text" },
    { name: "dailyCostUsd", label: "Daily Cost USD", type: "text" },
    { name: "revenueProjection", label: "Revenue Projection", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/schedule-voyage-planning/deployment-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Deployment Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SvpForm
          entityType="Deployment Plan"
          apiPath="/api/v1/schedule-voyage-planning/deployment-plans"
          fields={DEPLOYMENT_PLAN_FIELDS}
          returnPath="/schedule-voyage-planning/deployment-plans"
        />
      </div>
    </div>
  );
}
