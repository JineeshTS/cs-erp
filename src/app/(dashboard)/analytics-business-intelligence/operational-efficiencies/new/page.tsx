import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewOperationalEfficiencyPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "analytics:create"))
  )
    redirect("/analytics-business-intelligence/operational-efficiencies");

  const currencyOpts = await getCurrencyOptions();

  const OPERATIONAL_EFFICIENCY_FIELDS: FieldConfig[] = [
    {
      name: "analyticsType",
      label: "Analytics Type",
      type: "select",
      required: true,
      options: [
        { value: "port_turnaround", label: "Port Turnaround" },
        { value: "container_dwell", label: "Container Dwell" },
        { value: "documentation_speed", label: "Documentation Speed" },
        { value: "equipment_utilization", label: "Equipment Utilization" },
      ],
    },
    { name: "entityName", label: "Entity Name", type: "text" },
    {
      name: "entityType",
      label: "Entity Type",
      type: "select",
      options: [
        { value: "vessel", label: "Vessel" },
        { value: "port", label: "Port" },
        { value: "terminal", label: "Terminal" },
        { value: "depot", label: "Depot" },
      ],
    },
    { name: "periodStart", label: "Period Start", type: "datetime-local" },
    { name: "periodEnd", label: "Period End", type: "datetime-local" },
    {
      name: "avgTurnaroundHours",
      label: "Avg Turnaround Hours",
      type: "number",
    },
    { name: "avgDwellTimeDays", label: "Avg Dwell Time (Days)", type: "number" },
    {
      name: "avgDocProcessingHours",
      label: "Avg Doc Processing Hours",
      type: "number",
    },
    {
      name: "equipmentUtilizationPct",
      label: "Equipment Utilization %",
      type: "number",
    },
    { name: "berthProductivity", label: "Berth Productivity", type: "number" },
    {
      name: "craneMovesPerHour",
      label: "Crane Moves Per Hour",
      type: "number",
    },
    {
      name: "truckTurnaroundMinutes",
      label: "Truck Turnaround (Minutes)",
      type: "number",
    },
    { name: "incidentCount", label: "Incident Count", type: "number" },
    { name: "delayCount", label: "Delay Count", type: "number" },
    { name: "delayHoursTotal", label: "Delay Hours Total", type: "number" },
    { name: "costPerTeu", label: "Cost Per TEU", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/operational-efficiencies"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Operational Efficiency Record
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Operational Efficiency"
          apiPath="/api/v1/analytics-business-intelligence/operational-efficiencies"
          fields={OPERATIONAL_EFFICIENCY_FIELDS}
          returnPath="/analytics-business-intelligence/operational-efficiencies"
        />
      </div>
    </div>
  );
}
