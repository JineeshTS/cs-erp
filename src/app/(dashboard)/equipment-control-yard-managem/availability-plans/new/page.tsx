import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const AVAILABILITY_PLAN_FIELDS: FieldConfig[] = [
  { name: "planReference", label: "Plan Reference", type: "text", required: true },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "containerSize", label: "Container Size", type: "select", options: [
    { value: "20", label: "20ft" },
    { value: "40", label: "40ft" },
    { value: "45", label: "45ft" },
  ]},
  { name: "forecastPeriodStart", label: "Forecast Period Start", type: "datetime-local", required: true },
  { name: "forecastPeriodEnd", label: "Forecast Period End", type: "datetime-local", required: true },
  { name: "availableUnits", label: "Available Units", type: "number" },
  { name: "demandForecast", label: "Demand Forecast", type: "number" },
  { name: "surplusDeficit", label: "Surplus / Deficit", type: "number" },
  { name: "recommendedAction", label: "Recommended Action", type: "select", options: [
    { value: "reposition", label: "Reposition" },
    { value: "lease_in", label: "Lease In" },
    { value: "lease_out", label: "Lease Out" },
    { value: "hold", label: "Hold" },
  ]},
  { name: "aiConfidence", label: "AI Confidence", type: "number" },
  { name: "aiModel", label: "AI Model", type: "text" },
  { name: "executedAction", label: "Executed Action", type: "text" },
  { name: "executionDate", label: "Execution Date", type: "datetime-local" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "forecast", label: "Forecast" },
    { value: "approved", label: "Approved" },
    { value: "executing", label: "Executing" },
    { value: "completed", label: "Completed" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewAvailabilityPlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:create")))
    redirect("/equipment-control-yard-managem");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/availability-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Availability Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Availability Plan"
          apiPath="/api/v1/equipment-control-yard-managem/availability-plans"
          fields={AVAILABILITY_PLAN_FIELDS}
          returnPath="/equipment-control-yard-managem/availability-plans"
        />
      </div>
    </div>
  );
}
